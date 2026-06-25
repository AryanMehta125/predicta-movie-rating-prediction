import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Wand2,
    ArrowRight,
    Heart,
    GitCompare,
    Zap,
    Share2,
    LineChart,
} from "lucide-react";
import HeroBackground from "../components/HeroBackground";
// import StatsCard from "../components/StatsCard";
import Seo from "../components/Seo";
import { fetchAnalytics } from "../lib/api";

const topPadding = "pt-20 md:pt-20";
const bottomPadding = "pb-0 md:pb-2";
const CAPABILITIES = [
    {
        icon: Wand2,
        title: "Pre-release forecasts",
        text: "Translate a film's brief into a confident audience rating, before a single ticket is sold.",
    },
    {
        icon: Heart,
        title: "Sentiment overlay",
        text: "Layer a test-screening review on top to see the forecast respond to real audience emotion.",
    },
    {
        icon: GitCompare,
        title: "Head-to-head face-offs",
        text: "Run two projects side by side and let the gauges decide which one wins the room.",
    },
    {
        icon: LineChart,
        title: "Cinema insights",
        text: "Live charts on ratings, genres, directors and audience scale — refreshed every visit.",
    },
    {
        icon: Zap,
        title: "Instant verdict",
        text: "A clear 0–10 forecast and the factors behind it, returned in under a second.",
    },
    {
        icon: Share2,
        title: "Share &amp; export",
        text: "Send a polished forecast link to your team, or export a print-ready PDF in a single tap.",
    },
];

const PIPELINE = [
    {
        step: "01",
        title: "Describe the project",
        text: "Tell us the cast, crew, genre and runtime. Nothing more.",
    },
    {
        step: "02",
        title: "We read the signals",
        text: "Director pedigree, cast chemistry and genre momentum, weighed against decades of cinema.",
    },
    {
        step: "03",
        title: "Receive the verdict",
        text: "A confident rating, a clear tag, and the factors that lifted or hurt it.",
    },
    {
        step: "04",
        title: "Refine with sentiment",
        text: "Drop in an audience review and watch the forecast adapt in real time.",
    },
];

