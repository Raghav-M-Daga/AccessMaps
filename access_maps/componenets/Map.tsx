'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useCallback } from 'react';
import { Issue } from '@/componenets/types';
import { useAuth } from './AuthProvider';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactDOM from "react-dom/client";

type Props = {
  issues: Issue[];
  onMapClick: (location: { lng: number; lat: number; x: number; y: number }) => void;
  pendingLocation: { lng: number; lat: number } | null;
  onDeletePin?: (pinId: string, userId: string) => void;
  renderReportForm: (location: { lng: number; lat: number }) => React.ReactNode;
};

export default function Map({ 
  issues, 
  onMapClick, 
  pendingLocation, 
  onDeletePin, 
  renderReportForm 
}: Props) {
  const { user, isInitialized } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const reportPopupRef = useRef<mapboxgl.Popup | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && pendingLocation) {
        console.log('Escape pressed, canceling pin creation');
        reportPopupRef.current?.remove();
        reportPopupRef.current = null;
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [pendingLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found in environment variables');
      return;
    }

    try {
      console.log('Initializing map with token:', token.substring(0, 8) + '...');
      mapboxgl.accessToken = token;
      
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.01635, 37.56464],
        zoom: 17.2,
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded successfully');
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      console.log('Cleaning up map');
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map clicks
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!mapContainer.current) return;
    
    if (!(e.originalEvent?.target instanceof HTMLElement)) return;
    if (!e.originalEvent.target.classList.contains('mapboxgl-canvas')) return;
      if (!isInitialized || !user) {
      // Don't show error message here, let the parent handle auth state
      return;
    }

    const rect = mapContainer.current.getBoundingClientRect();
    const x = e.originalEvent.clientX - rect.left;
    const y = e.originalEvent.clientY - rect.top;
    onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat, x, y });
  }, [onMapClick, user, mapContainer]);

  // Set up click listener
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.on('click', handleMapClick);
    
    return () => {
      mapRef.current?.off('click', handleMapClick);
    };
  }, [handleMapClick]);
  // Update markers
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.loaded()) {
      console.log('Map not ready, deferring marker update');
      return;
    }

    console.log('Updating markers, current issues:', issues.length);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];    // Add markers for each issue
    issues.forEach((issue) => {
      if (!issue || !issue.location || typeof issue.location.lng !== 'number' || typeof issue.location.lat !== 'number') {
        console.error('Invalid issue data:', issue);
        return;
      }

      try {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        const pinColor = issue.color === 'red' ? '#dc2626' : '#15803d';

        el.innerHTML = `
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            <path d="M18 0C8.075 0 0 8.075 0 18c0 8.45 13.05 23.425 17.075 27.9c1.075 1.2 2.775 1.2 3.85 0C24.95 41.425 38 26.45 38 18c0-9.925-8.075-18-18-18z" fill="${pinColor}"/>
            <path d="M18 25.5c-4.125 0-7.5-3.375-7.5-7.5S13.875 10.5 18 10.5s7.5 3.375 7.5 7.5-3.375 7.5-7.5 7.5z" fill="white"/>
          </svg>
        `;

        const popupContent = document.createElement('div');
        popupContent.className = 'pin-popup';
        popupContent.innerHTML = `
          <div style="
            padding: 1.5rem;
            min-width: 240px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">
            <h3 style="
              margin: 0 0 1rem;
              text-align: center;
              font-size: 1.1rem;
              font-weight: 600;
              color: ${pinColor};
            ">
              ${issue.color === 'red' ? '⚠️ Accessibility Issue' : '✓ Accessible Feature'}
            </h3>
            <p style="
              margin: 0 0 1rem;
              text-align: center;
              color: #374151;
              font-size: 0.95rem;
              line-height: 1.4;
            ">${issue.description}</p>
            ${issue.userId === user?.uid && issue.id ? `
              <div style="margin-top: 1rem; text-align: center;">
                <button 
                  onclick="window.deletePin('${issue.id}', '${issue.userId}')"
                  style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.625rem 1.25rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: background-color 0.2s;
                  "
                  onmouseover="this.style.backgroundColor='#dc2626'"
                  onmouseout="this.style.backgroundColor='#ef4444'"
                >
                  Delete Pin
                </button>
              </div>
            ` : ''}
          </div>
        `;

        // Create and add the marker
        const popup = new mapboxgl.Popup({
          offset: [0, -30],
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px'
        }).setDOMContent(popupContent);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([issue.location.lng, issue.location.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
        console.log('Added marker for issue:', issue.id);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });

    // Add delete function to window
    if (onDeletePin) {
      (window as any).deletePin = (pinId: string, userId: string) => {
        onDeletePin(pinId, userId);
      };
    }

    return () => {
      delete (window as any).deletePin;
    };
  }, [issues, user, onDeletePin]);

  // Handle pending location popup
  useEffect(() => {
    if (!mapRef.current) return;

    if (reportPopupRef.current) {
      reportPopupRef.current.remove();
      reportPopupRef.current = null;
    }

    if (pendingLocation) {
      const popupNode = document.createElement('div');
      const root = ReactDOM.createRoot(popupNode);
      root.render(renderReportForm(pendingLocation));

      reportPopupRef.current = new mapboxgl.Popup({
        offset: [-32, -35],
        closeOnClick: false,
        closeButton: false
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
  }, [pendingLocation, renderReportForm]);

  return (
    <div
      ref={mapContainer}
      className={"mapContainer"}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
