'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import ReactDOM from 'react-dom/client';
import { Issue } from '@/componenets/types';
import { useAuth } from './AuthProvider';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.css';
import SearchBar from './SearchBar/SearchBar';

type Props = {
  issues: Issue[];
  onMapClick: (location: { lng: number; lat: number; x: number; y: number }) => void;
  pendingLocation: { lng: number; lat: number } | null;
  onDeletePin?: (pinId: string, userId: string) => void;
  onEditLocation?: (pinId: string, newLocation: { lng: number; lat: number }) => void;
  upvoteIssue: (pinId: string, userId: string) => Promise<void>;
  renderReportForm: (
    location: { lng: number; lat: number },
    existingIssue?: Issue | null
  ) => React.ReactNode;
};

export default function Map({
  issues,
  onMapClick,
  pendingLocation,
  onDeletePin,
  onEditLocation,
  upvoteIssue,
  renderReportForm
}: Props) {
  const { user, isInitialized } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const reportPopupRef = useRef<mapboxgl.Popup | null>(null);

  const flyToLocation = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 17,
        essential: true,
        duration: 1500
      });
    }
  }, []);

  const closePopup = () => {
    if (reportPopupRef.current) {
      reportPopupRef.current.remove();
      reportPopupRef.current = null;
    }
  };

  const closeAllPopups = () => {
    markersRef.current.forEach((marker) => {
      marker.getPopup()?.remove();
    });
    closePopup();
  }

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeAllPopups();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const updatePopupContent = useCallback(
    (marker: mapboxgl.Marker, issue: Issue) => {
      // Create base popup elements
      const popupRoot = document.createElement('div');
      popupRoot.className = styles.pinPopup;      const contentDiv = document.createElement('div');
      contentDiv.className = styles.popupContent;

      const title = document.createElement('h3');
      const isIssue = issue.color === 'red';
      title.className = `${styles.popupTitle} ${isIssue ? styles.issue : styles.feature}`;
      title.textContent = isIssue ? '⚠️ Accessibility Issue' : '✓ Accessible Feature';

      const description = document.createElement('p');
      description.className = styles.popupDescription;
      description.textContent = issue.description;

      contentDiv.appendChild(title);
      contentDiv.appendChild(description);
      popupRoot.appendChild(contentDiv);

      // Create actions section
      const actionsDiv = document.createElement('div');
      actionsDiv.className = styles.popupActions;

      // Create voting section - always show vote count
      const voteWrapper = document.createElement('div');
      voteWrapper.className = styles.voteWrapper;
      
      // Create and setup vote count display
      const voteCount = document.createElement('div');
      voteCount.className = styles.voteCount;
      
      const voteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      voteIcon.setAttribute('viewBox', '0 0 24 24');
      voteIcon.setAttribute('width', '18');
      voteIcon.setAttribute('height', '16');
      
      const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      iconPath.setAttribute('d', 'M12 4L2 20h20L12 4zm0 4l6 12H6l6-12z');
      voteIcon.appendChild(iconPath);
      
      const voteSpan = document.createElement('span');
      voteSpan.textContent = `${typeof issue.upvotes === 'number' ? issue.upvotes : 0}`;
      
      voteCount.appendChild(voteIcon);
      voteCount.appendChild(voteSpan);
      
      // Add upvote button if user can vote
      if (user && issue.id && issue.userId !== user.uid) {
        const hasVoted = Array.isArray(issue.votedUserIds) && issue.votedUserIds.includes(user.uid);
        
        const upvoteButton = document.createElement('button');
        upvoteButton.textContent = hasVoted ? 'Upvoted' : 'Upvote';
        upvoteButton.className = `${styles.upvoteButton} ${hasVoted ? styles.upvoted : ''}`;
        upvoteButton.disabled = hasVoted;

        if (!hasVoted) {          upvoteButton.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent the click from reaching the map
            marker.getElement().click(); // Keep the popup open
            
            if (!user || !issue.id) return;
            
            try {
              upvoteButton.disabled = true;
              upvoteButton.textContent = 'Upvoting...';
              
              await upvoteIssue(issue.id, user.uid);
              
              upvoteButton.textContent = 'Upvoted';
              upvoteButton.className = `${styles.upvoteButton} ${styles.upvoted}`;
              voteSpan.textContent = `${(typeof issue.upvotes === 'number' ? issue.upvotes : 0) + 1}`;
              
              // Ensure the popup stays open after upvoting
              marker.togglePopup();
              marker.togglePopup();
              
            } catch (err: any) {
              console.error('Upvote failed:', err);
              upvoteButton.disabled = false;
              upvoteButton.textContent = 'Upvote';
              alert(err?.message || 'Failed to upvote. Please try again.');
            }
            
            // Prevent event from bubbling up to the map
            e.stopImmediatePropagation();
            return false;
          };
        }
        
        voteWrapper.appendChild(upvoteButton);
      }
      
      voteWrapper.appendChild(voteCount);
      actionsDiv.appendChild(voteWrapper);

      // Add edit/delete if user is the creator
      if (user && issue.userId === user.uid && issue.id) {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = styles.editButton;
          editButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const popupNode = document.createElement('div');
          const root = ReactDOM.createRoot(popupNode);
          root.render(renderReportForm({ lng: issue.location.lng, lat: issue.location.lat }, issue));
          
          const popup = new mapboxgl.Popup({
            offset: [0, -15],
            closeOnClick: false,
            closeButton: true,
            maxWidth: '400px'
          })
            .setLngLat([issue.location.lng, issue.location.lat])
            .setDOMContent(popupNode)
            .addTo(mapRef.current!);
            
          reportPopupRef.current = popup;
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = styles.deleteButton;
        
        deleteButton.onclick = () => {
          if (issue.id && issue.userId) {
            onDeletePin?.(issue.id, issue.userId);
          }
        };

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
      }

      popupRoot.appendChild(actionsDiv);
      marker.getPopup()?.setDOMContent(popupRoot);
    },
    [user, upvoteIssue, onMapClick, onDeletePin]
  );

  const closeOtherPopups = useCallback((currentMarker: mapboxgl.Marker) => {
    markersRef.current.forEach((marker) => {
      if (marker !== currentMarker) {
        marker.getPopup()?.remove();
      }
    });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.01635, 37.56464],
      zoom: 17.2
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const handleMapClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!mapContainer.current) return;
      if (!(e.originalEvent?.target instanceof HTMLElement)) return;
      if (!e.originalEvent.target.classList.contains('mapboxgl-canvas')) return;

      if (!isInitialized || !user) return;

      const rect = mapContainer.current.getBoundingClientRect();
      const x = e.originalEvent.clientX - rect.left;
      const y = e.originalEvent.clientY - rect.top;
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat, x, y });
    },
    [onMapClick, user, isInitialized]
  );

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.on('click', handleMapClick);
    return () => {
      mapRef.current?.off('click', handleMapClick);
    };
  }, [handleMapClick]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    issues.forEach((issue) => {
      if (!issue?.location || typeof issue.location.lng !== 'number' || typeof issue.location.lat !== 'number') {
        return;
      }      const el = document.createElement('div');
      el.className = styles.marker;
      if (issue.id) {
        el.dataset.id = issue.id;
      }

      const pinColor = issue.color === 'red' ? '#dc2626' : '#15803d';
      el.innerHTML = `
        <svg width="38" height="48" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.075 0 0 8.075 0 18c0 8.45 13.05 23.425 17.075 27.9c1.075 1.2 2.775 1.2 3.85 0C24.95 41.425 38 26.45 38 18c0-9.925-8.075-18-18-18z" fill="${pinColor}"/>
          <path d="M18 25.5c-4.125 0-7.5-3.375-7.5-7.5S13.875 10.5 18 10.5s7.5 3.375 7.5 7.5-3.375 7.5-7.5 7.5z" fill="white"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker({ element: el, offset: [0, -17] }).setLngLat([
        issue.location.lng,
        issue.location.lat
      ]);      
      const popup = new mapboxgl.Popup({
        offset: [0, -43],
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px',
        className: styles.mapboxWrapper
      });

      marker.setPopup(popup);
      updatePopupContent(marker, issue);

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);

      marker.getElement().addEventListener('click', () => {
        closeOtherPopups(marker);
      });
    });
  }, [issues, updatePopupContent, closeOtherPopups]);

  useEffect(() => {
    if (!mapRef.current) return;

    closePopup();

    if (pendingLocation) {
      const popupNode = document.createElement('div');
      const root = ReactDOM.createRoot(popupNode);
      root.render(renderReportForm(pendingLocation, null));

      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.style.display = 'flex';
      buttonsWrapper.style.gap = '8px';
      buttonsWrapper.style.marginTop = '8px';
      buttonsWrapper.style.justifyContent = 'space-between';

      const labels = ['no ramp', 'broken elevator', 'ramp'];
      labels.forEach((label) => {
        const btn = document.createElement('button');
        btn.innerText = label;
        btn.style.backgroundColor = 'white';
        btn.style.color = 'black';
        btn.style.border = '1px solid #ccc';
        btn.style.padding = '4px 8px';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '0.9rem';

        btn.onclick = () => {
          const textarea = popupNode.querySelector('textarea, input[type="text"]') as HTMLInputElement | HTMLTextAreaElement;
          if (textarea) {
            textarea.value = label;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
        };

        buttonsWrapper.appendChild(btn);
      });

      popupNode.appendChild(buttonsWrapper);

      const popup = new mapboxgl.Popup({
        offset: [0, -15],
        closeOnClick: false,
        closeButton: true,
        maxWidth: '400px'
      })
        .setLngLat([pendingLocation.lng, pendingLocation.lat])
        .setDOMContent(popupNode)
        .addTo(mapRef.current);

      reportPopupRef.current = popup;
    }

    return () => closePopup();
  }, [pendingLocation, renderReportForm]);
  return (
    <div
      ref={mapContainer}
      className={`${styles.mapContainer} ${styles.mapboxWrapper}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <SearchBar onLocationSelect={flyToLocation} />
    </div>
  );
}
