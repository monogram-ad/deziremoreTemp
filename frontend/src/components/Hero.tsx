"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-custom py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary mb-5">
              Premium Ethnic Collection
            </span>

            <h1 className="text-5xl md:text-7xl font-heading leading-tight">
              Timeless
              <span className="block text-primary">
                Elegance
              </span>
              For Every Occasion
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Discover handpicked sarees,
              lehengas, kurtas and festive
              collections crafted to celebrate
              tradition with modern luxury.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/category/sarees"
                className="btn-primary"
              >
                Shop Now
              </Link>

              <Link
                href="/category/lehengas"
                className="btn-outline"
              >
                Explore Collection
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="luxury-card overflow-hidden">
              <img
                src="/hero.svg"
                alt="Deziremore Collection"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}