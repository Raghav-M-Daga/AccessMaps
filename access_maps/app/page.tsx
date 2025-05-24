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
    <main className="min-h-screen w-full bg-white p-4">
      <div className="max-w-[1200px] mx-auto">
        {/* <Map issues={issues} onMapClick={handleMapClick} /> */}
        {selectedLocation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 border-2 border-gray-700">
              <ReportForm location={selectedLocation} onSubmit={handleNewIssue} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
