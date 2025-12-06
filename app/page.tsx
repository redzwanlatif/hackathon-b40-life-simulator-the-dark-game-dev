"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          B40 Life Simulator
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Walk through a Malaysian neighborhood. Make financial decisions.
          Experience the consequences.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-slate-400 text-sm mb-6">
            Every choice has a price. Some you pay now. Some you pay later.
          </p>

          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
            onClick={() => router.push("/setup")}
          >
            Start Your Journey
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-6 text-center"
        >
          <div className="p-4">
            <div className="text-3xl mb-2">🏠</div>
            <p className="text-slate-400 text-sm">Explore locations</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">💸</div>
            <p className="text-slate-400 text-sm">Make tough choices</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-slate-400 text-sm">Face consequences</p>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
