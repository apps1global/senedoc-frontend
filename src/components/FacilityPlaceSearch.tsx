"use client";

import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export type SelectedPlace = {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
};

export function FacilityPlaceSearch({
  selected,
  onSelect,
  onClear,
}: {
  selected: SelectedPlace | null;
  onSelect: (place: SelectedPlace) => void;
  onClear: () => void;
}) {
  const placesLib = useMapsLibrary("places");
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<any>(null);

  useEffect(() => {
    if (!placesLib || !containerRef.current || elementRef.current) return;

    const PlaceAutocompleteElement = (placesLib as any).PlaceAutocompleteElement;
    if (!PlaceAutocompleteElement) {
      console.error("PlaceAutocompleteElement indisponible dans cette version de la librairie places.");
      return;
    }

    const el = new PlaceAutocompleteElement({
      includedRegionCodes: ["sn"],
      includedPrimaryTypes: ["establishment"],
    });
    el.style.width = "100%";
    containerRef.current.appendChild(el);
    elementRef.current = el;

    async function handleSelect(event: any) {
      try {
        console.log("gmp-select event:", event);
        const prediction = event.placePrediction;
        const place = prediction ? prediction.toPlace() : event.place;
        if (!place) {
          console.error("Aucun objet place trouvé dans l'événement.", event);
          return;
        }
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location", "id", "addressComponents"],
        });
        console.log("place après fetchFields:", place);

        let city = "";
        for (const comp of place.addressComponents ?? []) {
          if (comp.types?.includes("locality")) { city = comp.longText ?? comp.long_name ?? ""; break; }
        }
        if (!city) {
          for (const comp of place.addressComponents ?? []) {
            if (comp.types?.includes("administrative_area_level_2")) { city = comp.longText ?? comp.long_name ?? ""; break; }
          }
        }

        const lat = typeof place.location?.lat === "function" ? place.location.lat() : place.location?.lat;
        const lng = typeof place.location?.lng === "function" ? place.location.lng() : place.location?.lng;

        onSelect({
          name: place.displayName ?? "",
          address: place.formattedAddress ?? "",
          city,
          latitude: lat,
          longitude: lng,
          googlePlaceId: place.id ?? "",
        });
      } catch (e) {
        console.error("Erreur sélection établissement:", e);
      }
    }

    el.addEventListener("gmp-select", handleSelect);
    return () => {
      el.removeEventListener("gmp-select", handleSelect);
    };
  }, [placesLib, onSelect]);

  if (selected) {
    return (
      <div className="border border-teal rounded-lg p-3 bg-teal-light">
        <p className="text-sm font-medium">{selected.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{selected.address}</p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-coral font-medium mt-2"
        >
          Changer d'établissement
        </button>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      <p className="text-xs text-gray-400 mt-1">
        Tapez au moins 3 lettres et sélectionnez votre établissement dans la liste.
      </p>
    </div>
  );
}
