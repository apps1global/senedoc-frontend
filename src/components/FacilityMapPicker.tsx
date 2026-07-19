"use client";

import { useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 14.4974, lng: -14.4524 };
const DEFAULT_ZOOM = 6;

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type FacilityMapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
};

export function FacilityMapPicker({ latitude, longitude, onChangeLocation }: FacilityMapPickerProps) {
  const [locating, setLocating] = useState(false);
  const hasMarker = latitude != null && longitude != null;
  const center = hasMarker ? { lat: latitude as number, lng: longitude as number } : DEFAULT_CENTER;

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChangeLocation(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  if (!API_KEY) {
    return (
      <p className="text-sm text-coral mb-4">
        Clé Google Maps manquante (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY absente de .env.local).
      </p>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Emplacement sur la carte *</label>
      <p className="text-xs text-gray-500 mb-2">
        Cliquez sur la carte pour placer un repère à l'emplacement de votre établissement.
      </p>

      <div className="h-56 rounded-xl overflow-hidden border border-gray-200">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={hasMarker ? 14 : DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={(e: any) => {
              const latLng = e?.detail?.latLng;
              if (latLng) {
                onChangeLocation(latLng.lat, latLng.lng);
              }
            }}
          >
            {hasMarker && (
              <Marker
                position={center}
                draggable
                onDragEnd={(e: any) => {
                  const pos = e?.latLng;
                  if (pos) onChangeLocation(pos.lat(), pos.lng());
                }}
              />
            )}
          </Map>
        </APIProvider>
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="mt-2 text-sm text-teal font-medium disabled:opacity-50"
      >
        {locating ? "Localisation…" : "📍 Utiliser ma position actuelle"}
      </button>

      {hasMarker ? (
        <p className="text-xs text-gray-500 mt-1">
          {(latitude as number).toFixed(5)}, {(longitude as number).toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-coral mt-1">Aucun emplacement sélectionné</p>
      )}
    </div>
  );
}
