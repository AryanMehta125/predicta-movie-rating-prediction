import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wand2, Film, Clock, ThumbsUp, User, Users, Tag } from "lucide-react";
import HeroBackground from "../components/HeroBackground";
import LoadingSequence from "../components/LoadingSequence";
import Seo from "../components/Seo";
import { predictMovie, fetchSuggestions } from "../lib/api";

const DEFAULTS = {
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

export default function PredictPage() {
    const [form, setForm] = useState(DEFAULTS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const onChange = (k) => (e) =>
        setForm((f) => ({
            ...f,
            [k]: e.target.value,
        }));

    const validate = () => {
        if (!form.name?.trim()) return "Movie name is required";
        if (!form.genre?.trim()) return "Genre is required";
        if (!form.director?.trim()) return "Director is required";
        if (!form.actor1?.trim()) return "Lead actor is required";
        if (!form.actor2?.trim()) return "Actor 2 is required";
        if (!form.actor3?.trim()) return "Actor 3 is required";
        if (Number(form.year) < 1900 || Number(form.year) > 2100)
            return "Year out of range";
        if (Number(form.duration) <= 0) return "Duration must be positive";
        if (Number(form.votes) < 0) return "Votes must be ≥ 0";
        return null;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setError(null);
        setLoading(true);

        const payload = {
            name: form.name,
            year: Number(form.year),
            duration: Number(form.duration),
            votes: Number(form.votes),
            genre: form.genre,
            director: form.director,
            actor1: form.actor1,
            actor2: form.actor2,
            actor3: form.actor3,
        };

        try {
            // run prediction in parallel with the loading animation
            const [result] = await Promise.all([
                predictMovie(payload),
                new Promise((res) => setTimeout(res, 4000)),
            ]);
            sessionStorage.setItem(
                "movieai_prediction",
                JSON.stringify({ result, input: payload }),
            );
            navigate("/predict/results");
        } catch (err) {
            setLoading(false);
            setError(err?.response?.data?.detail || err.message || "Prediction failed");
        }
    };

    return (
        <div className="page-enter relative pt-32 pb-8 md:pb-20 min-h-screen">
            <Seo
                title="Predict a Movie Rating"
                path="/predict"
                description="Forecast a film's audience rating in seconds. Add cast, crew, genre and runtime — MovieAI returns a confident 0–10 verdict and the factors behind it."
            />
            <HeroBackground />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="text-center max-w-3xl mx-auto mb-10">
                    <p className="eyebrow">⌬ Prediction Studio</p>
                    <h1 className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter">
                        Configure your <span className="gradient-text">movie</span>
                    </h1>
                    <p className="text-[color:rgba(23,23,23,0.6)] mt-3">
                        Fill in the essentials. The forecast appears in under a second.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* FORM */}
                    <motion.form
                        layout
                        onSubmit={onSubmit}
                        className="lg:col-span-3 glass-strong rounded-3xl p-6 md:p-8"
                        data-testid="prediction-form"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field
                                label="Movie Name"
                                icon={Film}
                                testId="input-name"
                                value={form.name}
                                onChange={onChange("name")}
                                placeholder="e.g. Stellar Echoes"
                            />
                            <Field
                                label="Release Year"
                                icon={Clock}
                                testId="input-year"
                                type="number"
                                value={form.year}
                                onChange={onChange("year")}
                                min={1900}
                                max={2100}
                            />
                            <Field
                                label="Duration (min)"
                                icon={Clock}
                                testId="input-duration"
                                type="number"
                                value={form.duration}
                                onChange={onChange("duration")}
                                min={1}
                            />
                            <Field
                                label="Votes"
                                icon={ThumbsUp}
                                testId="input-votes"
                                type="number"
                                value={form.votes}
                                onChange={onChange("votes")}
                                min={0}
                            />
                            <Autocomplete
                                label="Genre"
                                icon={Tag}
                                testId="input-genre"
                                field="genre"
                                value={form.genre}
                                onChange={(v) =>
                                    setForm((f) => ({ ...f, genre: v }))
                                }
                                placeholder="Drama, Action…"
                            />
                            <Autocomplete
                                label="Director"
                                icon={User}
                                testId="input-director"
                                field="director"
                                value={form.director}
                                onChange={(v) =>
                                    setForm((f) => ({ ...f, director: v }))
                                }
                                placeholder="Rajkumar Hirani"
                            />
                            <Autocomplete
                                label="Actor 1"
                                icon={Users}
                                testId="input-actor1"
                                field="actor1"
                                value={form.actor1}
                                onChange={(v) =>
                                    setForm((f) => ({ ...f, actor1: v }))
                                }
                                placeholder="Aamir Khan"
                            />
                            <Autocomplete
                                label="Actor 2"
                                icon={Users}
                                testId="input-actor2"
                                field="actor2"
                                value={form.actor2}
                                onChange={(v) =>
                                    setForm((f) => ({ ...f, actor2: v }))
                                }
                            />
                            <Autocomplete
                                label="Actor 3"
                                icon={Users}
                                testId="input-actor3"
                                field="actor3"
                                value={form.actor3}
                                onChange={(v) =>
                                    setForm((f) => ({ ...f, actor3: v }))
                                }
                            />
                        </div>

                        {error && (
                            <div
                                className="mt-5 px-4 py-3 rounded-xl text-sm bg-rose-500/10 border border-rose-500/30 text-rose-200"
                                data-testid="form-error"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary w-full justify-center mt-8 text-base"
                            data-testid="submit-prediction"
                            disabled={loading}
                        >
                            <Wand2 size={18} />
                            {loading ? "Analyzing…" : "Analyze Movie"}
                        </button>
                    </motion.form>

                    {/* RIGHT — Loading/terminal */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <LoadingSequence />
                        ) : (
                            <div className="glass rounded-3xl p-6 font-mono text-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#B5634B]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#7A8C7A]" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A05C]" />
                                    <span className="ml-3 text-[11px] tracking-[0.25em] uppercase text-[color:rgba(23,23,23,0.5)]">
                                        idle · awaiting input
                                    </span>
                                </div>
                                <p className="text-[color:rgba(23,23,23,0.7)] leading-relaxed">
                                    <span className="text-[#C9A05C]">$</span>{" "}
                                    movieai --help
                                </p>
                                <p className="text-[color:rgba(23,23,23,0.45)] mt-3 leading-relaxed">
                                    Fill in the form. Director and cast autocomplete with
                                    names our intelligence engine has already studied —
                                    those produce the sharpest forecasts.
                                </p>
                                <ul className="mt-5 space-y-2 text-xs">
                                    <li>
                                        <span className="text-[#7A8C7A]">▸</span>{" "}
                                        Pre-release forecast in &lt; 1 second
                                    </li>
                                    <li>
                                        <span className="text-[#7A8C7A]">▸</span>{" "}
                                        Verdict tagged Blockbuster / Solid / Risky
                                    </li>
                                    <li>
                                        <span className="text-[#7A8C7A]">▸</span>{" "}
                                        Confidence backed by ensemble consensus
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, icon: Icon, testId, ...rest }) {
    return (
        <div>
            <label className="label flex items-center gap-2">
                {Icon && <Icon size={12} className="text-[#C9A05C]" />}
                {label}
            </label>
            <input
                className="field"
                data-testid={testId}
                {...rest}
            />
        </div>
    );
}

function Autocomplete({ label, icon, field, value, onChange, testId, placeholder }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const debounceRef = useRef();

    useEffect(() => {
        if (!open) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetchSuggestions(field, value);
                setItems(res || []);
            } catch {
                setItems([]);
            }
        }, 180);
        return () => clearTimeout(debounceRef.current);
    }, [value, open, field]);

    const Icon = icon;
    return (
        <div className="relative">
            <label className="label flex items-center gap-2">
                {Icon && <Icon size={12} className="text-[#C9A05C]" />}
                {label}
            </label>
            <input
                className="field"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 180)}
                placeholder={placeholder}
                data-testid={testId}
                autoComplete="off"
            />
            {open && items.length > 0 && (
                <div
                    className="absolute z-20 left-0 right-0 mt-1 glass-strong rounded-xl py-1 max-h-56 overflow-auto"
                    data-testid={`${testId}-suggestions`}
                >
                    {items.map((it) => (
                        <button
                            type="button"
                            key={it}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(it);
                                setOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-ink/80 hover:bg-black/5"
                        >
                            {it}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
