import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, Trophy, RefreshCcw, Wand2, Crown } from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import RatingGauge from "../components/RatingGauge";
import Seo from "../components/Seo";
import { compareMovies, fetchSuggestions } from "../lib/api";

const blank = {
    name: "",
    year: 2024,
    duration: 120,
    votes: 5000,
    genre: "",
    director: "",
    actor1: "",
    actor2: "",
    actor3: "",
};

export default function ComparePage() {
    const [a, setA] = useState({ ...blank, name: "Project A" });
    const [b, setB] = useState({ ...blank, name: "Project B" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const FIELD_LABELS = {
        name: "Project Name",
        genre: "Genre",
        director: "Director",
        actor1: "Lead Actor",
        actor2: "Co-star A",
        actor3: "Co-star B",
    };

    const onCompare = async () => {
        const required = ["name", "genre", "director", "actor1", "actor2", "actor3"];
        for (const [idx, m] of [a, b].entries()) {
            for (const k of required) {
                if (!String(m[k] || "").trim()) {
                    setError(
                        `Movie ${idx === 0 ? "A" : "B"} is missing ${FIELD_LABELS[k]}.`,
                    );
                    return;
                }
            }
        }
        setError(null);
        setLoading(true);
        setResult(null);
        try {
            const payloadA = { ...a, year: +a.year, votes: +a.votes, duration: +a.duration };
            const payloadB = { ...b, year: +b.year, votes: +b.votes, duration: +b.duration };
            const [res] = await Promise.all([
                compareMovies(payloadA, payloadB),
                new Promise((r) => setTimeout(r, 2500)),
            ]);
            setResult(res);
        } catch (e) {
            setError(e?.response?.data?.detail || e.message || "Comparison failed");
        } finally {
            setLoading(false);
        }
    };

    const onReset = () => {
        setA({ ...blank, name: "Project A" });
        setB({ ...blank, name: "Project B" });
        setResult(null);
        setError(null);
    };

    return (
        <div className="page-enter relative pt-32 pb-20 min-h-screen">
            <Seo
                title="Head-to-Head Forecast"
                path="/compare"
                description="Pit two films against each other and let MovieAI crown a winner — perfect for slate planning and green-light meetings."
            />
            <HeroBackground />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="text-center max-w-3xl mx-auto mb-10">
                    <p className="eyebrow">⌬ Head-to-Head</p>
                    <h1 className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter">
                        Two projects, <span className="gradient-text">one winner</span>.
                    </h1>
                    <p className="text-[color:rgba(23,23,23,0.6)] mt-3">
                        Fill in two films, run the face-off, and watch the gauges race.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MovieForm
                        title="Movie A"
                        accent="#C9A05C"
                        value={a}
                        onChange={setA}
                        side="a"
                    />
                    <MovieForm
                        title="Movie B"
                        accent="#B5634B"
                        value={b}
                        onChange={setB}
                        side="b"
                    />
                </div>

                {error && (
                    <div
                        className="mt-6 px-4 py-3 rounded-xl text-sm bg-rose-500/10 border border-rose-500/30 text-rose-200 max-w-2xl mx-auto"
                        data-testid="compare-error"
                    >
                        {error}
                    </div>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        onClick={onCompare}
                        disabled={loading}
                        className="btn-primary"
                        data-testid="compare-run-button"
                    >
                        <GitCompare size={16} />
                        {loading ? "Running face-off…" : "Run Face-Off"}
                    </button>
                    <button
                        onClick={onReset}
                        className="btn-ghost"
                        data-testid="compare-reset-button"
                    >
                        <RefreshCcw size={14} /> Reset
                    </button>
                </div>

                <AnimatePresence>
                    {result && <ResultPanel result={result} a={a} b={b} />}
                </AnimatePresence>
            </div>
        </div>
    );
}

function MovieForm({ title, accent, value, onChange, side }) {
    const set = (k) => (e) =>
    onChange({ ...value, [k]: e.target.value });
    const setAuto = (k, v) => onChange({ ...value, [k]: v });

    return (
        <section
            aria-labelledby={`form-${side}`}
            className="glass-strong rounded-3xl p-6 md:p-7"
            style={{ borderColor: `${accent}40` }}
            data-testid={`compare-form-${side}`}
        >
            <h2
                id={`form-${side}`}
                className="font-display font-bold text-xl mb-5"
                style={{ color: accent }}
            >
                {title}
            </h2>

            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Project Name"
                    value={value.name}
                    onChange={set("name")}
                    testId={`compare-${side}-name`}
                    full
                />
                <Field
                    label="Year"
                    type="number"
                    value={value.year}
                    onChange={set("year")}
                    testId={`compare-${side}-year`}
                />
                <Field
                    label="Runtime (min)"
                    type="number"
                    value={value.duration}
                    onChange={set("duration")}
                    testId={`compare-${side}-duration`}
                />
                <Field
                    label="Audience Size"
                    type="number"
                    value={value.votes}
                    onChange={set("votes")}
                    testId={`compare-${side}-votes`}
                />
                <Auto
                    label="Genre"
                    field="genre"
                    value={value.genre}
                    onChange={(v) => setAuto("genre", v)}
                    testId={`compare-${side}-genre`}
                />
                <Auto
                    label="Director"
                    field="director"
                    value={value.director}
                    onChange={(v) => setAuto("director", v)}
                    testId={`compare-${side}-director`}
                    full
                />
                <Auto
                    label="Lead Actor"
                    field="actor1"
                    value={value.actor1}
                    onChange={(v) => setAuto("actor1", v)}
                    testId={`compare-${side}-actor1`}
                />
                <Auto
                    label="Co-star"
                    field="actor2"
                    value={value.actor2}
                    onChange={(v) => setAuto("actor2", v)}
                    testId={`compare-${side}-actor2`}
                />
                <Auto
                    label="Co-star"
                    field="actor3"
                    value={value.actor3}
                    onChange={(v) => setAuto("actor3", v)}
                    testId={`compare-${side}-actor3`}
                    full
                />
            </div>
        </section>
    );
}

function Field({ label, full, testId, ...rest }) {
    return (
        <div className={full ? "col-span-2" : ""}>
            <label className="label">{label}</label>
            <input className="field" data-testid={testId} {...rest} />
        </div>
    );
}

function Auto({ label, field, value, onChange, testId, full }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const debRef = useRef();

    useEffect(() => {
        if (!open) return;
        clearTimeout(debRef.current);
        debRef.current = setTimeout(async () => {
            try {
                setItems((await fetchSuggestions(field, value)) || []);
            } catch {
                setItems([]);
            }
        }, 180);
        return () => clearTimeout(debRef.current);
    }, [value, open, field]);

    return (
        <div className={`relative ${full ? "col-span-2" : ""}`}>
            <label className="label">{label}</label>
            <input
                className="field"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 160)}
                data-testid={testId}
                autoComplete="off"
            />
            {open && items.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 glass-strong rounded-xl py-1 max-h-56 overflow-auto">
                    {items.map((it) => (
                        <button
                            type="button"
                            key={it}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(it);
                                setOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-black/5"
                        >
                            {it}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ResultPanel({ result, a, b }) {
    const winnerSide =
        result.winner === "a" ? "A" : result.winner === "b" ? "B" : "Tie";
    const winnerColor =
        result.winner === "a"
            ? "#C9A05C"
            : result.winner === "b"
              ? "#B5634B"
              : "#C9A05C";
    const movieA = result.movie_a;
    const movieB = result.movie_b;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
            aria-labelledby="compare-result-heading"
            data-testid="compare-result"
        >
            <header className="text-center mb-10">
                <p className="eyebrow">⌬ Verdict</p>
                <h2
                    id="compare-result-heading"
                    className="font-display font-black text-3xl md:text-5xl mt-3"
                >
                    {result.winner === "tie" ? (
                        <>
                            It&apos;s a <span className="gradient-text">tie</span>.
                        </>
                    ) : (
                        <>
                            <span style={{ color: winnerColor }}>{winnerSide}</span>{" "}
                            wins by{" "}
                            <span className="gradient-text">
                                {Math.abs(result.diff).toFixed(2)} pts
                            </span>
                        </>
                    )}
                </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Side
                    title={a.name || "Movie A"}
                    rating={movieA.predicted_rating}
                    confidence={movieA.confidence}
                    accent="#C9A05C"
                    isWinner={result.winner === "a"}
                    testId="compare-side-a"
                />
                <Side
                    title={b.name || "Movie B"}
                    rating={movieB.predicted_rating}
                    confidence={movieB.confidence}
                    accent="#B5634B"
                    isWinner={result.winner === "b"}
                    testId="compare-side-b"
                />
            </div>

            <div className="mt-8 glass-strong rounded-3xl p-6 md:p-7">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={16} className="text-[#C9A05C]" />
                    <h3 className="font-display font-bold text-lg">
                        Why this verdict
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <CompareRow
                        label="Director Pedigree"
                        a={movieA.impacts.director}
                        b={movieB.impacts.director}
                        accent="#7A8C7A"
                    />
                    <CompareRow
                        label="Cast Chemistry"
                        a={movieA.impacts.cast}
                        b={movieB.impacts.cast}
                        accent="#B5634B"
                    />
                    <CompareRow
                        label="Genre Momentum"
                        a={movieA.impacts.genre}
                        b={movieB.impacts.genre}
                        accent="#C9A05C"
                    />
                    <CompareRow
                        label="Audience Scale"
                        a={movieA.impacts.votes}
                        b={movieB.impacts.votes}
                        accent="#C9A05C"
                    />
                </div>
            </div>
        </motion.section>
    );
}

function Side({ title, rating, confidence, accent, isWinner, testId }) {
    return (
        <div
            className={`glass-strong rounded-3xl p-7 text-center ${
                isWinner ? "pulse-halo" : ""
            }`}
            style={{ borderColor: isWinner ? accent : "transparent" }}
            data-testid={testId}
        >
            {isWinner && (
                <div
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{
                        background: `${accent}22`,
                        color: accent,
                        border: `1px solid ${accent}55`,
                    }}
                >
                    <Crown size={12} /> Winner
                </div>
            )}
            <h3 className="font-display font-bold text-xl mb-4 truncate">{title}</h3>
            <div className="flex justify-center">
                <RatingGauge value={rating} size={220} accent={accent} />
            </div>
            <p className="text-xs font-mono text-[color:rgba(23,23,23,0.5)] mt-3">
                confidence {confidence}%
            </p>
        </div>
    );
}

function CompareRow({ label, a, b, accent }) {
    const diff = a - b;
    return (
        <div className="glass rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="eyebrow" style={{ color: accent }}>
                    {label}
                </span>
                <span className="text-xs font-mono">
                    Δ {diff >= 0 ? "+" : ""}
                    {diff.toFixed(2)}
                </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className="text-[#C9A05C] font-mono w-12">
                    {a >= 0 ? "+" : ""}
                    {a.toFixed(2)}
                </span>
                <div className="flex-1 h-1.5 bg-black/5 rounded-full relative">
                    <div
                        className="absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-full bg-black/10"
                        style={{ left: "50%" }}
                    />
                    <div
                        className="absolute h-full rounded-full"
                        style={{
                            left: diff >= 0 ? "50%" : `${50 + diff * 20}%`,
                            width: `${Math.min(50, Math.abs(diff) * 20)}%`,
                            background: diff >= 0 ? "#C9A05C" : "#B5634B",
                        }}
                    />
                </div>
                <span className="text-[#B5634B] font-mono w-12 text-right">
                    {b >= 0 ? "+" : ""}
                    {b.toFixed(2)}
                </span>
            </div>
        </div>
    );
}
