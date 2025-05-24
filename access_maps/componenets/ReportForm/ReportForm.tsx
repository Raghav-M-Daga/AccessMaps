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
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm text-gray-600">Location: {location.lng.toFixed(4)}, {location.lat.toFixed(4)}</p>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe the accessibility issue..."
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit Report</button>
    </form>
  );
}