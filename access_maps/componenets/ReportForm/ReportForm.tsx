'use client';

import { useState } from 'react';
import { Issue } from '@/componenets/types';
import { useAuth } from '@/componenets/AuthProvider';
import styles from "./ReportForm.module.css";

interface Props {
  location: { lng: number; lat: number };
  onSubmit: (issue: Issue) => void;
  existingIssue?: Issue | null;
  onCancelEdit?: () => void;
}


export default function ReportForm({ location, onSubmit, existingIssue }: Props) {
  const [desc, setDesc] = useState(existingIssue?.description || '');
  const [color, setColor] = useState<'red' | 'green'>(
    existingIssue?.color === 'red' || existingIssue?.color === 'green' 
      ? existingIssue.color 
      : 'red'
  );
  const { user, isInitialized } = useAuth();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!isInitialized || !user) {
      alert('Please sign in to add pins');
      return;
    }

    onSubmit({
      location,
      description: desc,
      color,
      userId: user.uid,
      upvotes: 0,
      createdAt: new Date().toISOString()
    });
    
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
          placeholder="Describe the report..."
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
        </div>        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.redButton}
            onClick={() => {
              if (!desc.trim()) {
                alert('Please add a description');
                return;
              }
              onSubmit({ location, description: desc, color: 'red' });
              setDesc('');
            }}
          >
            Mark as Issue
          </button>
          <button
            type="button"
            className={styles.greenButton}
            onClick={() => {
              if (!desc.trim()) {
                alert('Please add a description');
                return;
              }
              onSubmit({ location, description: desc, color: 'green' });
              setDesc('');
            }}
          >
            Mark as Accessible
          </button>
        </div>
      </form>
    </div>
  );
}