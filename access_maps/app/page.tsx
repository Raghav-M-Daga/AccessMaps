"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../componenets/AuthProvider";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isInitialized, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrap login to also add user to Firestore
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Starting login process...');
      const userCredential = await login();
      console.log('Login successful:', userCredential);
      
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      const { uid, displayName, email, photoURL } = userCredential.user;
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          displayName,
          email,
          photoURL,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      router.replace("/map");
    } catch (error: any) {
      console.error("Error during login:", error);
      // Show a more specific error message
      if (error.code === 'auth/popup-blocked') {
        setError("Please allow pop-ups for this site to login with Google.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled. Please try again.");
      } else {
        setError(error.message || "Failed to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
          events. GenAI suggests inclusive event descriptions and accessibility
          improvements. A collaborative campus map where students can tag and
          describe accessibility challenges to help make the campus more accessible
          for everyone, even people with disabilities.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className={styles.heroButtonWrapper}
        >
          {user ? (
            <div className={styles.buttonGroup}>
              <button
                className={styles.heroButton}
                onClick={() => router.push("/map")}
              >
                Go to Map
              </button>
              <button
                className={`${styles.heroButton} ${styles.logoutButton}`}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                className={`${styles.heroButton} ${(isLoading || authLoading) ? styles.loading : ''}`}
                onClick={handleLogin}
                disabled={isLoading || authLoading || !isInitialized}
              >
                {isLoading || authLoading ? 'Signing in...' : 'Login with Google'}
              </button>
              {error && <p className={styles.errorText}>{error}</p>}
            </>
          )}
        </motion.div>
      </section>
      {/* ...rest of the file unchanged... */}
    </div>
  );
}
