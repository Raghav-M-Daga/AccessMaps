"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../componenets/AuthProvider";
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import styles from "./HomePage.module.css";

interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: Date;
  userId: string;
}

export default function HomePage() {
  const router = useRouter();
  const { 
    user, 
    isLoading: authLoading, 
    isInitialized, 
    loginWithGoogle, 
    loginWithEmail,
    registerWithEmail, 
    logout 
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPins();
    }
  }, [user]);

  const loadUserPins = async () => {
    if (!user) return;
    setIsLoadingPins(true);
    try {
      const pinsRef = collection(db, 'pins');
      const q = query(pinsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const pins: Pin[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure the data has the correct types
        const pin: Pin = {
          id: doc.id,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          description: String(data.description || ''),
          createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
          userId: String(data.userId)
        };
        pins.push(pin);
      });
      setUserPins(pins);
    } catch (error) {
      console.error('Error loading pins:', error);
    } finally {
      setIsLoadingPins(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await loginWithGoogle();
      await saveUserToFirestore(userCredential.user);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = isRegistering
        ? await registerWithEmail(email, password)
        : await loginWithEmail(email, password);
      await saveUserToFirestore(userCredential.user);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    setError(error.message || 'Authentication failed. Please try again.');
  };

  const saveUserToFirestore = async (user: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeletePin = async (pinId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'pins', pinId));
      await loadUserPins();
    } catch (error) {
      console.error('Error deleting pin:', error);
    }
  };

  const handleEditPin = (pin: Pin) => {
    router.push(`/map?edit=${pin.id}`);
  };

  return (
    <div className={styles.wrapper}>
      {/* Section 1: Hero */}
      <section className={styles.heroSection}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.heroTitle}
        >
          AccessMap: School Edition
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={styles.heroDescription}
        >
          A collaborative campus map where students tag and describe accessibility
          challenges — stairs without ramps, broken elevators, or inaccessible club
          events. This allows people with disabilities to navigate campus safely.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className={styles.heroButtonWrapper}
        >
          {user ? (
            <>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.heroButton}
                  onClick={() => router.push("/map")}
                >
                  Go to Map
                </button>
                <button
                  className={`${styles.heroButton} ${styles.logoutButton}`}
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            
            </>
          ) : (
            <>
              {!showEmailForm ? (
                <div className={styles.authButtons}>
                  <button
                    className={`${styles.heroButton} ${isLoading || authLoading ? styles.loading : ''}`}
                    onClick={handleGoogleLogin}
                    disabled={isLoading || authLoading || !isInitialized}
                  >
                    {isLoading || authLoading ? 'Signing in...' : 'Continue with Google'}
                  </button>
                  <button
                    className={styles.heroButton}
                    onClick={() => setShowEmailForm(true)}
                    disabled={isLoading || authLoading || !isInitialized}
                  >
                    Use Email Instead
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className={styles.emailForm}>
                  <h3>{isRegistering ? 'Create an Account' : 'Sign In'}</h3>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                      required
                      autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`${styles.heroButton} ${isLoading || authLoading ? styles.loading : ''}`}
                    disabled={isLoading || authLoading || !isInitialized}
                  >
                    {isLoading || authLoading 
                      ? 'Processing...' 
                      : isRegistering 
                        ? 'Create Account' 
                        : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    className={styles.switchAuthMode}
                    onClick={() => setIsRegistering(!isRegistering)}
                  >
                    {isRegistering 
                      ? 'Already have an account? Sign In' 
                      : 'Need an account? Register'}
                  </button>
                  <button
                    type="button"
                    className={styles.switchAuthMode}
                    onClick={() => {
                      setShowEmailForm(false);
                      setError(null);
                    }}
                  >
                    Back to Options
                  </button>
                  {error && <p className={styles.errorText}>{error}</p>}
                </form>
              )}
              {error && <p className={styles.errorText}>{error}</p>}
            </>
          )}
        </motion.div>
      </section>
      {/* Section 2: Features / How It Works */}
      <section className={styles.featuresSection}>
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.sectionTitle}
        >
          How It Works
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className={styles.featuresWrapper}
        >
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🗺️</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Explore the Map</h3>
              <p className={styles.featureDescription}>
                Navigate the campus map to find locations and events.
              </p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📌</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Add Accessibility Pins</h3>
              <p className={styles.featureDescription}>
                Tag areas with accessibility challenges or highlights.
              </p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📝</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Describe Issues or Suggestions</h3>
              <p className={styles.featureDescription}>
                Provide details about the accessibility issues or suggestions for improvement.
              </p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🤝</div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Collaborate and Improve</h3>
              <p className={styles.featureDescription}>
                Work together with others to make the campus more accessible.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      {/* Section 3: About / Mission */}
      <section className={styles.aboutSection}>
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.sectionTitle}
        >
          Our Mission
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={styles.aboutDescription}
        >
          At AccessMap, we believe in an inclusive campus where everyone, regardless of their
          abilities, can navigate and access all areas with ease. Our mission is to empower
          students to share real-time accessibility information and work collaboratively to
          improve the campus environment.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className={styles.ctaWrapper}
        >
          <h3 className={styles.ctaTitle}>Join us in making a difference!</h3>
          <button
            className={styles.ctaButton}
            onClick={() => router.push("/map")}
          >
            Start Exploring the Map
          </button>
        </motion.div>
      </section>
      {/* Section 4: Testimonials (Optional) */}
      <section className={styles.testimonialsSection}>
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.sectionTitle}
        >
          What Users Say
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className={styles.testimonialsWrapper}
        >
          {/* Add testimonial items here */}
        </motion.div>
      </section>
      {/* Section 5: Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            &copy; {new Date().getFullYear()} AccessMap. All rights reserved.
          </p>
          <div className={styles.socialLinks}>
            {/* Add social media links here */}
          </div>
        </div>
      </footer>
    </div>
  );
}
