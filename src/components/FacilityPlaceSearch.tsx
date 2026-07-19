"use client";

import { useEffect, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    const ac = new placesLib.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "sn" },
      types: ["establishment"],
      fields: ["place_id", "name", "formatted_address", "geometry", "address_components"],
    });
    setAutocomplete(ac);
  }, [placesLib]);

  useEffect(() => {
    if (!autocomplete) return;
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location || !place.place_id) return;

      let city = "";
      for (const comp of place.address_components ?? []) {
        if (comp.types.includes("locality")) { city = comp.long_name; break; }
      }
      if (!city) {
        for (const comp of place.address_components ?? []) {
          if (comp.types.includes("administrative_area_level_2")) { city = comp.long_name; break; }
        }
      }

      onSelect({
        name: place.name ?? "",
        address: place.formatted_address ?? "",
        city,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        googlePlaceId: place.place_id,
      });
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onSelect]);

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
      <input
        ref={inputRef}
        type="text"
        placeholder="Rechercher votre établissement sur Google Maps *"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm"
      />
      <p className="text-xs text-gray-400 mt-1">
        Tapez au moins 3 lettres et sélectionnez votre établissement dans la liste.
      </p>
    </div>
  );
}
