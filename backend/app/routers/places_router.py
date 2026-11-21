from fastapi import APIRouter, HTTPException, status

from app.services.places_service import (
    MissingPlacesAPIKeyError,
    PlacesAuthenticationError,
    PlacesQuotaError,
    PlacesRequestError,
    PlacesResponseError,
    PlacesSearchRequest,
    PlacesSearchResponse,
    PlacesServiceError,
    PlacesUnavailableError,
    search_places,
)


router = APIRouter(prefix="/api/places", tags=["places"])


@router.post(
    "/search",
    response_model=PlacesSearchResponse,
    status_code=status.HTTP_200_OK,
)
def search_nearby_places(request: PlacesSearchRequest) -> PlacesSearchResponse:
    try:
        return search_places(request)
    except PlacesRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except MissingPlacesAPIKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Geoapify API key is not configured on the server.",
        ) from exc
    except PlacesAuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Geoapify rejected the server credentials. Check backend configuration.",
        ) from exc
    except PlacesQuotaError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Geoapify rate limit was reached. Please try again later.",
        ) from exc
    except PlacesUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Geoapify is temporarily unavailable. Please try again.",
        ) from exc
    except PlacesResponseError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Geoapify returned an unusable response.",
        ) from exc
    except PlacesServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Geoapify places search failed.",
        ) from exc
