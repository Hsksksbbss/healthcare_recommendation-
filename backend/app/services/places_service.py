import logging
import os
from pathlib import Path
from typing import Any
from concurrent.futures import ThreadPoolExecutor, as_completed

import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)

PLACES_SEARCH_URL = "https://api.geoapify.com/v2/places"
GEOCODE_SEARCH_URL = "https://api.geoapify.com/v1/geocode/search"
HEALTHCARE_CATEGORY_SEARCHES = (
    "healthcare.hospital",
    "healthcare.clinic_or_praxis",
    "healthcare",
)
DEFAULT_SEARCH_RADIUS_METERS = 5000
MAX_SEARCH_RADIUS_METERS = 50000
DEFAULT_RESULT_LIMIT = 20
MAX_RESULT_LIMIT = 50
REQUEST_TIMEOUT_SECONDS = 15.0
LISTING_DISCLAIMER = (
    "Third-party Geoapify map listing; not a verified medical professional."
)


class PlacesSearchRequest(BaseModel):
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    location_query: str | None = Field(default=None, min_length=1, max_length=200)
    specialty: str | None = Field(default=None, min_length=1, max_length=200)
    health_concern: str | None = Field(default=None, min_length=1, max_length=2000)
    search_term: str | None = Field(default=None, min_length=1, max_length=200)
    radius_meters: int = Field(
        default=DEFAULT_SEARCH_RADIUS_METERS,
        ge=500,
        le=MAX_SEARCH_RADIUS_METERS,
    )
    limit: int = Field(default=DEFAULT_RESULT_LIMIT, ge=1, le=MAX_RESULT_LIMIT)


class PlaceResult(BaseModel):
    id: str
    name: str
    address: str | None = None
    rating: float | None = None
    user_rating_count: int | None = None
    phone_number: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    google_maps_uri: str | None = None
    specialty: str | None = None
    distance_meters: float | None = None
    website: str | None = None
    categories: list[str] = Field(default_factory=list)
    facility_type: str = "other"
    facility_priority: int = Field(default=3, ge=1, le=3)
    relevance_group: int = Field(default=3, ge=1, le=3)
    geoapify_place_id: str
    listing_source: str = "Geoapify"
    is_verified_medical_professional: bool = False
    listing_disclaimer: str = LISTING_DISCLAIMER


class PlacesSearchResponse(BaseModel):
    results: list[PlaceResult]
    specialty: str | None = None
    no_exact_match: bool = False
    source: str = "Geoapify"
    listing_disclaimer: str = LISTING_DISCLAIMER


class PlacesServiceError(Exception):
    """Base error for Geoapify Places failures."""


class MissingPlacesAPIKeyError(PlacesServiceError):
    """Raised when the Geoapify key is not configured."""


class PlacesAuthenticationError(PlacesServiceError):
    """Raised when Geoapify rejects the configured key."""


class PlacesQuotaError(PlacesServiceError):
    """Raised when Geoapify rate limits the request."""


class PlacesUnavailableError(PlacesServiceError):
    """Raised when Geoapify cannot be reached."""


class PlacesResponseError(PlacesServiceError):
    """Raised when Geoapify returns an unusable response."""


class PlacesRequestError(PlacesServiceError):
    """Raised when the places search request is invalid."""


def _load_places_api_key() -> str:
    backend_dir = Path(__file__).resolve().parents[2]
    load_dotenv(backend_dir / ".env")
    api_key = os.getenv("GEOAPIFY_API_KEY")
    if not api_key:
        raise MissingPlacesAPIKeyError("Geoapify API key is not configured.")
    return api_key


