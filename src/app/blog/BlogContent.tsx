"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { reveal } from "@/components/reveal";
import type { BlogPost } from "@/lib/blog-posts";

/** What the index needs: never the article bodies (they were 200 KB of HTML). */
export type BlogSummary = Pick<BlogPost, "slug" | "title" | "excerpt" | "date" | "publishedAt" | "updatedAt" | "category" | "image" | "imageAlt">;

/** Shown while there are no posts. */
export function BlogComingSoon() {
  return (
    <section aria-labelledby="coming-soon-heading" className="reveal max-w-2xl" style={reveal(0.1, { y: 20 })}>
      <h2 id="coming-soon-heading" className="font-display text-2xl text-sand-100 mb-3">
        Articles are on their way
      </h2>
      <p className="font-body text-base text-sand-400 font-light leading-relaxed mb-6">
        We are writing the first posts now. In the meantime, the first lesson is free with a Google
        or email sign-in, and shows how answer engines choose their sources.
      </p>
      <Link href={FIRST_LESSON_PATH} className="btn-primary inline-flex justify-center text-base py-4 px-8">
        Start Lesson 1 Free
      </Link>
    </section>
  );
}

export default function BlogContent({ posts }: { posts: BlogSummary[] }) {
  return (
    <main className="grain-overlay">
      <Navbar />

      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 is-inview">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="reveal flex items-center gap-2 mb-8 font-body text-sm text-sand-600"
            style={reveal(0, { y: 10 })}
          >
            <Link
              href="/"
              className="hover:text-gold-400 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-sand-400">Blog</span>
          </nav>

          {/* Header */}
          <div className="reveal mb-16" style={reveal(0, { y: 30 })}>
            <h1 className="font-display text-5xl md:text-6xl font-light text-sand-100 mb-4">
              The{" "}
              <span className="text-gradient-gold font-medium">
                Learn AEO Blog
              </span>
            </h1>
            <p className="font-body text-lg text-sand-400 font-light max-w-2xl">
              Answer engine optimization for marketers: how AI answer engines
              choose their sources, and how to get your brand cited.
            </p>
          </div>

          {/* Posts Grid — server-rendered list; the CSS reveal only animates opacity/offset,
              so the links, titles and excerpts are all in the initial HTML for crawlers. */}
          {posts.length === 0 ? (
            <BlogComingSoon />
          ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0 m-0">
            {posts.map((post, i) => (
              <li key={post.slug} className="reveal" style={reveal(0.1 + i * 0.08, { y: 30, dur: 0.6 })}>
                <article className="h-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="card-ancient p-0 flex flex-col group overflow-hidden h-full"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.imageAlt}
                        width={600}
                        height={315}
                        sizes="(max-width: 768px) calc(100vw - 3rem), (max-width: 1024px) 50vw, 400px"
                        // The first row is the LCP candidate on every viewport.
                        priority={i < 3}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-3">
                        {post.category}
                      </p>
                      <h2 className="font-display text-xl font-semibold text-sand-100 mb-3 group-hover:text-gold-400 transition-colors">
                        {post.title}
                      </h2>
                      <p className="font-body text-sm text-sand-400 font-light leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      <div className="mt-6 flex items-center justify-between">
                        <time
                          dateTime={post.updatedAt ?? post.publishedAt}
                          className="font-body text-xs text-sand-500"
                        >
                          {post.updatedAt
                            ? `Updated ${new Date(post.updatedAt + "T00:00:00Z").toLocaleDateString("en-GB", {
                                month: "long",
                                year: "numeric",
                                timeZone: "UTC",
                              })}`
                            : post.date}
                        </time>
                        <span className="font-body text-xs text-gold-400 group-hover:text-gold-300 transition-colors">
                          Read article
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
