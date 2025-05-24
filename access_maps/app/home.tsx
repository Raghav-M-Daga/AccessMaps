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

      {/* Section 2: Why It Matters */}
      <section className="min-h-screen flex items-center bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-semibold text-blue-700"
          >
            Why It Matters
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-6 text-lg text-gray-600"
          >
            About 17% of public high school students in the US are individuals with
            disabilities. AccessMap empowers them to be heard, builds empathy,
            and promotes awareness across the entire community.
          </motion.p>
        </div>
      </section>

      {/* Section 3: Features */}
      <section className="bg-blue-50 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Effortless Reporting",
              description:
                "Quickly report inaccessible areas and events with just a few taps.",
            },
            {
              title: "Visual Accessibility Map",
              description:
                "See color-coded pins: Green for accessible, Red for barriers, and more.",
            },
            {
              title: "AI-Powered Suggestions",
              description:
                "Let GenAI enhance accessibility by suggesting fixes and inclusive wording.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-md text-center"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Footer */}
      <footer className="bg-white py-10 text-center text-sm text-gray-500">
        <p>© 2025 AccessMap: School Edition — Built for a more inclusive world</p>
      </footer>
    </div>
  );
}