export default function LandingPage() {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchAnalytics().then(setAnalytics).catch(() => {});
    }, []);

    return (
        <div className="page-enter">
            <Seo
                title="Forecast cinema success, before release"
                path="/"
                description="MovieAI is a quiet, confident way to forecast a film's audience rating before it ships. Test cast chemistry, director pedigree and audience sentiment in seconds."
            />

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section
                aria-labelledby="hero-heading"
                className="relative min-h-[92vh] flex items-center pt-32 pb-20 overflow-hidden"
            >
                <HeroBackground posters />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <br></br>
                        <br></br>
                        <br></br>
                        <h1
                            id="hero-heading"
                            className="font-display font-medium text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-ink"
                            data-testid="hero-headline"
                        >
                            Forecast a film&apos;s audience rating,{" "}
                            <span className="gradient-text">before release.</span>
                        </h1>

                        <p
                            className="mt-7 text-lg text-graphite max-w-xl mx-auto leading-relaxed"
                            data-testid="hero-subheading"
                        >
                            A quiet, confident way to test cast chemistry, director
                            pedigree and audience sentiment — distilled into a single
                            verdict in seconds.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                to="/predict"
                                className="btn-primary"
                                data-testid="hero-cta-predict"
                            >
                                Predict a rating <ArrowRight size={14} />
                            </Link>
                            <Link
                                to="/analytics"
                                className="btn-ghost"
                                data-testid="hero-cta-analytics"
                            >
                                Explore insights
                            </Link>
                        </div>

                        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-warm font-mono">
                            
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="hairline max-w-6xl mx-auto" />

            {/* ── STATS — quiet number strip ────────────────────────────── */}
            <section
                aria-labelledby="stats-heading"
                className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14"
            >
                <h2 id="stats-heading" className="sr-only">
                    Platform at a glance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/[0.06]">
                    <NumberCell
                        label="Films studied"
                        value={(analytics?.stats?.total_movies ?? 5000).toLocaleString()}
                        testId="stat-movies"
                    />
                    <NumberCell
                        label="Average verdict"
                        value={(analytics?.stats?.avg_rating ?? 5.9).toFixed(2)}
                        testId="stat-avg-rating"
                    />
                    <NumberCell
                        label="Directors tracked"
                        value={(analytics?.stats?.total_directors ?? 2300).toLocaleString()}
                        testId="stat-directors"
                    />
                    <NumberCell
                        label="Genres covered"
                        value={analytics?.stats?.total_genres ?? 20}
                        testId="stat-genres"
                    />
                </div>
            </section>

            <div className="hairline max-w-6xl mx-auto" />

            {/* ── CAPABILITIES ─────────────────────────────────────────── */}
            <section
    aria-labelledby="features-heading"
    className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16"
>
                <SectionHeader
                    eyebrow="Capabilities"
                    id="features-heading"
                    title={
                        <>
                            A studio for{" "}
                            <span className="gradient-text">cinema foresight.</span>
                        </>
                    }
                    subtitle="Six modules that turn a brief into a confident verdict."
                />

                <div className="mt-4 md:mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06]">
                    {CAPABILITIES.map((c, i) => (
                        <Capability key={c.title} c={c} i={i} />
                    ))}
                </div>
            </section>

            <div className="hairline max-w-6xl mx-auto" />

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <section
    aria-labelledby="pipeline-heading"
    className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-16"
>
                <SectionHeader
                    eyebrow="How it works"
                    id="pipeline-heading"
                    title="From a brief, to a verdict."
                    subtitle="Four quiet steps. No black boxes."
                />

                <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PIPELINE.map((p, i) => (
                        <motion.div
                            key={p.step}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="border-t border-black/10 pt-6"
                            data-testid={`pipeline-step-${i}`}
                        >
                            <div className="eyebrow text-champagne">{p.step}</div>
                            <h3 className="font-display font-medium text-xl mt-3 tracking-tight text-ink">
                                {p.title}
                            </h3>
                            <p className="text-sm text-graphite mt-3 leading-relaxed">
                                {p.text}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="hairline max-w-6xl mx-auto" />

            {/* ── COMPARE TEASER ──────────────────────────────────────── */}
            <section
                aria-labelledby="compare-heading"
                className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="eyebrow">Head-to-head</p>
                        <h2
                            id="compare-heading"
                            className="font-display font-medium text-3xl md:text-5xl mt-3 tracking-[-0.025em] text-ink leading-[1.1]"
                        >
                            Two projects.{" "}
                            <span className="gradient-text">One winner.</span>
                        </h2>
                        <p className="text-graphite mt-5 leading-relaxed max-w-md">
                            Race two films on identical gauges and reveal the winner
                            with a soft halo. Ideal for slate planning, pitch meetings
                            and editorial decisions.
                        </p>
                        <Link
                            to="/compare"
                            className="btn-primary mt-7 text-sm"
                            data-testid="compare-cta"
                        >
                            Start a face-off <ArrowRight size={14} />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-warm rounded-3xl p-10 grid grid-cols-2 gap-6"
                    >
                        <TeaseGauge label="Movie A" value="8.4" tag="Hit" winner />
                        <TeaseGauge label="Movie B" value="7.2" tag="Strong" />
                    </motion.div>
                </div>
            </section>

            <div className="hairline max-w-6xl mx-auto" />

            {/* ── CTA — calm closing ──────────────────────────────────── */}
            
            <section
                aria-labelledby="cta-heading"
                className={`relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${topPadding} ${bottomPadding} text-center`}
            >
                <Sparkles
                    size={28}
                    className="mx-auto text-champagne mb-4"
                    strokeWidth={1.5}
                />
                <h2
                    id="cta-heading"
                    className="font-display font-medium text-3xl md:text-5xl tracking-[-0.025em] text-ink leading-[1.1]"
                >
                    Ready to forecast your{" "}
                    <span className="gradient-text">next release?</span>
                </h2>
                <p className="text-graphite mt-5 max-w-md mx-auto leading-relaxed">
                    Enter your cast, crew and genre. A verdict appears in under a
                    second.
                </p>
                <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/predict"
                        className="btn-primary"
                        data-testid="cta-bottom-predict"
                    >
                        Launch predictor <ArrowRight size={14} />
                    </Link>
                    <Link
                        to="/sentiment"
                        className="btn-ghost"
                        data-testid="cta-bottom-sentiment"
                    >
                        Try sentiment
                    </Link>
                </div>
            </section>
        </div>
    );
}

function SectionHeader({ eyebrow, title, subtitle, id }) {
    return (
        <div className="max-w-3xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2
                id={id}
                className="font-display font-medium text-3xl md:text-5xl mt-3 tracking-[-0.025em] text-ink leading-[1.1]"
            >
                {title}
            </h2>
            {subtitle && (
                <p className="text-graphite mt-4 leading-relaxed">{subtitle}</p>
            )}
        </div>
    );
}

function NumberCell({ label, value, testId }) {
    return (
        <div
            className="bg-[var(--rice)] p-8 text-center"
            data-testid={testId}
        >
            <div className="eyebrow mb-3">{label}</div>
            <div className="font-display font-medium text-4xl text-ink tracking-tight">
                {value}
            </div>
        </div>
    );
}

function Capability({ c, i }) {
    const Icon = c.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="bg-[var(--rice)] p-8 group hover:bg-[var(--white-dove)] transition-colors"
            data-testid={`feature-card-${i}`}
        >
            <Icon size={20} className="text-champagne mb-5" strokeWidth={1.5} />
            <h3 className="font-display font-medium text-lg text-ink tracking-tight mb-2">
                {c.title}
            </h3>
            <p className="text-sm text-graphite leading-relaxed">{c.text}</p>
        </motion.div>
    );
}

function TeaseGauge({ label, value, tag, winner }) {
    return (
        <div className={`text-center ${winner ? "pulse-halo" : ""} rounded-2xl py-4`}>
            <div className="eyebrow mb-3">{label}</div>
            <div className="font-display font-medium text-5xl text-ink tracking-tight">
                {value}
            </div>
            <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium border border-black/10 text-graphite">
                {tag}
            </div>
        </div>
    );
}
