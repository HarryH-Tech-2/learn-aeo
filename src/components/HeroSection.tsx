"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { trackEvent } from "@/lib/analytics";
import { useAuthModal } from "@/components/AuthModal";
import CtaInside from "@/components/home/HeroCta";

// The door scene (2026-10-25): the poster is the closed door, then the clips play
// one after another: the door opens, the camera flies through it into a canyon of
// carved cliffs, and the last clip loops. Each clip ends on the exact still the next
// one starts from, so the hand-overs are cuts no one sees. The busy detail sits on the
// left and right thirds; the centre stays calm sky because the headline covers it.
const POSTER_SRC = "/hero-door-poster.webp";
// The clips carry the brightness/saturation lift baked in (a CSS filter on a playing video
// is redone every frame, and stuttered on weaker GPUs); -v2 names, since they are cached for 30 days.
const CLIPS = ["/hero-door-open-v2.mp4", "/hero-fly-canyon-v2.mp4", "/hero-loop-canyon-v2.mp4"];

// Phones in portrait see only the middle third of a 16:9 clip, where the canyon is
// empty sky. They get a 9:16 cut of the door instead: it opens and the doorway full
// of glowing glyphs fills the screen (3.6 MB against 12 MB). Same query for the poster.
const TALL_QUERY = "(max-aspect-ratio: 3/4)";
const TALL_POSTER_SRC = "/hero-door-poster-m.webp";
const TALL_CLIPS = ["/hero-door-open-m-v2.mp4", "/hero-door-world-m-v2.mp4"];

const POSTER_ALT =
  "A great carved Egyptian temple door, covered in painted hieroglyphs, with golden light shining through the gap";

/** Keep the still poster for visitors who asked for less motion or less data. */
function wantsStillHero(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (connection?.saveData === true) return true;
  // 12 MB of door scene is not worth it on a 2G-class link.
  return connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
}

/** Delay after `load` before the video is mounted. The poster (the LCP) has
 *  loaded by then; this is only a beat for hydration. It was 3.5 s plus an idle
 *  wait until 2026-10-25, which left visitors staring at a still door for ~5 s. */
const VIDEO_DELAY_MS = 300;

