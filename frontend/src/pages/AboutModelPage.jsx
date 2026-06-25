import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Layers,
    Sparkles,
    Heart,
    LineChart,
    Film,
    Zap,
    Crosshair,
    Award,
} from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import Seo from "../components/Seo";
import { fetchModelInfo } from "../lib/api";

const STEPS = [
    {
        icon: Film,
        title: "Real cinema history",
        text: "A curated archive of real films feeds every forecast — from cult classics to recent releases — giving the engine deep cinematic memory.",
        accent: "#C9A05C",
    },
    {
        icon: Crosshair,
        title: "Clean the signal",
        text: "Each film is normalised: messy runtimes, vote spans and multi-genre tags are reconciled so the engine compares apples with apples.",
        accent: "#7A8C7A",
    },
    {
        icon: Layers,
        title: "Score the talent",
        text: "Directors, lead actors and supporting cast are rated by historical pedigree — quietly capturing star-power and creative momentum.",
        accent: "#7A8C7A",
    },
    {
        icon: Sparkles,
        title: "Ensemble forecast",
        text: "Many independent perspectives vote on the verdict. Their agreement becomes your confidence; their disagreement becomes humility.",
        accent: "#B5634B",
    },
    {
        icon: Heart,
        title: "Audience overlay",
        text: "When you supply a test-screening review, our sentiment layer reads the emotional pulse and adjusts the forecast in real time.",
        accent: "#C9A05C",
    },
    {
        icon: Award,
        title: "Final verdict",
        text: "A clamped 0–10 rating returned in under a second, paired with the factors that lifted or hurt the score.",
        accent: "#C9A05C",
    },
];

