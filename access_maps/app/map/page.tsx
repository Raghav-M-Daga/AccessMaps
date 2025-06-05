'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, onSnapshot, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '@/componenets/AuthProvider';
import ReportForm from '@/componenets/ReportForm/ReportForm';
import { Issue } from '@/componenets/types';
import styles from './MapPage.module.css';
import { Home } from 'lucide-react';

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
        
        // Ensure proper data structure and default values
        if (!data.location || typeof data.location.lng !== 'number' || typeof data.location.lat !== 'number') {
          console.error('Invalid pin location data:', data.location);
          return null;
        }
        
        // Ensure all fields have proper default values
        const processedPin = {
          id: doc.id,
          location: {
            lng: data.location.lng,
            lat: data.location.lat
          },
          description: data.description || '',
          color: data.color || 'red',
          userId: data.userId,
          createdAt: data.createdAt,
          upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
          votedUserIds: Array.isArray(data.votedUserIds) ? data.votedUserIds : []
        } as Issue;

        console.log('Processed pin data:', {
          id: processedPin.id,
          upvotes: processedPin.upvotes,
          votedUserIds: processedPin.votedUserIds,
          hasVotedUsers: Array.isArray(processedPin.votedUserIds)
        });

        return processedPin;
      }).filter(pin => pin !== null) as Issue[];
      
      setIssues(updatedPins);
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to pin updates:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
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
        createdAt: new Date().toISOString(),
        upvotes: 0,
        votedUserIds: []
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
  };  const upvoteIssue = async (pinId: string, userId: string) => {
    if (!user || !db) {
      throw new Error('User must be logged in to upvote');
    }

    // Use a transaction to ensure data consistency
    const pinRef = doc(db, 'pins', pinId);
    try {
      console.log('Starting upvote transaction for pin:', { pinId, userId });
      
      const pinDoc = await getDoc(pinRef);
      if (!pinDoc.exists()) {
        throw new Error('Pin not found');
      }

      const pinData = pinDoc.data();
      
      // Validate upvote conditions
      if (pinData.userId === userId) {
        throw new Error('Cannot upvote your own pin');
      }
      
      const votedUserIds = Array.isArray(pinData.votedUserIds) ? pinData.votedUserIds : [];
      if (votedUserIds.includes(userId)) {
        throw new Error('You have already upvoted this pin');
      }

      // Calculate new values
      const currentUpvotes = typeof pinData.upvotes === 'number' ? pinData.upvotes : 0;
      const newUpvotes = currentUpvotes + 1;
      
      console.log('Updating pin with new upvote data:', {
        currentUpvotes,
        newUpvotes,
        currentVoters: votedUserIds,
        newVoter: userId
      });

      // Update the pin data
      await updateDoc(pinRef, {
        upvotes: newUpvotes,
        votedUserIds: arrayUnion(userId),
      });

    } catch (error) {
      console.error('Error upvoting pin:', error);
      throw error;
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
  <Home size={20} style={{  }} />
</button>
      <div className={styles.container}>
        <div ref={mapContainerRef} className={styles.mapWrapper}>
          <Map
            issues={issues}
            onMapClick={handleMapClick}
            pendingLocation={pendingLocation}
            onDeletePin={handleDeletePin}
            upvoteIssue={upvoteIssue}
            renderReportForm={(location) => (
              <ReportForm location={location} onSubmit={handleNewIssue} />
            )}
          />
        </div>
      </div>
    </main>
  );
}
