"use client";

import Link from "next/link";
import { Kanban, ImageIcon, ArrowRight, Zap, Lock, Database } from "lucide-react";

const features = [
  {
    icon: Kanban,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Kanban Task Board",
    description:
      "Manage your daily tasks in a beautiful Kanban board with 'To Do', 'In Progress', and 'Done' columns. Filter by date, drag-and-drop tasks, add priorities and tags.",
    href: "/tasks",
    cta: "Open Board",
    ctaColor: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    icon: ImageIcon,
    color: "text-special",
    bg: "bg-special/10",
    title: "Image Annotation",
    description:
      "Upload images and draw precise polygon annotations directly on the canvas. Slide through multiple images, manage shapes, and persist everything to the database.",
    href: "/annotate",
    cta: "Start Annotating",
    ctaColor: "bg-special text-white hover:bg-special/90",
  },
];

const techBadges = [
  { label: "Next.js 16" },
  { label: "React 19" },
  { label: "TypeScript" },
  { label: "Django" },
  { label: "DRF" },
  { label: "JWT Auth" },
  { label: "Tailwind v4" },
  { label: "Zustand" },
];

const pillars = [
  {
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    title: "Fast & Reactive",
    desc: "Built on Next.js App Router with React 19. Instant UI transitions with Zustand state management.",
  },
  {
    icon: Lock,
    color: "text-info",
    bg: "bg-info/10",
    title: "Secure by Default",
    desc: "JWT-based authentication, per-object ownership checks, and rate-limited API endpoints.",
  },
  {
    icon: Database,
    color: "text-success",
    bg: "bg-success/10",
    title: "Fully Persistent",
    desc: "All tasks, annotations and polygon data are stored on the Django backend and synced in real-time.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32 flex-1">
        {/* Blurred gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute top-10 right-0 w-[28rem] h-[28rem] rounded-full bg-special/20 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] rounded-full bg-info/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-6">
            🔥 Task Management + Image Annotation — in one app
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            404 Project{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-success to-info">
              Not Found
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A 2-in-1 productivity app that lets you manage tasks on a beautiful Kanban board and annotate images
            with precision polygon tools — all backed by a production-grade Django API.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-secondary text-secondary-foreground font-semibold hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── TECH BADGES ───────────────────────────────────────── */}
      <section className="py-8 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {techBadges.map((b) => (
              <span
                key={b.label}
                className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground"
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Two powerful tools. One app.</h2>
            <p className="mt-3 text-muted-foreground text-lg">Everything you need to stay organized and productive.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, color, bg, title, description, href, cta, ctaColor }) => (
              <div
                key={title}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Glow blob inside card */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl ${bg}`} />

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">{description}</p>

                <Link
                  href={href}
                  className={`inline-flex items-center gap-2 mt-6 self-start px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${ctaColor}`}
                >
                  {cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILLARS ───────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/30 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Production-grade from day one</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-special/10" />
        </div>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to build something great?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sign up and start managing your tasks or annotating your images right now.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-xl shadow-primary/30"
          >
            Create your account
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
