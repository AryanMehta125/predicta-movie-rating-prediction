import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Film,
    User,
    Users,
    Tag,
    ThumbsUp,
    Sparkles,
    MessageSquare,
    ArrowRight,
    AlertCircle,
    Wand2,
} from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import RatingGauge from "../components/RatingGauge";
import InsightCard from "../components/InsightCard";
import SentimentMeter from "../components/SentimentMeter";
import Seo from "../components/Seo";
import { getSharedPrediction } from "../lib/api";

export default function SharedViewPage() {
    const { id } = useParams();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getSharedPrediction(id)
            .then(setDoc)
            .catch((err) =>
                setError(
                    err?.response?.status === 404
                        ? "This forecast no longer exists."
                        : err?.message || "Could not load forecast.",
                ),
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="pt-40 text-center font-mono text-ink/40">
                Fetching shared forecast…
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="pt-40 max-w-md mx-auto px-4 text-center">
                <div className="glass rounded-3xl p-8">
                    <AlertCircle className="mx-auto text-[#B5634B] mb-3" />
                    <h2 className="font-display font-bold text-2xl">Not found</h2>
                    <p className="text-ink/55 mt-2 text-sm">{error}</p>
                    <Link to="/predict" className="btn-primary mt-6 inline-flex">
                        Create your own forecast <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    const { input, result, review, final } = doc;
    const rating = final?.final_rating ?? result.predicted_rating;
    const isHigh = rating >= 8;

    return (
        <div className="page-enter relative pt-32 pb-20 min-h-screen">
            <Seo
                title={`${input.name || "Shared Forecast"} · Verdict`}
                path={`/share/${id}`}
                description={`A MovieAI forecast for ${input.name || "a film"}.`}
            />
            <HeroBackground />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-[10px] tracking-[0.3em] uppercase text-ink/40 font-mono text-center">
                    ⌬ Shared Forecast
                </p>
                <h1
                    className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter text-center"
                    data-testid="shared-title"
                >
                    {input.name || "Untitled movie"}{" "}
                    <span className="gradient-text">forecast</span>
                </h1>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    {/* Metadata */}
                    <div className="glass rounded-3xl p-6 space-y-3 order-2 lg:order-1">
                        <Row icon={Film} label="Year" value={input.year} color="#C9A05C" />
                        <Row
                            icon={Tag}
                            label="Genre"
                            value={input.genre}
                            color="#7A8C7A"
                        />
                        <Row
                            icon={User}
                            label="Director"
                            value={input.director}
                            color="#B5634B"
                        />
                        <Row
                            icon={Users}
                            label="Cast"
                            value={`${input.actor1}, ${input.actor2}, ${input.actor3}`}
                            color="#B9C8C5"
                        />
                        <Row
                            icon={ThumbsUp}
                            label="Votes"
                            value={Number(input.votes).toLocaleString()}
                            color="#C9A05C"
                        />
                        <Row
                            icon={Sparkles}
                            label="ML rating"
                            value={`${result.predicted_rating} / 10`}
                            color="#C9A05C"
                        />
                    </div>

                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 18 }}
                        className="flex flex-col items-center order-1 lg:order-2"
                    >
                        <div
                            className={`relative ${isHigh ? "pulse-halo rounded-full" : ""}`}
                        >
                            <RatingGauge
                                value={rating}
                                size={280}
                                label={final ? "Final Rating" : "Predicted Rating"}
                            />
                        </div>
                        {final && (
                            <div className="mt-3 font-mono text-xs text-ink/45">
                                adjustment{" "}
                                <span
                                    className={
                                        final.adjustment >= 0
                                            ? "text-emerald-300"
                                            : "text-rose-300"
                                    }
                                >
                                    {final.adjustment >= 0 ? "+" : ""}
                                    {final.adjustment}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    <div className="space-y-3 order-3">
                        <InsightCard
                            title="Director impact"
                            score={result.impacts.director}
                            description="Δ vs. global average"
                            accent="#7A8C7A"
                            icon={User}
                        />
                        <InsightCard
                            title="Cast impact"
                            score={result.impacts.cast}
                            description="Combined star power"
                            accent="#B5634B"
                            icon={Users}
                        />
                        <InsightCard
                            title="Genre synergy"
                            score={result.impacts.genre}
                            description="Genre historical lift"
                            accent="#C9A05C"
                            icon={Tag}
                        />
                    </div>
                </div>

                {final?.sentiment && review && (
                    <div className="mt-10 glass rounded-3xl p-7">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare size={16} className="text-[#B5634B]" />
                            <h3 className="font-display font-bold text-lg">
                                Audience Review
                            </h3>
                        </div>
                        <blockquote className="text-ink/75 italic leading-relaxed">
                            “{review}”
                        </blockquote>
                        <div className="mt-6">
                            <SentimentMeter
                                polarity={final.sentiment.polarity}
                                label={final.sentiment.label}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-10 text-center">
                    <Link to="/predict" className="btn-primary" data-testid="shared-cta">
                        <Wand2 size={14} /> Forecast your own movie
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Row({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-ink/55 text-xs uppercase tracking-[0.18em]">
                <Icon size={12} style={{ color }} /> {label}
            </div>
            <div className="text-sm font-medium text-right truncate max-w-[60%]">
                {value || "—"}
            </div>
        </div>
    );
}
