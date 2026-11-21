import logging
import os
from enum import Enum
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)


class HealthAssessmentRequest(BaseModel):
    age: int = Field(ge=1, le=120)
    gender: str = Field(min_length=1, max_length=100)
    height: float | None = Field(default=None, gt=0)
    weight: float | None = Field(default=None, gt=0)
    existing_medical_conditions: str | None = Field(default=None, max_length=2000)
    allergies: str | None = Field(default=None, max_length=2000)
    current_medications: str | None = Field(default=None, max_length=2000)
    health_concern: str = Field(min_length=10, max_length=5000)
    symptom_duration: str = Field(min_length=1, max_length=200)
    severity: str = Field(min_length=1, max_length=50)
    additional: str | None = Field(default=None, max_length=2000)


class HealthGuidanceRequest(BaseModel):
    age: int = Field(ge=1, le=120)
    gender: str | None = Field(default=None, max_length=100)
    health_concern: str = Field(min_length=10, max_length=5000)
    symptom_duration: str = Field(min_length=1, max_length=200)
    severity: str = Field(min_length=1, max_length=50)
    existing_medical_conditions: str | None = Field(default=None, max_length=2000)
    allergies: str | None = Field(default=None, max_length=2000)
    current_medications: str | None = Field(default=None, max_length=2000)
    additional: str | None = Field(default=None, max_length=2000)


class UrgencyCategory(str, Enum):
    ROUTINE = "routine"
    PROMPT = "prompt"
    EMERGENCY = "emergency"


class SpecialtyRecommendation(BaseModel):
    recommended_specialty: str = Field(min_length=1, max_length=200)
    explanation: str = Field(min_length=1, max_length=2000)
    suggested_next_step: str = Field(min_length=1, max_length=2000)
    urgency: UrgencyCategory
    safety_notice: str = Field(default="", max_length=2000)


class HealthGuidanceResponse(BaseModel):
    understanding: str = Field(min_length=1, max_length=2000)
    general_information: str = Field(min_length=1, max_length=4000)
    practical_precautions: list[str] = Field(min_length=1, max_length=8)
    things_to_avoid: list[str] = Field(min_length=1, max_length=8)
    warning_signs: list[str] = Field(min_length=1, max_length=8)
    emergency_warning_signs: list[str] = Field(min_length=1, max_length=8)
    when_to_consult: list[str] = Field(min_length=1, max_length=8)
    doctor_questions: list[str] = Field(min_length=1, max_length=8)
    urgent_action: str = Field(min_length=1, max_length=2000)
    is_emergency: bool = False
    educational_notice: str = Field(min_length=1, max_length=1000)


class GeminiServiceError(Exception):
    """Raised when Gemini cannot produce a valid recommendation."""


class MissingGeminiAPIKeyError(GeminiServiceError):
    """Raised when the Gemini API key is not configured."""


class GeminiAPIError(GeminiServiceError):
    """Raised when the Gemini provider request fails."""


class GeminiAuthenticationError(GeminiAPIError):
    """Raised when Gemini rejects the configured credentials."""


class GeminiRateLimitError(GeminiAPIError):
    """Raised when Gemini quota or rate limits are reached."""


class GeminiConfigurationError(GeminiAPIError):
    """Raised when the Gemini model or request configuration is invalid."""


class GeminiNetworkError(GeminiAPIError):
    """Raised when the Gemini provider cannot be reached."""


class GeminiUnavailableError(GeminiAPIError):
    """Raised when Gemini is temporarily unavailable."""


class InvalidGeminiResponseError(GeminiServiceError):
    """Raised when Gemini returns a response that does not match the schema."""


EMERGENCY_NOTICE = (
    "This may be a medical emergency. Contact your local emergency number or seek "
    "immediate emergency care now. Do not wait for an AI recommendation."
)

EMERGENCY_TERMS = (
    "chest pain",
    "difficulty breathing",
    "trouble breathing",
    "shortness of breath",
    "heavy bleeding",
    "uncontrolled bleeding",
    "sudden weakness",
    "face drooping",
    "slurred speech",
    "loss of consciousness",
    "unconscious",
    "seizure",
    "severe allergic reaction",
    "anaphylaxis",
    "suicidal",
)

CHEST_PAIN_TERMS = (
    "chest pain",
    "chest pressure",
    "chest discomfort",
    "chest tightness",
    "pain in my chest",
    "pressure in my chest",
)


def _is_potential_emergency(assessment: HealthAssessmentRequest) -> bool:
    concern = assessment.health_concern.casefold()
    return assessment.severity.casefold() == "severe" or any(
        term in concern for term in EMERGENCY_TERMS
    )


def _is_guidance_emergency(assessment: HealthGuidanceRequest) -> bool:
    concern = assessment.health_concern.casefold()
    has_chest_pain = any(term in concern for term in CHEST_PAIN_TERMS)
    return (
        assessment.severity.casefold() == "severe"
        or has_chest_pain
        or any(term in concern for term in EMERGENCY_TERMS)
    )


def _emergency_recommendation() -> SpecialtyRecommendation:
    return SpecialtyRecommendation(
        recommended_specialty="Emergency medicine",
        explanation="The information provided includes a potential emergency warning sign.",
        suggested_next_step=EMERGENCY_NOTICE,
        urgency=UrgencyCategory.EMERGENCY,
        safety_notice=EMERGENCY_NOTICE,
    )


def _load_api_settings() -> tuple[str, str]:
    backend_dir = Path(__file__).resolve().parents[2]
    load_dotenv(backend_dir / ".env")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise MissingGeminiAPIKeyError("Gemini API key is not configured.")

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    return api_key, model


def get_gemini_client_and_model() -> tuple[genai.Client, str]:
    api_key, model = _load_api_settings()
    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(api_version="v1beta"),
    ), model


