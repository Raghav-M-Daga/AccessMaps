"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="w-full overflow-x-hidden">
      {/* Section 1: Hero */}
      <section className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-blue-800"
        >
          AccessMap: School Edition
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl max-w-2xl text-gray-700"
        >
          A collaborative campus map where students tag and describe accessibility
          challenges — stairs without ramps, broken elevators, or inaccessible club
          events. GenAI suggests inclusive event descriptions and accessibility
          improvements.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-8"
        >
          <button
            className="rounded-2xl px-6 py-3 text-lg shadow-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
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