export default function AboutModelPage() {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        fetchModelInfo()
            .then(setInfo)
            .catch(() => {});
    }, []);

    const accuracyPct =
        info?.metrics?.rf_r2 != null ? Math.round(info.metrics.rf_r2 * 100) : null;

    return (
        <div className="page-enter relative pt-32 pb-20 min-h-screen">
            <Seo
                title="How MovieAI works"
                path="/about"
                description="A transparent look at how MovieAI translates film metadata and audience sentiment into a confident pre-release verdict."
            />
            <HeroBackground />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="eyebrow text-center">⌬ Under the hood</p>
                <h1 className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter text-center">
                    How <span className="gradient-text">MovieAI</span> works
                </h1>
                <p className="text-center text-[color:rgba(23,23,23,0.6)] mt-3 max-w-2xl mx-auto">
                    A transparent walkthrough — no black boxes, no hidden tricks. Every
                    number in your forecast has a clear origin.
                </p>

                {/* ── Headline metrics ─────────────────────────────────── */}
                <section
                    aria-labelledby="metrics-heading"
                    className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <h2 id="metrics-heading" className="sr-only">
                        Engine performance
                    </h2>
                    <Metric
                        label="Accuracy Score"
                        value={accuracyPct != null ? `${accuracyPct}%` : "—"}
                        accent="#C9A05C"
                        hint="How well forecasts align with reality."
                    />
                    <Metric
                        label="Average Error"
                        value={
                            info?.metrics?.rf_mae != null
                                ? `±${info.metrics.rf_mae.toFixed(2)}`
                                : "—"
                        }
                        accent="#7A8C7A"
                        hint="Typical distance from the true rating."
                    />
                    <Metric
                        label="Films Studied"
                        value={info?.dataset_size?.toLocaleString() ?? "—"}
                        accent="#B5634B"
                        hint="Cleaned films informing every forecast."
                    />
                    <Metric
                        label="Genres Covered"
                        value={info?.unique_genres ?? "—"}
                        accent="#C9A05C"
                        hint="Distinct genres in the archive."
                    />
                </section>

                {/* ── Pipeline timeline ─────────────────────────────────── */}
                <section
                    aria-labelledby="pipeline-heading"
                    className="mt-16 relative"
                >
                    <h2 id="pipeline-heading" className="sr-only">
                        Forecast pipeline
                    </h2>
                    <div
                        className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#C9A05C] via-[#7A8C7A] to-[#B5634B] opacity-30"
                        aria-hidden
                    />
                    <div className="space-y-10">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const left = i % 2 === 0;
                            return (
                                <motion.div
                                    key={s.title}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                    className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
                                    data-testid={`about-step-${i}`}
                                >
                                    <div
                                        className={`${left ? "md:text-right md:pr-12" : "md:text-left md:pl-12 md:col-start-2"} relative`}
                                    >
                                        <div className="glass rounded-3xl p-5 inline-block max-w-md">
                                            <div
                                                className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${left ? "md:ml-auto" : ""}`}
                                                style={{
                                                    background: `${s.accent}22`,
                                                    borderColor: `${s.accent}55`,
                                                }}
                                            >
                                                <Icon
                                                    size={18}
                                                    style={{ color: s.accent }}
                                                />
                                            </div>
                                            <h3 className="font-display font-bold text-xl">
                                                <span
                                                    className="font-mono text-xs mr-2 opacity-60"
                                                    style={{ color: s.accent }}
                                                >
                                                    0{i + 1}
                                                </span>
                                                {s.title}
                                            </h3>
                                            <p className="text-sm text-[color:rgba(23,23,23,0.65)] mt-2 leading-relaxed">
                                                {s.text}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="absolute left-6 md:left-1/2 -translate-x-1/2 top-6 w-4 h-4 rounded-full border-2"
                                        style={{
                                            background: "#FAF5EF",
                                            borderColor: s.accent,
                                            boxShadow: `0 0 20px ${s.accent}88`,
                                        }}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Drivers ───────────────────────────────────────────── */}
                <section
                    aria-labelledby="drivers-heading"
                    className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <div className="glass rounded-3xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <LineChart size={16} className="text-[#C9A05C]" />
                            <h2
                                id="drivers-heading"
                                className="font-display font-bold text-lg"
                            >
                                What drives a forecast
                            </h2>
                        </div>
                        {info?.feature_importances ? (
                            <div className="space-y-3">
                                {Object.entries(info.feature_importances)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([k, v]) => (
                                        <div key={k}>
                                            <div className="flex justify-between text-xs mb-1 font-mono">
                                                <span className="text-[color:rgba(23,23,23,0.75)]">
                                                    {pretty(k)}
                                                </span>
                                                <span className="text-[#C9A05C]">
                                                    {(v * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{
                                                        width: `${v * 100}%`,
                                                    }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1 }}
                                                    className="h-full bg-gradient-to-r from-[#C9A05C] via-[#7A8C7A] to-[#B5634B]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-[color:rgba(23,23,23,0.4)] text-sm">
                                Loading…
                            </p>
                        )}
                    </div>

                    <div className="glass rounded-3xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={16} className="text-[#7A8C7A]" />
                            <h2 className="font-display font-bold text-lg">
                                Engine at a glance
                            </h2>
                        </div>
                        <ul className="space-y-3 text-sm">
                            <Conf k="Forecast range" v="0 – 10 (clamped)" />
                            <Conf k="Response time" v="< 1 second" />
                            <Conf
                                k="Films informing forecasts"
                                v={info?.dataset_size?.toLocaleString() ?? "—"}
                            />
                            <Conf
                                k="Unique directors"
                                v={info?.unique_directors?.toLocaleString() ?? "—"}
                            />
                            <Conf
                                k="Average industry rating"
                                v={info?.global_mean_rating ?? "—"}
                            />
                            <Conf k="Sentiment input" v="Free-text review (optional)" />
                            <Conf k="Forecast confidence" v="Ensemble agreement-based" />
                            <Conf k="Share link lifespan" v="30 days" />
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Metric({ label, value, accent, hint }) {
    return (
        <div className="glass rounded-2xl p-5 text-center">
            <div className="eyebrow">{label}</div>
            <div
                className="font-display font-black text-3xl mt-2"
                style={{ color: accent }}
            >
                {value}
            </div>
            {hint && (
                <p className="text-[10px] text-[color:rgba(23,23,23,0.4)] mt-2 leading-relaxed">
                    {hint}
                </p>
            )}
        </div>
    );
}

function Conf({ k, v }) {
    return (
        <li className="flex justify-between border-b border-black/5 pb-2 font-mono text-xs">
            <span className="text-[color:rgba(23,23,23,0.55)]">{k}</span>
            <span className="text-[color:rgba(23,23,23,0.95)]">{v}</span>
        </li>
    );
}

const DRIVER_LABELS = {
    Year: "Era of release",
    Votes: "Audience scale",
    Duration: "Runtime",
    Genre_mean_rating: "Genre momentum",
    Director_encoded: "Director pedigree",
    Actor1_encoded: "Lead-actor signal",
    Actor2_encoded: "Co-star A signal",
    Actor3_encoded: "Co-star B signal",
};

function pretty(k) {
    return DRIVER_LABELS[k] || k;
}
