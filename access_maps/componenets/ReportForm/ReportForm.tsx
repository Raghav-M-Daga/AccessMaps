'use client';

import { useState } from 'react';
import { Issue } from '@/componenets/types';

interface Props {
  location: { lng: number; lat: number };
  onSubmit: (issue: Issue) => void;
}

export default function ReportForm({ location, onSubmit }: Props) {
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ location, description: desc });
    setDesc('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Report Accessibility Issue</h2>
      <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded">Location: {location.lng.toFixed(4)}, {location.lat.toFixed(4)}</p>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe the accessibility issue..."
        className="w-full p-3 border-2 border-gray-700 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-700 min-h-[100px] bg-gray-800 text-white placeholder-gray-400"
      />
      <button 
        type="submit" 
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
      >
        Submit Report
      </button>
    </form>
  );
}
