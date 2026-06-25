import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Wand2,
    MessageSquare,
    RefreshCcw,
    Share2,
    Download,
} from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import RatingGauge from "../components/RatingGauge";
import ShareModal from "../components/ShareModal";
import Seo from "../components/Seo";
import { computeFinalRating, sharePrediction } from "../lib/api";
import { exportElementAsPdf } from "../lib/pdf";

export default function FinalRatingPage() {
    const navigate = useNavigate();
    const [pred, setPred] = useState(null);
    const [sent, setSent] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareId, setShareId] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef(null);

    useEffect(() => {
        const rawPred = sessionStorage.getItem("movieai_prediction");
        const rawSent = sessionStorage.getItem("movieai_sentiment");
        if (!rawPred) {
            navigate("/predict");
            return;
        }
        const p = JSON.parse(rawPred);
        const s = rawSent ? JSON.parse(rawSent) : null;
        setPred(p);
        setSent(s);

        computeFinalRating(p.result.predicted_rating, s?.review || "")
            .then((r) => setResult(r))
            .finally(() => setLoading(false));
    }, [navigate]);

    const onShare = async () => {
        if (!pred || !result) return;
        setSharing(true);
        try {
            let id = shareId;
            if (!id) {
                const res = await sharePrediction({
                    input: pred.input,
                    result: pred.result,
                    review: sent?.review || null,
                    final: result,
                });
                id = res.id;
                setShareId(id);
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
                `MovieAI-Final-${(pred?.input?.name || "rating").replace(/\s+/g, "-")}.pdf`,
            );
        } finally {
            setExporting(false);
        }
    };

    if (loading || !pred || !result) {
        return (
            <div className="pt-40 text-center text-ink/40 font-mono">
                Combining signals…
            </div>
        );
    }

    const isHigh = result.final_rating >= 8.0;
    const diff = (result.final_rating - result.predicted_rating).toFixed(2);
    const sentColor =
        result.sentiment.label === "Positive"
            ? "#B9C8C5"
            : result.sentiment.label === "Negative"
              ? "#B5634B"
              : "#7A8C7A";

    return (
        <div className="page-enter relative pt-32 pb-20 min-h-screen">
            <Seo
                title="Final Rating"
                path="/final-rating"
                description="The combined cinema-AI verdict — pre-release forecast adjusted by real audience sentiment."
            />
            <HeroBackground />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="eyebrow text-center">⌬ Final Verdict</p>
                <h1 className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter text-center">
                    The <span className="gradient-text">combined verdict</span>
                </h1>
                <p className="text-[color:rgba(23,23,23,0.6)] text-center mt-3">
                    {pred.input.name || "Your movie"} — pre-release forecast blended
                    with audience sentiment.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        onClick={onShare}
                        disabled={sharing}
                        className="btn-ghost text-sm"
                        data-testid="final-share-button"
                    >
                        <Share2 size={14} />
                        {sharing ? "Generating link…" : "Share forecast"}
                    </button>
                    <button
                        onClick={onExport}
                        disabled={exporting}
                        className="btn-ghost text-sm"
                        data-testid="final-export-button"
                    >
                        <Download size={14} />
                        {exporting ? "Building PDF…" : "Export as PDF"}
                    </button>
                </div>

                <div ref={reportRef}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 items-center">
                    {/* ML side */}
                    <Card
                        title="Forecast"
                        accent="#C9A05C"
                        icon={<Wand2 size={16} />}
                        value={result.predicted_rating}
                        sub="Pre-release verdict"
                        testId="final-card-prediction"
                    />

                    {/* Centre */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div
                            className={`relative ${isHigh ? "pulse-halo rounded-full" : ""}`}
                        >
                            <RatingGauge
                                value={result.final_rating}
                                size={300}
                                label="Final Rating"
                            />
                        </div>
                        <div
                            className="mt-4 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                                background: `${sentColor}22`,
                                color: sentColor,
                                border: `1px solid ${sentColor}55`,
                            }}
                            data-testid="final-sentiment-tag"
                        >
                            {result.sentiment.label} sentiment ·{" "}
                            {result.sentiment.confidence}% conf
                        </div>
                        <div className="mt-3 text-sm text-ink/50 font-mono">
                            adjustment{" "}
                            <span
                                className={
                                    result.adjustment >= 0
                                        ? "text-emerald-300"
                                        : "text-rose-300"
                                }
                            >
                                {result.adjustment >= 0 ? "+" : ""}
                                {result.adjustment}
                            </span>
                        </div>
                        {isHigh && <Celebration />}
                    </motion.div>

                    {/* Sentiment side */}
                    <Card
                        title="Sentiment Δ"
                        accent="#B5634B"
                        icon={<MessageSquare size={16} />}
                        value={
                            result.adjustment > 0
                                ? `+${result.adjustment.toFixed(2)}`
                                : result.adjustment.toFixed(2)
                        }
                        sub={`Polarity ${result.sentiment.polarity}`}
                        testId="final-card-sentiment"
                    />
                </div>

                {/* AI summary */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 gradient-border rounded-3xl"
                >
                    <div
                        className="glass-strong rounded-3xl p-7"
                        data-testid="final-summary"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C9A05C]/30 to-[#B5634B]/30 border border-black/10 flex items-center justify-center">
                                <Sparkles size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-display font-bold text-lg">
                                    AI Summary
                                </h3>
                                <p className="text-[color:rgba(23,23,23,0.7)] mt-2 leading-relaxed">
                                    Our cinema intelligence forecast{" "}
                                    <span className="text-[color:rgba(23,23,23,0.95)] font-semibold">
                                        {result.predicted_rating}/10
                                    </span>{" "}
                                    based on your project metadata. After fusing
                                    the{" "}
                                    <span
                                        style={{ color: sentColor }}
                                        className="font-semibold"
                                    >
                                        {result.sentiment.label.toLowerCase()}
                                    </span>{" "}
                                    audience sentiment, the final rating settles at{" "}
                                    <span className="text-[color:rgba(23,23,23,0.95)] font-semibold">
                                        {result.final_rating}/10
                                    </span>{" "}
                                    ({diff > 0 ? "+" : ""}
                                    {diff} from the base score).
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                </div>
                {/* /report */}

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/predict"
                        className="btn-ghost"
                        data-testid="final-try-again"
                    >
                        <RefreshCcw size={14} /> Try another movie
                    </Link>
                    <Link
                        to="/sentiment"
                        className="btn-primary"
                        data-testid="final-tweak-review"
                    >
                        <MessageSquare size={14} /> Tweak your review
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

function Card({ title, accent, icon, value, sub, testId }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-7"
            data-testid={testId}
        >
            <div className="flex items-center gap-2 mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{
                        background: `${accent}22`,
                        borderColor: `${accent}55`,
                    }}
                >
                    <span style={{ color: accent }}>{icon}</span>
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-ink/45 font-semibold">
                    {title}
                </span>
            </div>
            <div
                className="font-display font-black text-5xl"
                style={{ color: accent }}
            >
                {value}
            </div>
            <p className="text-xs text-ink/45 font-mono mt-2">{sub}</p>
        </motion.div>
    );
}

function Celebration() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 14 }).map((_, i) => (
                <motion.span
                    key={i}
                    initial={{ y: 0, x: 0, opacity: 1 }}
                    animate={{
                        y: -160 - Math.random() * 80,
                        x: (Math.random() - 0.5) * 200,
                        opacity: 0,
                        rotate: 360,
                    }}
                    transition={{ duration: 1.6, delay: i * 0.06 }}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm"
                    style={{
                        background: ["#C9A05C", "#7A8C7A", "#B5634B"][i % 3],
                    }}
                />
            ))}
        </div>
    );
}