export default function HeroSection() {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const clipRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  // Which clip of the chain is showing; the ones before it have faded out.
  const [stage, setStage] = useState(0);
  // The <video> is only mounted once the page has loaded and gone idle. Until
  // then (and for reduced-motion / Data Saver visitors, forever) the poster
  // below is the hero — and, being in the first HTML and loaded eagerly, the LCP.
  const [clips, setClips] = useState<string[] | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (wantsStillHero()) return;
    let cancelled = false;
    let timer: number | undefined;
    let idle: number | undefined;

    const arm = () => {
      // Wait for `load` so the video never competes with the LCP image.
      timer = window.setTimeout(() => {
        const go = () => {
          if (!cancelled) setClips(window.matchMedia(TALL_QUERY).matches ? TALL_CLIPS : CLIPS);
        };
        if (typeof window.requestIdleCallback === "function") {
          idle = window.requestIdleCallback(go, { timeout: 300 });
        } else {
          go();
        }
      }, VIDEO_DELAY_MS);
    };

    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", arm);
      if (timer !== undefined) window.clearTimeout(timer);
      if (idle !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      }
    };
  }, []);

  useEffect(() => {
    if (!clips) return;
    const videos = clipRefs.current.slice(0, clips.length);
    if (videos.some((v) => !v)) return;
    const chain = videos as HTMLVideoElement[];

    // Imperatively set the muted/playsInline properties. React's `muted` prop
    // does not always land on the DOM element reliably, and iOS Safari will
    // block autoplay unless muted is set on the element BEFORE calling play().
    for (const v of chain) {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.playbackRate = 1;
    }

    // The clip that should be playing now; it moves along the chain as each one ends.
    let video = chain[0];

    const tryPlay = () => {
      // Re-assert muted right before play — iOS sometimes resets this.
      video.muted = true;
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay was blocked. Kick it off on the next user gesture
          // anywhere on the page (tap, scroll, touch).
          const kick = () => {
            video.muted = true;
            video.play().catch(() => {});
            window.removeEventListener("touchstart", kick);
            window.removeEventListener("touchend", kick);
            window.removeEventListener("click", kick);
            window.removeEventListener("scroll", kick);
          };
          window.addEventListener("touchstart", kick, { once: true, passive: true });
          window.addEventListener("touchend", kick, { once: true, passive: true });
          window.addEventListener("click", kick, { once: true });
          window.addEventListener("scroll", kick, { once: true, passive: true });
        });
      }
    };

    const cleanups: (() => void)[] = [];
    const on = (el: EventTarget, type: string, fn: () => void) => {
      el.addEventListener(type, fn);
      cleanups.push(() => el.removeEventListener(type, fn));
    };

    chain.forEach((clip, i) => {
      const next = chain[i + 1];
      on(clip, "playing", () => {
        if (i === 0) setPlaying(true);
        // Only show a clip once it is really moving: until then the one
        // before it holds its last frame, which is this clip's first.
        setStage((s) => Math.max(s, i));
        // Fetch the next clip while this one plays, not all of them at once.
        if (next && next.preload !== "auto") {
          next.preload = "auto";
          next.load();
        }
      });
      if (next) {
        on(clip, "ended", () => {
          video = next;
          next.currentTime = 0;
          tryPlay();
        });
      }
    });

    on(chain[0], "loadedmetadata", tryPlay);
    on(chain[0], "loadeddata", tryPlay);
    on(chain[0], "canplay", tryPlay);
    // Always attempt play() once, whatever the readyState. On iOS with Low
    // Power Mode (or cellular, where preload is ignored) the `autoplay`
    // attribute is refused silently and `loadeddata` never fires, so waiting
    // for it meant the tap-to-play fallback in tryPlay's catch never armed.
    tryPlay();

    // When returning to the tab (common when users come back from SERP tab),
    // resume playback.
    on(document, "visibilitychange", () => {
      if (document.visibilityState === "visible" && onScreen) tryPlay();
    });

    // Scrolled past the hero, the clip stops: nobody sees it, and decoding a full-screen
    // video while the page scrolls is what made the rest of the page feel heavy.
    let onScreen = true;
    const section = sectionRef.current;
    if (section && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) tryPlay();
        else video.pause();
      });
      io.observe(section);
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((off) => off());
  }, [clips]);

  // Art direction: the browser picks one poster by the media query and only fetches that one.
  // No `priority`: that preloads the wide poster for every screen, phones included.
  // The chosen poster is in the first HTML and loads eagerly anyway.
  const posterBase = { alt: POSTER_ALT, sizes: "100vw", loading: "eager" } as const;
  const widePoster = getImageProps({ ...posterBase, src: POSTER_SRC, width: 1920, height: 1080 }).props;
  const tallPoster = getImageProps({ ...posterBase, src: TALL_POSTER_SRC, width: 720, height: 1280 }).props;

  return (
    <section ref={sectionRef} className="hero-media relative pt-24 sm:pt-28 md:pt-32 min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pb-12 md:pb-20">
      {/* Media background: poster first (the LCP), video cross-fades over it */}
      <div className="absolute inset-0">
        <picture>
          <source media={TALL_QUERY} srcSet={tallPoster.srcSet} />
          <img {...widePoster} alt={POSTER_ALT} className="hero-bright absolute inset-0 w-full h-full object-cover" />
        </picture>
        {/* Reversed so earlier clips come later in the DOM and sit on top, without a
            z-index that would lift them over the shades below. */}
        {clips?.map((src, i) => {
          const last = i === clips.length - 1;
          // Each clip fades out once the next is playing underneath it.
          const shown = i === 0 ? playing && stage === 0 : stage <= i;
          return (
            <video
              key={src}
              ref={(el) => {
                clipRefs.current[i] = el;
              }}
              autoPlay={i === 0}
              loop={last}
              muted
              playsInline
              preload={i === 0 ? "auto" : "none"}
              aria-hidden="true"
              className={`hero-video absolute inset-0 w-full h-full object-cover${shown ? " is-playing" : ""}`}
              src={src}
            />
          );
        }).reverse()}
        {/* Light overall overlay — fixed black, never theme-tinted. Kept thin so the scene stays bright;
            the text gets its own shade below. */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Layered Background */}
      <div className="absolute inset-0">
        {/* Vignette: darker at the top for the navbar, fades into the page background below */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-90% to-[var(--hero-fade)]" />

        {/* Soft shade only behind the headline and buttons, so the text reads without dimming the whole scene */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 48% at 50% 52%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.2) 55%, transparent 80%)",
          }}
        />

        {/* Desert horizon glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[60%]"
          style={{
            background:
              "radial-gradient(ellipse 120% 60% at 50% 100%, rgba(212,168,50,0.08) 0%, rgba(184,146,42,0.03) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading — rendered visible at first paint (no opacity fade):
            Chrome ignores opacity-0 text for LCP, so the old 0.8 s delay
            pushed the metric out by nearly two seconds. */}
        {/* The phrase people search for, "learn hieroglyphics", is the heading itself; the space keeps the
            accessible name readable ("Learn Hieroglyphics") */}
        <h1 className="hero-title font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] mb-6 sm:mb-8 tracking-tight">
          <span className="text-sand-100">Learn</span>{" "}
          <br />
          <span className="text-gradient-gold font-medium">Hieroglyphics</span>
        </h1>

        {/* Subtitle */}
        <p
          className="enter-up hero-subtitle font-body text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-normal text-white"
          style={{ "--enter-delay": "0.2s" } as CSSProperties}
        >
          From the Valley of the Kings to the Rosetta Stone. Learn to read and
          write hieroglyphics through immersive lessons spanning 3,000 years of
          civilization.
        </p>

        {/* CTA Buttons */}
        <div
          className="enter-up flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ "--enter-delay": "0.4s" } as CSSProperties}
        >
          {session ? (
            <Link href="/dashboard" className="hero-cta">
              <CtaInside label="Enter the Academy" sub="Pick up where you left off" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackEvent("free_lesson_cta", { location: "hero" });
                openAuthModal({ next: "/lessons/expedition-begins" });
              }}
              className="hero-cta"
            >
              {/* Copy test, live 2026-09-19: "Your" → "My". Baseline for the 28 days before (GA4, homepage, all
                  free_lesson_cta buttons): 71 landing users → 19 clicked (27%) → 18 saw the sign-up modal → 8 signed up.
                  Compare the same report after ~4 weeks; bots are tagged from the same day, so judge on clicks per
                  engaged homepage visitor, not on raw users. (2026-10-12: this button took the 3D hero's gold
                  cartouche design, with "(Free)" moved to the second line: split the comparison there too.) */}
              <CtaInside label="Start My First Lesson" sub="Free · 10 minutes · no card needed" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom fade — kept short so the lower part of the video stays visible */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--hero-fade)] to-transparent" />
    </section>
  );
}
