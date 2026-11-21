from fastapi import APIRouter, HTTPException, status

from app.services.diet_service import (
    DietRecommendation,
    DietRequest,
    UnsafeGeneratedDietError,
    UnsafeDietRequestError,
    generate_diet_recommendation,
)
from app.services.gemini_service import (
    GeminiAPIError,
    GeminiAuthenticationError,
    GeminiConfigurationError,
    InvalidGeminiResponseError,
    MissingGeminiAPIKeyError,
    GeminiNetworkError,
    GeminiRateLimitError,
    GeminiUnavailableError,
)


router = APIRouter(prefix="/api/diet", tags=["diet"])


@router.post(
    "/generate",
    response_model=DietRecommendation,
    status_code=status.HTTP_200_OK,
)
def generate_diet(request: DietRequest) -> DietRecommendation:
    try:
        return generate_diet_recommendation(request)
    except UnsafeDietRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except UnsafeGeneratedDietError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "The generated diet plan did not pass safety checks. "
                "Please regenerate it or seek professional review."
            ),
        ) from exc
    except MissingGeminiAPIKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured.",
        ) from exc
    except GeminiAuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini authentication failed. Check the backend configuration.",
        ) from exc
    except GeminiRateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Gemini quota or rate limit was reached. Please try again later.",
        ) from exc
    except GeminiConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini request configuration is invalid.",
        ) from exc
    except GeminiNetworkError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini could not be reached. Please try again.",
        ) from exc
    except GeminiUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini is temporarily unavailable. Please try again later.",
        ) from exc
    except GeminiAPIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini service is currently unavailable.",
        ) from exc
    except InvalidGeminiResponseError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini returned an invalid diet recommendation.",
        ) from exc
