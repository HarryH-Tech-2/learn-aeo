"use client";

/**
 * "Whose name goes on the door?" The one question Lesson 1 asks before the
 * first sign: the learner's name decides which signs they meet first.
 */
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { DEFAULT_DOOR_NAME } from "@/lib/content/door-name";

type Props = {
  /** Best guess at their first name (account, or the translator page) */
  initialName?: string;
  narrator: string;
  onSubmit: (name: string) => void;
};

export default function NameGate({ initialName = "", narrator, onSubmit }: Props) {
  const [name, setName] = useState(initialName);
  const usable = /[a-z]/i.test(name);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(usable ? name : "");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto">
      <form onSubmit={submit} className="lesson-sheet p-6 md:p-10 text-center">
        <p className="font-body text-sm text-gold-500 mb-3 font-semibold">{narrator}</p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-3">
          Whose name goes on the <span className="text-gradient-gold font-medium">door</span>?
        </h2>
        <p className="font-body text-sm md:text-base text-sand-400 font-light leading-relaxed max-w-md mx-auto mb-7">
          Scribes spelled foreign names with the alphabet signs, one sound at a time. Yours is buried on the lintel ahead.
          Brush it clear and the door opens.
        </p>

        <label htmlFor="door-name" className="sr-only">
          Your first name
        </label>
        <input
          id="door-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          maxLength={24}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="go"
          className="w-full max-w-sm mx-auto block text-center font-display text-2xl md:text-3xl text-sand-100 bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/70 outline-none px-4 py-3 placeholder:text-sand-600 placeholder:text-xl transition-colors rounded-xl"
        />

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button type="submit" disabled={!usable} className="lesson-btn text-sm py-3.5 px-8 justify-center disabled:opacity-40">
            Carve it on the door
          </button>
          <button type="button" onClick={() => onSubmit("")} className="lesson-btn-quiet text-sm py-3.5 px-8 justify-center">
            Use a pharaoh’s name
          </button>
        </div>
        <p className="font-body text-xs text-sand-500 mt-5">
          No name? The door will carry <span className="text-gold-400">{DEFAULT_DOOR_NAME}</span>, builder of the Great Pyramid.
        </p>
      </form>
    </motion.div>
  );
}