def _raise_for_upstream_error(response: httpx.Response) -> None:
    if response.status_code in {401, 403}:
        logger.warning("Geoapify request failed: category=authentication")
        raise PlacesAuthenticationError("Geoapify rejected the configured credentials.")
    if response.status_code == 429:
        logger.warning("Geoapify request failed: category=rate_limit")
        raise PlacesQuotaError("Geoapify rate limit was reached.")
    if response.status_code >= 500:
        logger.warning("Geoapify request failed: category=provider_unavailable")
        raise PlacesUnavailableError("Geoapify is temporarily unavailable.")
    if response.status_code >= 400:
        logger.warning(
            "Geoapify request failed: category=upstream_rejection status=%s",
            response.status_code,
        )
        raise PlacesResponseError("Geoapify rejected the search request.")


def _request_geoapify(
    url: str,
    api_key: str,
    params: dict[str, Any],
) -> dict[str, Any]:
    try:
        response = httpx.get(
            url,
            params={**params, "apiKey": api_key},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except httpx.TimeoutException as exc:
        logger.warning("Geoapify request failed: category=timeout")
        raise PlacesUnavailableError("Geoapify request timed out.") from exc
    except httpx.RequestError as exc:
        logger.warning(
            "Geoapify request failed: category=network_error exception_type=%s",
            type(exc).__name__,
        )
        raise PlacesUnavailableError("Geoapify could not be reached.") from exc

    _raise_for_upstream_error(response)

    try:
        payload = response.json()
    except ValueError as exc:
        logger.warning("Geoapify response failed: category=invalid_json")
        raise PlacesResponseError("Geoapify returned an invalid response.") from exc
    if not isinstance(payload, dict):
        logger.warning("Geoapify response failed: category=invalid_shape")
        raise PlacesResponseError("Geoapify returned an invalid response.")
    return payload


def _geocode_location(
    location_query: str,
    api_key: str,
) -> tuple[float, float] | None:
    payload = _request_geoapify(
        GEOCODE_SEARCH_URL,
        api_key,
        {"text": location_query, "format": "json", "limit": 1},
    )
    locations = payload.get("results")
    if not isinstance(locations, list):
        logger.warning("Geoapify geocoding response failed: category=invalid_shape")
        raise PlacesResponseError("Geoapify returned an invalid location response.")
    if not locations or not isinstance(locations[0], dict):
        return None

    latitude = locations[0].get("lat")
    longitude = locations[0].get("lon")
    if not _is_number(latitude) or not _is_number(longitude):
        logger.warning("Geoapify geocoding response failed: category=missing_coordinates")
        raise PlacesResponseError("Geoapify returned an invalid location response.")
    return float(latitude), float(longitude)


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _distance_meters(
    first_latitude: float,
    first_longitude: float,
    second_latitude: float,
    second_longitude: float,
) -> float:
    import math

    earth_radius_meters = 6371000.0
    latitude_delta = math.radians(second_latitude - first_latitude)
    longitude_delta = math.radians(second_longitude - first_longitude)
    first_radians = math.radians(first_latitude)
    second_radians = math.radians(second_latitude)
    haversine = (
        math.sin(latitude_delta / 2) ** 2
        + math.cos(first_radians)
        * math.cos(second_radians)
        * math.sin(longitude_delta / 2) ** 2
    )
    return 2 * earth_radius_meters * math.asin(math.sqrt(haversine))


def _first_string(*values: Any) -> str | None:
    return next(
        (value.strip() for value in values if isinstance(value, str) and value.strip()),
        None,
    )

SPECIALIST_TERMS = (
    "ophthalm", "eye ", " eye", "dent", "tooth", "dermat", "skin",
    "cardio", "heart", "gastro", "stomach", "digest", "neurolog",
    "orthopedic", "bone", "orthopaed", "pediatric", "child", "gynec",
    "obstetric", "ent ", "ear ", "nose", "throat",
)


def _provider_text(properties: dict[str, Any], categories: list[str]) -> str:
    description_fields = (
        "name", "address_line1", "address_line2", "formatted",
        "description", "brand", "operator",
    )
    parts = [
        str(properties.get(field))
        for field in description_fields
        if isinstance(properties.get(field), str)
    ]
    parts.extend(categories)
    return " ".join(parts).lower()


def _deduplication_key(feature: dict[str, Any]) -> str:
    properties = feature.get("properties")
    if not isinstance(properties, dict):
        return f"feature:{id(feature)}"
    place_id = _first_string(properties.get("place_id"), properties.get("osm_id"), properties.get("db_id"))
    if place_id:
        return f"id:{place_id}"
    name = _first_string(properties.get("name"), properties.get("address_line1"))
    address = _first_string(properties.get("formatted"), properties.get("address_line2"))
    geometry = feature.get("geometry")
    coordinates = geometry.get("coordinates") if isinstance(geometry, dict) else None
    if name and isinstance(coordinates, list) and len(coordinates) >= 2:
        normalized_name = " ".join(name.lower().split())
        if address:
            normalized_address = " ".join(address.lower().split())
            return f"coord-address:{float(coordinates[0]):.5f},{float(coordinates[1]):.5f}:{normalized_name}:{normalized_address}"
        return f"coord-name:{float(coordinates[0]):.5f},{float(coordinates[1]):.5f}:{normalized_name}"
    if name and address:
        return f"name-address:{' '.join(name.lower().split())}:{' '.join(address.lower().split())}"
    if name:
        return f"name:{' '.join(name.lower().split())}"
    return f"feature:{id(feature)}"


def _find_existing_feature(
    discovered_features: dict[str, dict[str, Any]],
    feature: dict[str, Any],
) -> str | None:
    properties = feature.get("properties")
    if not isinstance(properties, dict):
        return None

    place_id = _first_string(properties.get("place_id"), properties.get("osm_id"), properties.get("db_id"))
    if place_id:
        key = f"id:{place_id}"
        if key in discovered_features:
            return key

    name = _first_string(properties.get("name"), properties.get("address_line1"))
    address = _first_string(properties.get("formatted"), properties.get("address_line2"))
    geometry = feature.get("geometry")
    coordinates = geometry.get("coordinates") if isinstance(geometry, dict) else None
    if name and isinstance(coordinates, list) and len(coordinates) >= 2:
        normalized_name = " ".join(name.lower().split())
        for key, existing in discovered_features.items():
            existing_properties = existing.get("properties")
            if not isinstance(existing_properties, dict):
                continue
            existing_name = _first_string(
                existing_properties.get("name"),
                existing_properties.get("address_line1"),
            )
            existing_geometry = existing.get("geometry")
            existing_coordinates = (
                existing_geometry.get("coordinates")
                if isinstance(existing_geometry, dict)
                else None
            )
            if not existing_name or not isinstance(existing_coordinates, list):
                continue
            if " ".join(existing_name.lower().split()) != normalized_name:
                continue
            if (
                len(existing_coordinates) >= 2
                and abs(float(existing_coordinates[0]) - float(coordinates[0])) < 0.0001
                and abs(float(existing_coordinates[1]) - float(coordinates[1])) < 0.0001
            ):
                return key
            if address:
                existing_address = _first_string(
                    existing_properties.get("formatted"),
                    existing_properties.get("address_line2"),
                )
                if existing_address and " ".join(existing_address.lower().split()) == " ".join(address.lower().split()):
                    return key
    return None


def _classify_facility(provider_text: str, categories: list[str]) -> tuple[str, int]:
    category_text = " ".join(categories).lower()
    text = f"{provider_text} {category_text}"

    pharmacy_terms = ("pharmacy", "chemist", "drugstore")
    unrelated_terms = (
        "laboratory", "lab ", " beauty ", "cosmetic", "optician",
    )
    if any(term in text for term in pharmacy_terms + unrelated_terms):
        return "other", 3

    hospital_terms = (
        "healthcare.hospital", "hospital", "medical center",
        "medical centre", "multispeciality", "multispecialty",
        "nursing home", "trauma centre", "trauma center",
    )
    if any(term in text for term in hospital_terms):
        return "hospital", 1

    clinic_terms = (
        "healthcare.clinic", "healthcare.clinic_or_praxis",
        "clinic", "medical centre", "medical center",
        "polyclinic", "praxis", "health centre", "health center",
    )
    if any(term in text for term in clinic_terms):
        return "clinic", 2

    doctor_terms = (
        "healthcare.doctor", "doctor", "physician", "specialist",
        "surgeon", "ophthalm", "dentist", "dermat",
        "cardio", "gastro", "neurolog", "orthopedic",
        "pediatric", "gynec", "obstetric",
    )
    if any(term in text for term in doctor_terms):
        return "doctor", 3

    return "other", 3


def _health_terms(health_concern: str | None, specialty: str | None) -> list[str]:
    text = f"{health_concern or ''} {specialty or ''}".lower()
    terms: list[str] = []

    mappings = (
        (("fever", "cold", "cough", "headache", "weakness", "general"),
         ("general physician", "general practitioner", "internal medicine")),
        (("eye", "vision", "blurred", "ophthalm"),
         ("ophthalmologist", "eye specialist", "eye hospital", "eye clinic")),
        (("tooth", "teeth", "dental"),
         ("dentist", "dental clinic", "dental hospital")),
        (("skin", "rash", "itch", "dermat"),
         ("dermatologist", "skin specialist", "dermatology")),
        (("heart", "cardiac", "cardio", "chest"),
         ("cardiologist", "cardiology")),
        (("stomach", "digest", "gastric", "gastro"),
         ("gastroenterologist", "gastroenterology", "general physician")),
    )
    for needles, mapped_terms in mappings:
        if any(needle in text for needle in needles):
            terms.extend(mapped_terms)

    if specialty:
        terms.append(specialty.lower())
    return list(dict.fromkeys(term for term in terms if term))


def _relevance_group(
    provider_text: str,
    health_terms: list[str],
    specialty: str | None,
) -> int | None:
    is_hospital = any(
        term in provider_text
        for term in ("hospital", "medical center", "multispeciality", "multispecialty")
    )
    exact_terms = [
        term for term in health_terms
        if not term.startswith("general")
    ]
    if specialty:
        exact_terms.insert(0, specialty.lower())

    if any(term in provider_text for term in exact_terms if term):
        return 1
    if is_hospital:
        specialist_conflict = any(
            specialist in provider_text
            for specialist in SPECIALIST_TERMS
        )
        if not specialist_conflict or any(
            term in provider_text
            for term in ("general", "multispecial", "cardiology")
        ):
            return 2

    general_terms = (
        "general physician", "general practitioner", "internal medicine",
        "primary care", "clinic_or_praxis", "general clinic",
    )
    if any(term in provider_text for term in general_terms):
        return 3

    # A specialist-only clinic with no support for the requested concern is unrelated.
    if any(specialist in provider_text for specialist in SPECIALIST_TERMS):
        return None
    return None


def _place_from_api(
    place: dict[str, Any],
    specialty: str | None,
    health_terms: list[str],
    health_concern: str | None,
    origin_latitude: float | None = None,
    origin_longitude: float | None = None,
) -> PlaceResult | None:
    properties = place.get("properties")
    if not isinstance(properties, dict):
        logger.warning("Geoapify place skipped: category=missing_properties")
        return None

    place_id = _first_string(
        properties.get("place_id"),
        properties.get("osm_id"),
        properties.get("db_id"),
    )
    name = _first_string(
        properties.get("name"),
        properties.get("address_line1"),
        properties.get("address_line2"),
    )
    if name is None:
        logger.warning("Geoapify place skipped: category=missing_name")
        return None
    if place_id is None:
        latitude = properties.get("lat")
        longitude = properties.get("lon")
        geometry = place.get("geometry")
        coordinates = geometry.get("coordinates") if isinstance(geometry, dict) else None
        if isinstance(coordinates, list) and len(coordinates) >= 2:
            longitude = longitude if _is_number(longitude) else coordinates[0]
            latitude = latitude if _is_number(latitude) else coordinates[1]
        place_id = (
            f"geoapify:{longitude}:{latitude}:{name}"
            if _is_number(latitude) and _is_number(longitude)
            else f"geoapify:{name}"
        )

    address = _first_string(properties.get("formatted"))
    if address is None:
        address_parts = (
            properties.get("address_line1"),
            properties.get("address_line2"),
            properties.get("street"),
            properties.get("housenumber"),
            properties.get("city"),
            properties.get("state"),
            properties.get("postcode"),
            properties.get("country"),
        )
        address = _first_string(
            ", ".join(
                value.strip()
                for value in address_parts
                if isinstance(value, str) and value.strip()
            )
        )

    latitude = properties.get("lat")
    longitude = properties.get("lon")
    geometry = place.get("geometry")
    coordinates = geometry.get("coordinates") if isinstance(geometry, dict) else None
    if isinstance(coordinates, list) and len(coordinates) >= 2:
        if not _is_number(longitude) and _is_number(coordinates[0]):
            longitude = coordinates[0]
        if not _is_number(latitude) and _is_number(coordinates[1]):
            latitude = coordinates[1]

    contact = properties.get("contact")
    contact = contact if isinstance(contact, dict) else {}
    datasource = properties.get("datasource")
    datasource = datasource if isinstance(datasource, dict) else {}
    raw_data = datasource.get("raw")
    raw_data = raw_data if isinstance(raw_data, dict) else {}
    categories = properties.get("categories")
    categories = (
        [category for category in categories if isinstance(category, str)]
        if isinstance(categories, list)
        else []
    )
    provider_text = _provider_text(properties, categories)
    facility_type, facility_priority = _classify_facility(provider_text, categories)
    if facility_type == "other":
        return None

    relevance_group = _relevance_group(provider_text, health_terms, specialty)
    if relevance_group is None:
        relevance_group = 3

    distance = properties.get("distance")
    if not _is_number(distance) and (
        origin_latitude is not None
        and origin_longitude is not None
        and _is_number(latitude)
        and _is_number(longitude)
    ):
        distance = _distance_meters(
            origin_latitude,
            origin_longitude,
            float(latitude),
            float(longitude),
        )
    return PlaceResult(
        id=place_id,
        geoapify_place_id=place_id,
        name=name,
        address=address,
        phone_number=_first_string(
            contact.get("phone"),
            properties.get("phone"),
            raw_data.get("phone"),
        ),
        latitude=float(latitude) if _is_number(latitude) else None,
        longitude=float(longitude) if _is_number(longitude) else None,
        distance_meters=float(distance) if _is_number(distance) else None,
        website=_first_string(
            contact.get("website"),
            properties.get("website"),
            raw_data.get("website"),
        ),
        categories=categories,
        facility_type=facility_type,
        facility_priority=facility_priority,
        relevance_group=relevance_group,
        specialty=specialty,
    )


def search_places(request: PlacesSearchRequest) -> PlacesSearchResponse:
    if (
        request.latitude is None or request.longitude is None
    ) and not request.location_query:
        raise PlacesRequestError("A browser location or manual locality is required.")

    api_key = _load_places_api_key()
    latitude = request.latitude
    longitude = request.longitude
    if latitude is None or longitude is None:
        coordinates = _geocode_location(request.location_query or "", api_key)
        if coordinates is None:
            return PlacesSearchResponse(results=[], specialty=request.specialty)
        latitude, longitude = coordinates

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise PlacesRequestError("Invalid latitude or longitude.")

    radius_stages = (
        max(request.radius_meters, 5000),
        min(MAX_SEARCH_RADIUS_METERS, max(request.radius_meters * 2, 10000)),
        MAX_SEARCH_RADIUS_METERS,
    )
    radius_stages = tuple(dict.fromkeys(
        min(radius, MAX_SEARCH_RADIUS_METERS) for radius in radius_stages
    ))

    health_terms = _health_terms(request.health_concern, request.specialty)
    discovered_features: dict[str, dict[str, Any]] = {}

    def search_category(category: str, radius: int) -> list[dict[str, Any]]:
        params: dict[str, Any] = {
            "categories": category,
            "filter": f"circle:{longitude},{latitude},{radius}",
            "bias": f"proximity:{longitude},{latitude}",
            "limit": min(request.limit, MAX_RESULT_LIMIT),
            "lang": "en",
        }
        if request.search_term:
            params["name"] = request.search_term
        payload = _request_geoapify(PLACES_SEARCH_URL, api_key, params)
        features = payload.get("features")
        if not isinstance(features, list):
            logger.warning(
                "Geoapify category response failed: category=invalid_shape category_search=%s",
                category,
            )
            return []
        return [feature for feature in features if isinstance(feature, dict)]

    initial_results: list[dict[str, Any]] = []
    initial_radius = radius_stages[0]
    with ThreadPoolExecutor(max_workers=len(HEALTHCARE_CATEGORY_SEARCHES)) as executor:
        futures = {
            executor.submit(search_category, category, initial_radius): category
            for category in HEALTHCARE_CATEGORY_SEARCHES
        }
        for future in as_completed(futures):
            initial_results.extend(future.result())

    for feature in initial_results:
        existing_key = _find_existing_feature(discovered_features, feature)
        if existing_key is None:
            discovered_features[_deduplication_key(feature)] = feature

    hospital_count = sum(
        1
        for feature in discovered_features.values()
        if isinstance(feature.get("properties"), dict)
        and _classify_facility(
            _provider_text(
                feature["properties"],
                [
                    category
                    for category in feature["properties"].get("categories", [])
                    if isinstance(category, str)
                ],
            ),
            [
                category
                for category in feature["properties"].get("categories", [])
                if isinstance(category, str)
            ],
        )[0] == "hospital"
    )
    if hospital_count < 5:
        for radius in radius_stages[1:]:
            with ThreadPoolExecutor(max_workers=len(HEALTHCARE_CATEGORY_SEARCHES)) as executor:
                futures = {
                    executor.submit(search_category, "healthcare.hospital", radius): "healthcare.hospital"
                }
                for future in as_completed(futures):
                    for feature in future.result():
                        existing_key = _find_existing_feature(discovered_features, feature)
                        if existing_key is None:
                            discovered_features[_deduplication_key(feature)] = feature

            hospital_count = sum(
                1
                for feature in discovered_features.values()
                if isinstance(feature.get("properties"), dict)
                and _classify_facility(
                    _provider_text(
                        feature["properties"],
                        [
                            category
                            for category in feature["properties"].get("categories", [])
                            if isinstance(category, str)
                        ],
                    ),
                    [
                        category
                        for category in feature["properties"].get("categories", [])
                        if isinstance(category, str)
                    ],
                )[0] == "hospital"
            )
            if hospital_count >= 5:
                break

    results = [
        result
        for feature in discovered_features.values()
        for result in [
            _place_from_api(
                feature,
                request.specialty,
                health_terms,
                request.health_concern,
                latitude,
                longitude,
            )
        ]
        if result is not None
    ]
    results.sort(
        key=lambda result: (
            result.facility_priority,
            result.distance_meters
            if result.distance_meters is not None
            else float("inf"),
        )
    )
    exact_match_count = sum(result.relevance_group == 1 for result in results)
    return PlacesSearchResponse(
        results=results,
        specialty=request.specialty,
        no_exact_match=exact_match_count == 0,
    )
