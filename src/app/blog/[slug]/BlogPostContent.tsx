"use client";

import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { reveal } from "@/components/reveal";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { BlogPost } from "@/lib/blog-posts";
import { useAuthPrompt } from "@/components/useAuthPrompt";
import AuthPromptCard from "@/components/AuthPromptCard";
import { BLOG_SCROLL_THRESHOLD, readingProgress } from "@/lib/auth-prompt";
import { trackEvent } from "@/lib/analytics";
import type { Heading } from "../blog-text";

/** The post minus its markdown: the body and quick answer arrive pre-rendered from the server (PostBody.tsx). */
export type PostSummary = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "excerpt"
  | "date"
  | "publishedAt"
  | "updatedAt"
  | "category"
  | "image"
  | "imageAlt"
  | "faqs"
>;
type Related = Pick<BlogPost, "slug" | "title" | "excerpt">;

type Props = {
  post: PostSummary | null;
  headings: Heading[];
  minutes: number;
  related: Related[];
  quickAnswer: ReactNode;
  body: ReactNode;
  /** The Sources list, rendered on the server (PostSources). */
  sources: ReactNode;
};

export default function BlogPostContent({
  post,
  headings,
  minutes,
  related,
  quickAnswer,
  body,
  sources,
}: Props) {
  const prompt = useAuthPrompt("blog_scroll");
  const proseRef = useRef<HTMLDivElement>(null);
  const firePrompt = prompt.fire;

  // Intent signal: the reader is about two-thirds through the article body.
  // Passive scroll listener; unsubscribes as soon as it has fired once.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = proseRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if (
        readingProgress(
          { top, height: rect.height },
          window.scrollY,
          window.innerHeight,
        ) >= BLOG_SCROLL_THRESHOLD
      ) {
        window.removeEventListener("scroll", onScroll);
        firePrompt();
      }
    };
    const onScroll = () => {
      if (raf === 0) raf = window.requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== 0) window.cancelAnimationFrame(raf);
    };
  }, [firePrompt]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!post) {
    return (
      <main className="grain-overlay">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl text-sand-100 mb-4">
              Post Not Found
            </h1>
            <Link
              href="/blog"
              className="font-body text-gold-400 hover:text-gold-300 transition-colors"
            >
              Back to blog
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="grain-overlay">
      <Navbar />

      <article className="min-h-screen pt-24 md:pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 is-inview">
          {/* Breadcrumb */}
          <div
            className="reveal flex items-center gap-2 mb-8 font-body text-sm text-sand-600"
            style={reveal(0, { y: 0 })}
          >
            <Link href="/" className="hover:text-gold-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-gold-400 transition-colors"
            >
              Blog
            </Link>
            <span>/</span>
            <span className="text-sand-400 truncate">{post.title}</span>
          </div>

          {/* Header */}
          <div className="reveal mb-10" style={reveal(0, { y: 0, dur: 0.8 })}>
            <div className="flex items-center gap-3 mb-4">
              <time
                dateTime={post.publishedAt}
                className="font-body text-xs text-sand-500"
              >
                {post.date}
              </time>
              <span className="text-sand-700">|</span>
              <span className="font-body text-xs text-sand-500">
                {minutes} min read
              </span>
              {post.updatedAt && (
                <>
                  <span className="text-sand-700">|</span>
                  <time
                    dateTime={post.updatedAt}
                    className="font-body text-xs text-gold-500"
                  >
                    Updated{" "}
                    {new Date(post.updatedAt + "T00:00:00Z").toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      },
                    )}
                  </time>
                </>
              )}
              <span className="text-sand-700">|</span>
              <span className="font-body text-xs text-sand-500">By the Learn AEO team</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-sand-100 mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="font-body text-lg text-sand-400 font-light leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Quick answer — answer-first block for readers, search snippets and AI assistants */}
          <section
            id="quick-answer"
            className="reveal mb-10 border border-gold-500/25 bg-gold-500/5 p-6 md:p-7"
            aria-labelledby="quick-answer-heading"
            style={reveal(0.15, { y: 0, dur: 0.6 })}
          >
            <p
              id="quick-answer-heading"
              className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3"
            >
              Quick answer
            </p>
            {/* #quick-answer-text is the SpeakableSpecification target in page.tsx JSON-LD. */}
            <p
              id="quick-answer-text"
              className="font-body text-base md:text-lg text-sand-200 leading-relaxed"
            >
              {quickAnswer}
            </p>
            <p className="font-body text-sm text-sand-500 mt-4">
              Want to read this for yourself?{" "}
              <Link
                href={FIRST_LESSON_PATH}
                className="text-gold-400 hover:text-gold-300 underline underline-offset-2 transition-colors"
              >
                Start the free first lesson
              </Link>
              : how ChatGPT and other AI search tools choose their sources, in about 25 minutes. Free
              with a Google or email sign-in.
            </p>
          </section>

          {/* Hero Image */}
          <div
            className="reveal relative mb-12"
            style={reveal(0.2, { y: 0, dur: 0.6 })}
          >
            <div className="absolute -inset-px bg-gradient-to-b from-gold-500/20 via-transparent to-gold-500/20 blur-sm" />
            {/* Cropped to 16:9: the square art took a whole screen and pushed the article below the fold */}
            <div className="relative border border-gold-700/30 overflow-hidden aspect-[16/9]">
              <Image
                src={post.image}
                alt={post.imageAlt}
                width={1024}
                height={1024}
                sizes="(max-width: 1024px) calc(100vw - 3rem), 960px"
                className="w-full h-full object-cover"
                // LCP element: eager + preload (priority) and an explicit high fetch priority.
                priority
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Table of contents — anchors match the ids the h2 renderer emits */}
          {headings.length >= 3 && (
            <nav
              aria-labelledby="toc-heading"
              className="reveal mb-12 border border-gold-700/20 bg-obsidian-light/40 p-6 md:p-7"
              style={reveal(0.25, { y: 0, dur: 0.6 })}
            >
              <p
                id="toc-heading"
                className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-4"
              >
                In this article
              </p>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {headings.map((h, i) => (
                  <li
                    key={h.id}
                    className="font-body text-sm text-sand-400 flex gap-3"
                  >
                    <span className="text-gold-600 tabular-nums shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${h.id}`}
                      className="hover:text-gold-400 transition-colors"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Article Content */}
          <div
            ref={proseRef}
            className="reveal prose-ancient"
            style={reveal(0.3, { y: 0, dur: 0.6 })}
          >
            {body}
          </div>

          {/* FAQs */}
          {post.faqs && post.faqs.length > 0 && (
            <div
              className="reveal mt-16 pt-8 border-t border-gold-700/20"
              style={reveal(0.35, { y: 0, dur: 0.6 })}
            >
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {post.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="border border-gold-700/15 bg-obsidian-light/50 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left group"
                    >
                      <span className="font-body text-base font-medium text-sand-200 group-hover:text-gold-400 transition-colors pr-4">
                        {faq.question}
                      </span>
                      <span
                        className={`flex-shrink-0 text-gold-600 text-lg transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}
                      >
                        +
                      </span>
                    </button>
                    {openFaq === i && (
                      <div
                        className="reveal"
                        style={reveal(0, { y: -6, dur: 0.3 })}
                      >
                        <div className="px-5 pb-5 pt-0">
                          <p className="font-body text-base text-sand-400 font-light leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sources}

          {/* Related Articles */}
          {related.length > 0 && (
            <div
              className="reveal mt-16 pt-8 border-t border-gold-700/20"
              style={reveal(0.4, { y: 0 })}
            >
              <h2 className="font-display text-2xl font-semibold text-sand-100 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {related.map((related) => {
                  return (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="card-ancient p-6 group block"
                    >
                      <h3 className="font-display text-lg font-semibold text-sand-100 mb-2 group-hover:text-gold-400 transition-colors">
                        {related.title}
                      </h3>
                      <p className="font-body text-sm text-sand-400 font-light leading-relaxed line-clamp-2">
                        {related.excerpt}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            className="reveal mt-16 pt-8 border-t border-gold-700/20"
            style={reveal(0.45, { y: 0 })}
          >
            <div className="relative border border-gold-700/20 bg-obsidian-light/50 p-8 md:p-10 text-center">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/30" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/30" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/30" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/30" />
              <h3 className="font-display text-2xl md:text-3xl font-light text-sand-100 mb-3">
                Ready to get cited by{" "}
                <span className="text-gradient-gold font-medium">
                  AI answers?
                </span>
              </h3>
              <p className="font-body text-sand-400 font-light mb-6 max-w-lg mx-auto">
                Lesson 1 follows a question from the prompt to the finished
                answer, so you can see how ChatGPT and other AI search tools choose their sources
                and what that means for your pages.
              </p>
              <Link
                href={FIRST_LESSON_PATH}
                onClick={() => {
                  trackEvent("free_lesson_cta", { location: "blog" });
                }}
                className="btn-primary inline-flex justify-center text-base py-4 px-8"
              >
                Start Lesson 1 Free
              </Link>
              <p className="font-body text-xs text-sand-500 mt-4">
                Lesson 1 is free with a Google or email sign-in. Lifetime access to all eight lessons is
                one payment later, if you want it.
              </p>
            </div>
          </div>

          {/* Back to blog */}
          <div className="reveal mt-8" style={reveal(0.5, { y: 0 })}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-body text-sm text-sand-400 hover:text-gold-400 transition-colors"
            >
              <span>Back to all posts</span>
            </Link>
          </div>
        </div>
      </article>

      {prompt.visible && (
        <AuthPromptCard
          title="See how AI answers pick their sources"
          body="Lesson 1 follows a question from the prompt to the finished answer. It is free with a Google or email sign-in."
          ctaLabel="Start Lesson 1"
          next={FIRST_LESSON_PATH}
          onAccept={prompt.accept}
          onDismiss={prompt.dismiss}
        />
      )}
      <Footer />
    </main>
  );
}
