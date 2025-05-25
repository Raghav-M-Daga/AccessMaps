"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const router = useRouter();
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
       A collaborative campus map where students can tag and describe accessibility
          challenges to help make the campus more accessible for everyone, even people
          with disabilities.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className={styles.heroButtonWrapper}
        >
          <button
            className={styles.heroButton}
            onClick={() => router.push("/map")}
          >
            View the Map
          </button>
        </motion.div>
      </section>
      {/* ...rest of the file unchanged... */}
    </div>
  );
}
