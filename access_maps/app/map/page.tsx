'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '@/componenets/AuthProvider';
import ReportForm from '@/componenets/ReportForm/ReportForm';
import { Issue } from '@/componenets/types';
import styles from './MapPage.module.css';

const Map = dynamic(() => import('@/componenets/Map'), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isInitialized } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{ lng: number; lat: number } | null>(null);
  const mapContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);  // Handle authentication and initialization
  useEffect(() => {
    console.log('Map Page - Auth State:', {
      isInitialized,
      isUserAuthenticated: !!user,
      isLoading: authLoading,
      userId: user?.uid
    });

    if (!isInitialized) {
      console.log('Map Page - Waiting for auth initialization...');
      return;
    }

    if (!user) {
      console.log('Map Page - No user after initialization, redirecting...');
      router.replace('/');
    }
  }, [user, router, isInitialized, authLoading]);

  // Subscribe to real-time pin updates
  useEffect(() => {
    if (!db) {
      console.error('Firestore not initialized');
      return;
    }

    console.log('Setting up Firestore pins listener...');
    const pinsCollection = collection(db, 'pins');
    
    const unsubscribe = onSnapshot(pinsCollection, (snapshot) => {
      console.log('Received pin update from Firestore');
      const updatedPins = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw pin data:', { id: doc.id, ...data });
        
        // Ensure the location data is properly structured
        if (!data.location || typeof data.location.lng !== 'number' || typeof data.location.lat !== 'number') {
          console.error('Invalid pin location data:', data.location);
          return null;
        }

        return {
          id: doc.id,
          location: {
            lng: data.location.lng,
            lat: data.location.lat
          },
          description: data.description || '',
          color: data.color || 'red',
          userId: data.userId,
          createdAt: data.createdAt
        } as Issue;
      }).filter(pin => pin !== null) as Issue[];
      
      console.log('Processed pins:', updatedPins);
      setIssues(updatedPins);
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to pin updates:', error);
      setIsLoading(false);
    });

    // Cleanup subscription when component unmounts
    return () => {
      console.log('Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [db]);

  const handleMapClick = async (location: { lng: number; lat: number }) => {
    console.log('Map Page - Click Handler - Auth State:', {
      isUserAuthenticated: !!user,
      userId: user?.uid
    });

    if (!user) {
      console.log('Map Page - Click blocked due to no auth');
      return;
    }

    setSelectedLocation(location);
    setPendingLocation(location);
  };
  const handleNewIssue = async (issue: Issue) => {
    if (!user || !db) {
      console.error('Cannot add pin: user or db not available');
      return;
    }

    try {      console.log('Attempting to add new pin with data:', { 
        location: issue.location,
        description: issue.description,
        color: issue.color,
        userId: user.uid 
      });
      
      const pinData = {
        location: issue.location,
        description: issue.description,
        color: issue.color,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'pins'), pinData);
      console.log('Pin added to Firestore:', docRef.id);
        const newPin = { ...pinData, id: docRef.id };
      console.log('Updating local state with new pin:', newPin);
      
      setIssues(prev => [...prev, newPin]);
      // Clear popup and pending states
      setSelectedLocation(null);
      setPendingLocation(null);
    } catch (error) {
      console.error('Error adding pin:', error);
      alert('Failed to add pin. Please try again.');
    }
  };

  const handleDeletePin = async (pinId: string, userId: string) => {
    if (!user || user.uid !== userId || !db) return;

    try {
      await deleteDoc(doc(db, 'pins', pinId));
      setIssues(prev => prev.filter(issue => issue.id !== pinId));
    } catch (error) {
      console.error('Error deleting pin:', error);
    }
  };  if (!isInitialized || authLoading) {
    return <div className={styles.loadingContainer}>Checking authentication...</div>;
  }

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading map data...</div>;
  }
  
  if (!user) {
    return <div className={styles.loadingContainer}>Please sign in to continue...</div>;
  }
  return (
    <main className={styles.main}>
      <button
        onClick={() => router.push('/')}
        className={styles.homeButton}
      >
        Home
      </button>
      <div className={styles.container}>
        <div ref={mapContainerRef} className={styles.mapWrapper}>
          <Map
            issues={issues}
            onMapClick={handleMapClick}
            pendingLocation={pendingLocation}
            onDeletePin={handleDeletePin}
            renderReportForm={(location) => (
              <ReportForm location={location} onSubmit={handleNewIssue} />
            )}
          />
        </div>
      </div>
    </main>
  );
}
