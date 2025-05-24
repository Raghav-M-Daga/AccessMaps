'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import ReportForm from '@/componenets/ReportForm/ReportForm';
import { Issue } from '@/componenets/types';

const Map = dynamic(() => import('@/componenets/Map'), { ssr: false });

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number; x: number; y: number } | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{ lng: number; lat: number; x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (location: { lng: number; lat: number; x: number; y: number }) => {
    setSelectedLocation(location);
    setPendingLocation(location);
  };

  const handleNewIssue = (issue: Issue) => {
    const updatedIssues = [...issues, issue];
    setIssues(updatedIssues);
    localStorage.setItem('issues', JSON.stringify(updatedIssues));
    setSelectedLocation(null);
    setPendingLocation(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('issues');
      if (stored) {
        setIssues(JSON.parse(stored));
      }
    }
  }, []);

  // Cancel in-progress report with Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLocation) {
        setSelectedLocation(null);
        setPendingLocation(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedLocation]);

  const pinsToShow = [
    ...issues,
    ...(pendingLocation ? [{ location: pendingLocation, description: '', color: 'blue' as const }] : [])
  ];

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div ref={mapContainerRef} className="relative w-full">
          <Map
            issues={pinsToShow}
            onMapClick={handleMapClick}
            pendingLocation={pendingLocation}
            renderReportForm={(location) => (
              <ReportForm location={location} onSubmit={handleNewIssue} />
            )}
          />
        </div>

        <button
          className="mt-6 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 border-2 border-white focus:outline-none focus:ring-4 focus:ring-pink-200"
          onClick={() => {
            setIssues([]);
            localStorage.removeItem('issues');
          }}
        >
          <span className="inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Pins
          </span>
        </button>
      </div>
    </main>
  );
}
