import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import HeroBackground from "../components/HeroBackground";
import SentimentMeter from "../components/SentimentMeter";
import Seo from "../components/Seo";
import { analyzeSentiment } from "../lib/api";

const SAMPLES = [
    "Absolutely loved this movie! The cinematography, score, and acting were nothing short of brilliant.",
    "It was alright. Some scenes were good but the pacing dragged in the middle.",
    "A total disaster. Boring, predictable, and a complete waste of time and money.",
];

export default function SentimentPage() {
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const analyze = async () => {
        if (!review.trim()) {
            setError("Please write a review first.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await analyzeSentiment(review);
            setResult(res);
            sessionStorage.setItem(
                "movieai_sentiment",
                JSON.stringify({ review, result: res }),
            );
        } catch (err) {
            setError(err?.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }
    };

    const colorFor = (label) =>
        label === "Positive" ? "#B9C8C5" : label === "Negative" ? "#B5634B" : "#7A8C7A";

    return (
        <div className="page-enter relative pt-32 pb-2 md:pb-20 min-h-auto md:min-h-screen">
            <Seo
                title="Audience Sentiment"
                path="/sentiment"
                description="Turn a movie review into an audience-sentiment signal that adjusts the rating forecast in real time."
            />
            <HeroBackground />
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="text-center max-w-3xl mx-auto mb-10">
                    <p className="eyebrow">⌬ Sentiment Intelligence</p>
                    <h1 className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter">
                        How does the <span className="gradient-text">audience</span> feel?
                    </h1>
                    <p className="text-[color:rgba(23,23,23,0.6)] mt-3">
                        Paste a review. Our sentiment layer extracts the emotional pulse
                        and fuses it into the forecast.
                    </p>
                </header>

                <div className="glass-strong rounded-3xl p-6 md:p-8" data-testid="sentiment-card">
                    <label className="label flex items-center gap-2">
                        <MessageSquare size={12} className="text-[#C9A05C]" /> Your
                        Review
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={6}
                        placeholder="Type or paste a movie review here…"
                        className="field resize-none text-base"
                        data-testid="sentiment-textarea"
                    />

                    <div className="flex flex-wrap gap-2 mt-3">
                        {SAMPLES.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setReview(s)}
                                className="text-xs px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-ink/60"
                                data-testid={`sentiment-sample-${i}`}
                            >
                                Sample {i + 1}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div
                            className="mt-4 px-4 py-3 rounded-xl text-sm bg-rose-500/10 border border-rose-500/30 text-rose-200"
                            data-testid="sentiment-error"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        onClick={analyze}
                        disabled={loading}
                        className="btn-primary w-full justify-center mt-6"
                        data-testid="sentiment-submit"
                    >
                        <Sparkles size={16} />
                        {loading ? "Analyzing…" : "Analyze Sentiment"}
                    </button>
                </div>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8"
                    >
                        <div className="md:col-span-2 glass rounded-3xl p-6">
                            <h3 className="font-display font-bold text-xl mb-5">
                                Sentiment Meter
                            </h3>
                            <SentimentMeter
                                polarity={result.polarity}
                                label={result.label}
                            />
                            <div className="grid grid-cols-3 gap-3 mt-7">
                                <Stat
                                    label="Polarity"
                                    value={result.polarity.toFixed(3)}
                                    color="#C9A05C"
                                />
                                <Stat
                                    label="Subjectivity"
                                    value={result.subjectivity.toFixed(3)}
                                    color="#7A8C7A"
                                />
                                <Stat
                                    label="Confidence"
                                    value={`${result.confidence}%`}
                                    color="#B5634B"
                                />
                            </div>
                        </div>

                        <div
                            className="glass rounded-3xl p-6 flex flex-col"
                            data-testid="sentiment-interpretation"
                        >
                            <h3 className="font-display font-bold text-lg">
                                AI Interpretation
                            </h3>
                            <div
                                className="mt-4 text-5xl font-display font-black"
                                style={{ color: colorFor(result.label) }}
                            >
                                {result.label}
                            </div>
                            <p className="text-sm text-ink/55 mt-4 leading-relaxed">
                                {result.label === "Positive" &&
                                    "Audience expressed strong enthusiasm. The model will lift the base rating accordingly."}
                                {result.label === "Negative" &&
                                    "Audience showed dissatisfaction. The base rating will be dampened."}
                                {result.label === "Neutral" &&
                                    "Audience response is mixed. Minimal adjustment to the predicted rating."}
                            </p>
                            <p className="text-xs text-[color:rgba(23,23,23,0.4)] font-mono mt-4">
                                Forecast adjustment:{" "}
                                <span className="text-[color:rgba(23,23,23,0.95)]">
                                    {result.adjustment > 0 ? "+" : ""}
                                    {result.adjustment.toFixed(3)}
                                </span>
                            </p>

                            <Link
                                to="/final-rating"
                                className="btn-primary mt-auto justify-center text-sm"
                                data-testid="sentiment-go-final"
                            >
                                Combine with prediction <ArrowRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value, color }) {
    return (
        <div className="glass rounded-2xl p-4 text-center">
            <div className="text-[10px] tracking-[0.2em] uppercase text-ink/40 font-mono">
                {label}
            </div>
            <div
                className="font-display font-bold text-2xl mt-2"
                style={{ color }}
            >
                {value}
            </div>
        </div>
    );
}
