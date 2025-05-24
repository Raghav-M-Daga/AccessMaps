'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { Issue } from '@/componenets/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  issues: Issue[];
  onMapClick: (location: { lng: number; lat: number }) => void;
};

export default function Map({ issues, onMapClick }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-121.9942, 37.5655], // 📍 36300 Fremont Blvd
      zoom: 17,
    });

    mapRef.current.on('click', (e) => {
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    const markers: mapboxgl.Marker[] = [];

    issues.forEach((issue) => {
      const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(issue.location)
        .setPopup(new mapboxgl.Popup().setHTML(`<p>${issue.description}</p>`))
        .addTo(mapRef.current!);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [issues]);

  return <div ref={mapContainer} className="fixed inset-0 z-0" />;
}
