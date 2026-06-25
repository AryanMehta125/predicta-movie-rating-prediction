import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Tag,
    Users,
    ThumbsUp,
    Sparkles,
    ArrowRight,
    Wand2,
    RefreshCcw,
    Share2,
    Download,
} from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import RatingGauge from "../components/RatingGauge";
import InsightCard from "../components/InsightCard";
import ShareModal from "../components/ShareModal";
import Seo from "../components/Seo";
import { sharePrediction } from "../lib/api";
import { exportElementAsPdf } from "../lib/pdf";

export default function ResultsPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareId, setShareId] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [sharing, setSharing] = useState(false);
    const reportRef = useRef(null);

    useEffect(() => {
        const raw = sessionStorage.getItem("movieai_prediction");
        if (!raw) {
            navigate("/predict");
            return;
        }
        setData(JSON.parse(raw));
    }, [navigate]);

    const onShare = async () => {
        if (!data) return;
        setSharing(true);
        try {
            let id = shareId;
            if (!id) {
                const res = await sharePrediction({
                    input: data.input,
                    result: data.result,
                });
                id = res.id;
                setShareId(id);
                sessionStorage.setItem(
                    "movieai_prediction",
                    JSON.stringify({ ...data, share_id: id }),
                );
            }
            setShareOpen(true);
        } finally {
            setSharing(false);
        }
    };

    const onExport = async () => {
        if (!reportRef.current) return;
        setExporting(true);
        try {
            await exportElementAsPdf(
                reportRef.current,
                `MovieAI-${(data?.input?.name || "prediction").replace(/\s+/g, "-")}.pdf`,
            );
        } finally {
            setExporting(false);
        }
    };

    const { result, input } = data || { result: null, input: null };

    const verdict = useMemo(() => {
        const r = result?.predicted_rating ?? 0;
        if (r >= 8) return { tag: "Blockbuster", color: "#B9C8C5" };
        if (r >= 6.5) return { tag: "Solid hit potential", color: "#7A8C7A" };
        if (r >= 5) return { tag: "Mixed reception", color: "#C9A05C" };
        return { tag: "High-risk", color: "#B5634B" };
    }, [result]);

    if (!data) return null;

    return (
        <div className="page-enter relative pt-32 pb-20 min-h-screen">
            <Seo
                title={`${input.name || "Forecast"} · Verdict`}
                path="/predict/results"
                description={`MovieAI forecasts ${result.predicted_rating}/10 for ${input.name || "this project"}.`}
            />
            <HeroBackground />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="eyebrow text-center">⌬ Forecast Verdict</p>
                <h1
                    className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter text-center"
                    data-testid="results-title"
                >
                    {input.name || "Your movie"}{" "}
                    <span className="gradient-text">— scored</span>
                </h1>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        onClick={onShare}
                        disabled={sharing}
                        className="btn-ghost text-sm"
                        data-testid="results-share-button"
                    >
                        <Share2 size={14} />
                        {sharing ? "Generating link…" : "Share forecast"}
                    </button>
                    <button
                        onClick={onExport}
                        disabled={exporting}
                        className="btn-ghost text-sm"
                        data-testid="results-export-button"
                    >
                        <Download size={14} />
                        {exporting ? "Building PDF…" : "Export as PDF"}
                    </button>
                </div>

                <div ref={reportRef} className="pt-4">
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    {/* Left summary */}
                    <div className="glass rounded-3xl p-6 space-y-4 order-2 lg:order-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] tracking-[0.2em] uppercase text-ink/40 font-mono">
                                Verdict
                            </span>
                            <span
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    background: `${verdict.color}22`,
                                    color: verdict.color,
                                    border: `1px solid ${verdict.color}55`,
                                }}
                                data-testid="results-verdict"
                            >
                                {verdict.tag}
                            </span>
                        </div>
                        <Row
                            icon={Tag}
                            label="Genre"
                            value={input.genre}
                            color="#C9A05C"
                        />
                        <Row
                            icon={User}
                            label="Director"
                            value={input.director}
                            color="#7A8C7A"
                        />
                        <Row
                            icon={Users}
                            label="Lead Cast"
                            value={`${input.actor1}, ${input.actor2}, ${input.actor3}`}
                            color="#B5634B"
                        />
                        <Row
                            icon={ThumbsUp}
                            label="Votes"
                            value={Number(input.votes).toLocaleString()}
                            color="#B9C8C5"
                        />
                        <div className="pt-3 border-t border-black/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-[color:rgba(23,23,23,0.45)] font-mono text-xs">
                                    confidence
                                </span>
                                <span className="font-mono font-semibold text-[#C9A05C]">
                                    {result.confidence}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.confidence}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#C9A05C] to-[#7A8C7A]"
                                />
                            </div>
                            <p className="text-xs text-[color:rgba(23,23,23,0.45)] mt-2">
                                How tightly our intelligence layer agrees on the verdict.
                            </p>
                        </div>
                    </div>

                    {/* Gauge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 18, stiffness: 200 }}
                        className="flex flex-col items-center order-1 lg:order-2"
                    >
                        <div
                            className={`relative ${result.predicted_rating >= 8 ? "pulse-halo rounded-full" : ""}`}
                        >
                            <RatingGauge
                                value={result.predicted_rating}
                                size={280}
                                accent="#C9A05C"
                            />
                        </div>
                        <p
                            className="mt-4 text-ink/55 text-sm text-center max-w-xs"
                            data-testid="results-summary"
                        >
                            The ensemble forecasts a rating of{" "}
                            <span className="text-ink font-semibold">
                                {result.predicted_rating}
                            </span>{" "}
                            for this configuration.
                        </p>
                    </motion.div>

                    {/* Right insights */}
                    <div className="space-y-3 order-3">
                        <InsightCard
                            title="Director impact"
                            score={result.impacts.director}
                            description="Δ vs. global mean rating, based on past director output."
                            accent="#7A8C7A"
                            icon={User}
                            testId="impact-director"
                            delay={0.05}
                        />
                        <InsightCard
                            title="Cast impact"
                            score={result.impacts.cast}
                            description="Average lift from your three leads versus the average."
                            accent="#B5634B"
                            icon={Users}
                            testId="impact-cast"
                            delay={0.15}
                        />
                        <InsightCard
                            title="Genre synergy"
                            score={result.impacts.genre}
                            description="How well your genre historically performs."
                            accent="#C9A05C"
                            icon={Tag}
                            testId="impact-genre"
                            delay={0.25}
                        />
                        <InsightCard
                            title="Voting momentum"
                            score={result.impacts.votes}
                            description="Logarithmic weight from your declared vote volume."
                            accent="#B9C8C5"
                            icon={ThumbsUp}
                            testId="impact-votes"
                            delay={0.35}
                        />
                    </div>
                </div>

                {/* Feature breakdown */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass rounded-3xl p-6">
                        <h2 className="font-display font-bold text-lg mb-4">
                            What we measured
                        </h2>
                        <div className="space-y-2 text-sm font-mono">
                            {Object.entries(result.features_used).map(([k, v]) => (
                                <div
                                    key={k}
                                    className="flex justify-between py-1 border-b border-black/5"
                                >
                                    <span className="text-[color:rgba(23,23,23,0.55)]">
                                        {prettyKey(k)}
                                    </span>
                                    <span className="text-[color:rgba(23,23,23,0.95)]">
                                        {v}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-6">
                        <h2 className="font-display font-bold text-lg mb-4">
                            What moved the needle
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(result.feature_importances)
                                .sort(([, a], [, b]) => b - a)
                                .map(([k, v]) => (
                                    <div key={k}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-mono text-[color:rgba(23,23,23,0.7)]">
                                                {prettyKey(k)}
                                            </span>
                                            <span className="font-mono text-[#C9A05C]">
                                                {(v * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${v * 100}%` }}
                                                transition={{
                                                    duration: 1,
                                                    ease: "easeOut",
                                                }}
                                                className="h-full bg-gradient-to-r from-[#C9A05C] via-[#7A8C7A] to-[#B5634B]"
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                </div>
                {/* /report */}

                {/* Next step */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/sentiment"
                        className="btn-primary"
                        data-testid="results-next-sentiment"
                    >
                        <Sparkles size={16} /> Refine with a review
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/predict"
                        className="btn-ghost"
                        data-testid="results-try-again"
                    >
                        <RefreshCcw size={14} /> Try another movie
                    </Link>
                </div>
            </div>
            <ShareModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                shareId={shareId}
            />
        </div>
    );
}

function Row({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[color:rgba(23,23,23,0.55)] text-xs uppercase tracking-[0.18em]">
                <Icon size={12} style={{ color }} /> {label}
            </div>
            <div className="text-sm font-medium text-right truncate max-w-[60%]">
                {value || "—"}
            </div>
        </div>
    );
}

const KEY_LABELS = {
    year: "Year",
    votes: "Audience scale",
    duration: "Runtime (min)",
    genre_mean_rating: "Genre baseline",
    director_encoded: "Director pedigree",
    actor1_encoded: "Lead actor pedigree",
    actor2_encoded: "Co-star A pedigree",
    actor3_encoded: "Co-star B pedigree",
    Year: "Year",
    Votes: "Audience scale",
    Duration: "Runtime",
    Genre_mean_rating: "Genre signal",
    Director_encoded: "Director signal",
    Actor1_encoded: "Lead-actor signal",
    Actor2_encoded: "Co-star A signal",
    Actor3_encoded: "Co-star B signal",
};

function prettyKey(k) {
    return KEY_LABELS[k] || k;
}
