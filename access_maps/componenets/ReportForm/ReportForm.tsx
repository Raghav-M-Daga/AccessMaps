'use client';

import { useState } from 'react';
import { Issue } from '@/componenets/types';
import styles from "./ReportForm.module.css";

interface Props {
  location: { lng: number; lat: number };
  onSubmit: (issue: Issue) => void;
}

export default function ReportForm({ location, onSubmit }: Props) {
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState<'red' | 'green'>('red');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ location, description: desc, color });
    setDesc('');
    setColor('red');
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Report Accessibility</h2>
        
        <textarea
          className={styles.textarea}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe the issue or accessibility feature..."
          required
        />

        {/* Suggested Buttons – replace description */}
        <div className="flex flex-row flex-wrap gap-2 mb-4 justify-center">
          {['ramp', 'elevator', 'door'].map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => setDesc(phrase)}
              className={styles.whiteButton}
            >
              {phrase}
            </button>
          ))}
        </div>

        <div className={styles.buttonRow}>
          <button
            type="submit"
            className={styles.redButton}
            onClick={() => setColor('red')}
          >
            Mark as Issue
          </button>
          <button
            type="button"
            className={styles.greenButton}
            onClick={() => {
              setColor('green');
              onSubmit({ location, description: desc, color: 'green' });
              setDesc('');
              setColor('red');
            }}
          >
            Mark as Accessible
          </button>
        </div>
      </form>
    </div>
  );
}