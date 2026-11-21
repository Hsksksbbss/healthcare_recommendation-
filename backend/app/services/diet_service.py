import json
import re
from enum import Enum
from typing import Any

from google.genai import types
from pydantic import BaseModel, Field, ValidationError

from app.services.gemini_service import (
    InvalidGeminiResponseError,
    classify_gemini_error,
    get_gemini_client_and_model,
    logger,
)


class DietaryPreference(str, Enum):
    VEGETARIAN = "Vegetarian"
    EGGETARIAN = "Eggetarian"
    NON_VEGETARIAN = "Non-vegetarian"
    VEGAN = "Vegan"


class ActivityLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"


class FoodBudget(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class DietRequest(BaseModel):
    age: int = Field(ge=1, le=120)
    gender: str = Field(min_length=1, max_length=100)
    existing_medical_conditions: str | None = Field(default=None, max_length=2000)
    food_allergies: str = Field(min_length=1, max_length=2000)
    current_medications: str | None = Field(default=None, max_length=2000)
    health_concerns: str = Field(min_length=1, max_length=5000)
    dietary_preference: DietaryPreference
    foods_disliked: str | None = Field(default=None, max_length=2000)
    daily_activity_level: ActivityLevel
    number_of_meals_per_day: int = Field(ge=2, le=6)
    dietary_goals: str = Field(min_length=1, max_length=2000)
    food_budget: FoodBudget = FoodBudget.MODERATE


class NutritionEstimate(BaseModel):
    calories_kcal: int = Field(ge=0, le=5000)
    protein_g: float = Field(ge=0, le=500)
    carbohydrates_g: float = Field(ge=0, le=800)
    fat_g: float = Field(ge=0, le=300)


class MealRecommendation(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    portion: str = Field(min_length=1, max_length=300)
    estimated_nutrition: NutritionEstimate


class DailyMealSchedule(BaseModel):
    breakfast: MealRecommendation
    snacks: list[MealRecommendation] = Field(max_length=2)
    lunch: MealRecommendation
    dinner: MealRecommendation
    estimated_daily_nutrition: NutritionEstimate


class DietRecommendation(BaseModel):
    daily_meal_schedule: DailyMealSchedule
    foods_to_include: list[str] = Field(min_length=1, max_length=20)
    foods_to_limit: list[str] = Field(min_length=1, max_length=20)
    hydration_guidance: str = Field(min_length=1, max_length=1000)
    professional_supervision_warning: str = Field(min_length=1, max_length=2000)
    estimated_values_notice: str = (
        "Nutrition values are approximate estimates, not medically calculated values."
    )


DIET_SUPERVISION_TERMS = (
    "diabetes",
    "kidney",
    "renal",
    "dialysis",
    "liver disease",
    "pregnant",
    "pregnancy",
    "eating disorder",
    "warfarin",
    "insulin",
    "blood thinner",
)

UNSAFE_GOAL_TERMS = (
    "crash diet",
    "starve",
    "fasting",
    "water fast",
    "lose weight quickly",
    "lose weight fast",
)


class UnsafeDietRequestError(Exception):
    """Raised when a diet request requires safer handling before generation."""


class UnsafeGeneratedDietError(Exception):
    """Raised when a generated recommendation fails deterministic safety checks."""

    def __init__(self, category: str, message: str) -> None:
        super().__init__(message)
        self.category = category


def _combined_text(request: DietRequest) -> str:
    return " ".join(
        value
        for value in (
            request.existing_medical_conditions,
            request.current_medications,
            request.health_concerns,
            request.dietary_goals,
        )
        if value
    ).casefold()


def _requires_supervision(request: DietRequest) -> bool:
    return any(term in _combined_text(request) for term in DIET_SUPERVISION_TERMS)


def _has_reported_allergy(request: DietRequest) -> bool:
    return request.food_allergies.casefold().strip() not in {"none", "no", "no known allergies"}


def _validate_diet_safety(request: DietRequest) -> None:
    goals = request.dietary_goals.casefold()
    if any(term in goals for term in UNSAFE_GOAL_TERMS):
        raise UnsafeDietRequestError(
            "Extreme dieting and fasting plans are not supported. "
            "Please choose a sustainable goal and consult a qualified professional."
        )


def _build_prompt(request: DietRequest, supervision_required: bool) -> str:
    supervision_instruction = (
        "The reported information may require professional supervision. Include a clear "
        "warning to consult a registered dietitian or qualified healthcare professional."
        if supervision_required
        else "Include a brief reminder to consult a professional for individualized medical advice."
    )
    budget_instruction = {
        FoodBudget.LOW: (
            "Prioritize affordable, commonly available foods, simple ingredients and "
            "economical meal combinations. Do not claim exact prices or guaranteed costs."
        ),
        FoodBudget.MODERATE: (
            "Provide balanced variety with reasonable ingredient costs. Do not claim "
            "exact prices or guaranteed costs."
        ),
        FoodBudget.HIGH: (
            "Allow more ingredient variety and flexibility while keeping the plan practical. "
            "Do not claim exact prices or guaranteed costs."
        ),
    }[request.food_budget]
    return f"""
Create a cautious, practical food-planning guide from this health information.
This is general educational guidance, not a diagnosis or medically calculated diet.

Return only JSON matching the requested response schema. Include breakfast, snacks,
lunch and dinner. Use the requested meal count to decide whether to include one or
two snacks, but never omit the named meal categories.

All nutrition values must be clearly treated as approximate estimates. Do not prescribe
medicines or supplements. Do not recommend fasting, crash diets, extreme calorie
restriction, unsafe weight-loss targets, or disease treatment. Never include the
reported food allergies in meals or foods_to_include. Respect the dietary preference,
disliked foods, medical conditions and medications. {budget_instruction}
{supervision_instruction}

Assessment:
{request.model_dump(mode="json")}
""".strip()


def _recommendation_text(recommendation: DietRecommendation) -> str:
    meals: list[MealRecommendation] = [
        recommendation.daily_meal_schedule.breakfast,
        *recommendation.daily_meal_schedule.snacks,
        recommendation.daily_meal_schedule.lunch,
        recommendation.daily_meal_schedule.dinner,
    ]
    return " ".join(
        [
            *(f"{meal.name} {meal.portion}" for meal in meals),
            *(food for food in recommendation.foods_to_include),
        ]
    ).casefold()


def _validate_model_safety(
    request: DietRequest, recommendation: DietRecommendation
) -> DietRecommendation:
    estimated_calories = recommendation.daily_meal_schedule.estimated_daily_nutrition.calories_kcal
    if estimated_calories < 800:
        logger.warning("Generated diet safety rejection: category=calorie_safety_review")
        raise UnsafeGeneratedDietError(
            "calorie_safety_review",
            "The generated calorie estimate is too low for safe general guidance.",
        )
    if estimated_calories < 1200:
        logger.warning("Generated diet safety review: category=calorie_safety_review")
        recommendation.professional_supervision_warning = (
            "Because calorie needs cannot be safely established from this assessment alone, "
            "consult a registered dietitian or qualified healthcare professional before "
            "following this plan."
        )

    text = _recommendation_text(recommendation)
    if any(
        term in text
        for term in (
            "fasting",
            "water fast",
            "skip meals",
            "skipping meals",
            "detox",
            "starve",
        )
    ):
        logger.warning(
            "Generated diet safety rejection: category=unsafe_fast_or_detox_language"
        )
        raise UnsafeGeneratedDietError(
            "unsafe_fast_or_detox_language",
            "The generated plan contains unsafe fasting, detox, or meal-skipping guidance.",
        )

    if _has_reported_allergy(request):
        allergies = [
            allergy.strip().casefold()
            for allergy in request.food_allergies.replace(";", ",").split(",")
            if len(allergy.strip()) >= 3
        ]
        if any(allergy in text for allergy in allergies):
            logger.warning("Generated diet safety rejection: category=allergy_match")
            raise UnsafeGeneratedDietError(
                "allergy_match",
                "The generated plan may include a reported food allergy.",
            )

    if _requires_supervision(request):
        recommendation.professional_supervision_warning = (
            "Because of the reported health information or medication, consult a "
            "registered dietitian or qualified healthcare professional before making "
            "major dietary changes."
        )

    return recommendation


def _extract_json_text(text: str) -> str:
    stripped = text.strip()
    fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", stripped, flags=re.IGNORECASE | re.DOTALL)
    if fenced:
        return fenced.group(1).strip()

    start = stripped.find("{")
    end = stripped.rfind("}")
    if start >= 0 and end > start:
        return stripped[start : end + 1]
    return stripped


def _parse_diet_response(response: Any) -> DietRecommendation:
    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, DietRecommendation):
        return parsed
    if isinstance(parsed, dict):
        return DietRecommendation.model_validate(parsed)

    text = getattr(response, "text", None)
    if not text:
        raise ValueError("Gemini returned an empty response.")
    return DietRecommendation.model_validate_json(_extract_json_text(text))


def _validation_summary(exc: Exception) -> str:
    if isinstance(exc, ValidationError):
        errors = exc.errors()
        if any(error.get("type") == "json_invalid" for error in errors):
            return "invalid_json"
        fields = [".".join(str(part) for part in error["loc"]) for error in errors]
        if not fields:
            return "invalid_response_schema"
        return "invalid_fields=" + ",".join(fields[:10])
    if isinstance(exc, json.JSONDecodeError):
        return "invalid_json"
    return f"parse_error={type(exc).__name__}"


def _corrective_prompt(request: DietRequest, supervision_required: bool) -> str:
    return (
        _build_prompt(request, supervision_required)
        + "\n\nYour previous output did not validate. Return one complete JSON object only. "
        "Use every field in the response schema exactly, including nested nutrition fields. "
        "Do not use Markdown fences, commentary, or alternate field names."
    )


def _request_diet_response(
    client: Any,
    model: str,
    prompt: str,
    temperature: float,
) -> Any:
    try:
        return client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                response_mime_type="application/json",
                response_schema=DietRecommendation,
            ),
        )
    except Exception as exc:
        classified_error = classify_gemini_error(exc)
        logger.exception(
            "Gemini diet request failed: category=%s exception_type=%s",
            type(classified_error).__name__,
            type(exc).__name__,
        )
        raise classified_error from exc


def generate_diet_recommendation(request: DietRequest) -> DietRecommendation:
    _validate_diet_safety(request)
    supervision_required = _requires_supervision(request)

    client, model = get_gemini_client_and_model()
    response = _request_diet_response(
        client,
        model,
        _build_prompt(request, supervision_required),
        temperature=0.2,
    )

    try:
        recommendation = _parse_diet_response(response)
    except (ValidationError, ValueError, json.JSONDecodeError) as first_error:
        logger.warning(
            "Gemini diet response validation failed; retrying once: %s",
            _validation_summary(first_error),
        )
        try:
            response = _request_diet_response(
                client,
                model,
                _corrective_prompt(request, supervision_required),
                temperature=0.1,
            )
            recommendation = _parse_diet_response(response)
        except (ValidationError, ValueError, json.JSONDecodeError) as second_error:
            logger.warning(
                "Gemini diet response remained invalid after corrective retry: %s",
                _validation_summary(second_error),
            )
            raise InvalidGeminiResponseError(
                "Gemini returned an invalid diet recommendation after retrying."
            ) from second_error

    return _validate_model_safety(request, recommendation)
