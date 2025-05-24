'use client';

import { useState } from 'react';
import { Issue } from '@/componenets/types';

interface Props {
  location: { lng: number; lat: number };
  onSubmit: (issue: Issue) => void;
}

export default function ReportForm({ location, onSubmit }: Props) {
  const [desc, setDesc] = useState('');

  return (
    <div className="space-y-6 flex flex-col items-center bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-sans text-center">Report Accessibility</h2>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Describe the accessibility issue..."
        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-200 min-h-[120px] bg-gray-50 text-gray-900 placeholder-gray-400 text-lg font-sans resize-none transition"
      />
      <div className="flex gap-4 w-full">
        <button
          onClick={() => {
            onSubmit({ location, description: desc, color: 'red' });
            setDesc('');
          }}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Issue
        </button>
        <button
          onClick={() => {
            onSubmit({ location, description: desc, color: 'green' });
            setDesc('');
          }}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Accessible
        </button>
      </div>
    </div>
  );
}
