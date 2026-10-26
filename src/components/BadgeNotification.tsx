"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  badge: { name: string; description: string; icon: string } | null;
  onDismiss: () => void;
};

export default function BadgeNotification({ badge, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div initial={{ opacity: 0, y: -30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-obsidian-light border border-gold-500/40 p-6 shadow-xl shadow-gold-500/10 text-center max-w-sm">
          <img src={badge.icon} alt={badge.name} className="w-16 h-16 mx-auto mb-3" />
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">Badge Earned</p>
          <h3 className="font-display text-lg text-sand-100 mb-1">{badge.name}</h3>
          <p className="font-body text-xs text-sand-400 mb-4">{badge.description}</p>
          <button onClick={onDismiss} className="font-body text-xs text-gold-500 hover:text-gold-400 transition-colors">Dismiss</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
