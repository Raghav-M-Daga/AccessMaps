'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { Issue } from '@/componenets/types';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactDOM from "react-dom/client";

type Props = {
  issues: Issue[];
  onMapClick: (location: { lng: number; lat: number; x: number; y: number }) => void;
  pendingLocation: { lng: number; lat: number } | null;
  renderReportForm: (location: { lng: number; lat: number }) => React.ReactNode;
};

export default function Map({ issues, onMapClick, pendingLocation, renderReportForm }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const reportPopupRef = useRef<mapboxgl.Popup | null>(null);

  // Debug: log the Mapbox token
  console.log('Mapbox token:', process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-122.01635, 37.56464], // 📍 36300 Fremont Blvd
      zoom: 17.2,
    });

    mapRef.current.on('click', (e) => {
      // Only trigger onMapClick if the click is on the map canvas, not a marker
      const target = (e.originalEvent as MouseEvent).target as HTMLElement;
      if (target.classList.contains('mapboxgl-canvas')) {
        const rect = mapContainer.current!.getBoundingClientRect();
        const x = e.originalEvent.clientX - rect.left;
        const y = e.originalEvent.clientY - rect.top;
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat, x, y });
      }
    });

    return () => {
      // On map destroy, clear all report markers and the ref
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch {}
      });
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous report markers
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch {}
    });
    markersRef.current = [];

    // Add report markers
    issues.forEach((issue) => {
      const el = document.createElement('div');
      const pinColor = issue.color === 'red' ? '#ff0000' : issue.color === 'green' ? '#17cf40' : '#00d';
      const strokeColor = issue.color === 'red' ? '#cc0000' : issue.color === 'green' ? '#17cf40' : '#009';
      el.innerHTML = `
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="18" cy="44" rx="8" ry="4" fill="#0003"/>
          <path d="M18 46C18 46 32 28.5 32 18C32 8.61116 25.3888 2 18 2C10.6112 2 4 8.61116 4 18C4 28.5 18 46 18 46Z" fill="${pinColor}" stroke="${strokeColor}" stroke-width="2"/>
          <circle cx="18" cy="18" r="6" fill="#fff" stroke="${strokeColor}" stroke-width="2"/>
        </svg>
      `;
      el.style.transform = 'translate(-50%, -100%)';

      const popup = new mapboxgl.Popup({ 
        offset: 35,
        className: 'custom-popup'
      }).setHTML(
        `<div style='
          background: #fff;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          padding: 1rem;
          width: 280px;
          border: 1px solid #e5e7eb;
          font-family: Arial, Helvetica, sans-serif;
        '>
          <h3 style='
            font-size: 1.25rem;
            font-weight: 800;
            color: #111827;
            margin: 0 0 0 0;
            text-align: center;
          '>
            ${issue.color === 'red' ? 'Issue' : issue.color === 'green' ? 'Accessible' : 'New Report'}
          </h3>
          <p style='
            font-size: 1rem;
            color: #374151;
            line-height: 1.5;
            margin: 0;
            text-align: center;
          '>
            ${issue.description}
          </p>
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([issue.location.lng, issue.location.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [issues]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous report popup
    if (reportPopupRef.current) {
      reportPopupRef.current.remove();
      reportPopupRef.current = null;
    }

    if (pendingLocation) {
      const popupNode = document.createElement("div");
      // Render the form into the popup
      const root = ReactDOM.createRoot(popupNode);
      root.render(renderReportForm(pendingLocation));

      reportPopupRef.current = new mapboxgl.Popup({ 
        offset: [-32,-35],
        closeOnClick: false,
        closeButton: false,
        className: 'custom-popup'
      })
        .setLngLat([pendingLocation.lng, pendingLocation.lat])
        .setDOMContent(popupNode)
        .addTo(mapRef.current);
    }

    return () => {
      if (reportPopupRef.current) {
        reportPopupRef.current.remove();
        reportPopupRef.current = null;
      }
    };
  }, [pendingLocation]);

  return (
    <div
      ref={mapContainer}
      className={"mapContainer"}
    />
  );
}
