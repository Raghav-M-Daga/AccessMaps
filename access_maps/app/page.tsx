'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import ReportForm from '@/componenets/ReportForm/ReportForm';
import { Issue } from '@/componenets/types';

const Map = dynamic(() => import('@/componenets/Map'), { ssr: false });

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('issues');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(null);

  const handleMapClick = (location: { lng: number; lat: number }) => {
    setSelectedLocation(location);
  };

  const handleNewIssue = (issue: Issue) => {
    const updatedIssues = [...issues, issue];
    setIssues(updatedIssues);
    localStorage.setItem('issues', JSON.stringify(updatedIssues));
    setSelectedLocation(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('issues');
      if (stored) {
        setIssues(JSON.parse(stored));
      }
    }
  }, []);

  return (
    <main className="relative h-screen w-screen">
      <Map issues={issues} onMapClick={handleMapClick} />
      {selectedLocation && (
        <div className="absolute bottom-0 left-0 w-full bg-white bg-opacity-90 p-4 z-50 max-w-md mx-auto">
          <ReportForm location={selectedLocation} onSubmit={handleNewIssue} />
        </div>
      )}
    </main>
  );
}