def classify_gemini_error(exc: Exception) -> GeminiAPIError:
    message = str(exc).casefold()
    if any(term in message for term in ("401", "403", "api key", "authentication", "permission")):
        return GeminiAuthenticationError("Gemini authentication failed.")
    if any(term in message for term in ("429", "quota", "rate limit", "resource exhausted")):
        return GeminiRateLimitError("Gemini quota or rate limit was reached.")
    if any(term in message for term in ("503", "unavailable", "service unavailable")):
        return GeminiUnavailableError("Gemini is temporarily unavailable.")
    if any(
        term in message
        for term in ("invalid_argument", "invalid argument", "unsupported", "not found", "api version")
    ):
        return GeminiConfigurationError("Gemini request configuration is invalid.")
    if any(term in message for term in ("timeout", "timed out", "connection", "network")):
        return GeminiNetworkError("Gemini could not be reached.")
    return GeminiAPIError("Gemini provider request failed.")


def _build_prompt(assessment: HealthAssessmentRequest) -> str:
    details = assessment.model_dump(exclude_none=True)
    return f"""
You provide cautious health-navigation guidance, not medical diagnosis or treatment.
Review the following health assessment and recommend the most appropriate medical
specialty to consult.

Return only the requested JSON structure. Use urgency exactly as one of:
"routine", "prompt", or "emergency". Do not diagnose a disease, prescribe medicine,
or provide medicine dosages. Explain that the recommendation is guidance, not a
diagnosis. For emergency symptoms, advise immediate local emergency care.

Health assessment:
{details}
""".strip()


def _build_guidance_prompt(assessment: HealthGuidanceRequest) -> str:
    details = assessment.model_dump(exclude_none=True)
    return f"""
You provide cautious, plain-language health education and navigation guidance.
You must not diagnose the person, identify the cause of symptoms, prescribe
medicines or dosages, tell them to stop prescribed medicines, or suggest delaying
professional care. The output is educational and is not a diagnosis or treatment plan.

Return only the requested JSON structure. Cover the reported concern, general
information, practical precautions, things to avoid, warning signs, emergency
warning signs, when to consult a healthcare professional, and questions for a doctor.
Consider age, symptom duration, severity, medical conditions, allergies and current
medications only as safety context. Do not invent facts that were not provided.
If the concern could be an emergency, put urgent-care instructions before ordinary
guidance and clearly advise immediate local emergency care.

Health assessment:
{details}
""".strip()


def _enforce_guidance_safety(
    assessment: HealthGuidanceRequest,
    guidance: HealthGuidanceResponse,
) -> HealthGuidanceResponse:
    if not _is_guidance_emergency(assessment):
        return guidance

    concern = assessment.health_concern.casefold()
    is_chest_pain = any(term in concern for term in CHEST_PAIN_TERMS)
    emergency_signs = [
        *(
            [
                "New, severe, persistent or unexplained chest pain requires urgent medical assessment.",
                "Breathlessness, sweating, fainting or pain spreading to the arm, jaw or back.",
            ]
            if is_chest_pain
            else []
        ),
        *guidance.emergency_warning_signs,
    ]
    return guidance.model_copy(
        update={
            "is_emergency": True,
            "urgent_action": EMERGENCY_NOTICE,
            "emergency_warning_signs": list(dict.fromkeys(emergency_signs))[:8],
        }
    )


def recommend_specialty(assessment: HealthAssessmentRequest) -> SpecialtyRecommendation:
    if _is_potential_emergency(assessment):
        return _emergency_recommendation()

    try:
        client, model = get_gemini_client_and_model()
        response = client.models.generate_content(
            model=model,
            contents=_build_prompt(assessment),
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=SpecialtyRecommendation,
            ),
        )
    except MissingGeminiAPIKeyError:
        raise
    except Exception as exc:
        classified_error = classify_gemini_error(exc)
        logger.exception(
            "Gemini specialty request failed: category=%s exception_type=%s",
            type(classified_error).__name__,
            type(exc).__name__,
        )
        raise classified_error from exc

    try:
        if isinstance(response.parsed, SpecialtyRecommendation):
            recommendation = response.parsed
        elif response.text:
            recommendation = SpecialtyRecommendation.model_validate_json(response.text)
        else:
            raise ValueError("Gemini returned an empty response.")
    except Exception as exc:
        raise InvalidGeminiResponseError(
            "Gemini returned an invalid recommendation."
        ) from exc

    if recommendation.urgency == UrgencyCategory.EMERGENCY:
        recommendation.safety_notice = EMERGENCY_NOTICE

    return recommendation


def generate_health_guidance(assessment: HealthGuidanceRequest) -> HealthGuidanceResponse:
    try:
        client, model = get_gemini_client_and_model()
        response = client.models.generate_content(
            model=model,
            contents=_build_guidance_prompt(assessment),
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=HealthGuidanceResponse,
            ),
        )
    except MissingGeminiAPIKeyError:
        raise
    except Exception as exc:
        classified_error = classify_gemini_error(exc)
        logger.exception(
            "Gemini health guidance request failed: category=%s exception_type=%s",
            type(classified_error).__name__,
            type(exc).__name__,
        )
        raise classified_error from exc

    try:
        if isinstance(response.parsed, HealthGuidanceResponse):
            guidance = response.parsed
        elif response.text:
            guidance = HealthGuidanceResponse.model_validate_json(response.text)
        else:
            raise ValueError("Gemini returned an empty response.")
    except Exception as exc:
        logger.warning(
            "Gemini health guidance response failed validation: exception_type=%s",
            type(exc).__name__,
        )
        raise InvalidGeminiResponseError(
            "Gemini returned invalid health guidance."
        ) from exc

    return _enforce_guidance_safety(assessment, guidance)
