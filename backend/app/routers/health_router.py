from fastapi import APIRouter, HTTPException, status

from app.services.gemini_service import (
    GeminiAPIError,
    GeminiAuthenticationError,
    GeminiConfigurationError,
    GeminiServiceError,
    GeminiNetworkError,
    GeminiRateLimitError,
    GeminiUnavailableError,
    HealthGuidanceRequest,
    HealthGuidanceResponse,
    HealthAssessmentRequest,
    InvalidGeminiResponseError,
    MissingGeminiAPIKeyError,
    SpecialtyRecommendation,
    recommend_specialty,
    generate_health_guidance,
)


router = APIRouter(prefix="/api/health", tags=["health"])


@router.post(
    "/recommend-specialty",
    response_model=SpecialtyRecommendation,
    status_code=status.HTTP_200_OK,
)
def recommend_health_specialty(
    assessment: HealthAssessmentRequest,
) -> SpecialtyRecommendation:
    try:
        return recommend_specialty(assessment)
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
            detail="Gemini returned an invalid recommendation.",
        ) from exc
    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post(
    "/generate-guidance",
    response_model=HealthGuidanceResponse,
    status_code=status.HTTP_200_OK,
)
def generate_health_guidance_route(
    assessment: HealthGuidanceRequest,
) -> HealthGuidanceResponse:
    try:
        return generate_health_guidance(assessment)
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
            detail="Gemini returned invalid health guidance.",
        ) from exc
    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
