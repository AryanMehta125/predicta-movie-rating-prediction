import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Film,
    Sparkles,
    Brain,
    Users,
    Tag,
    BarChart3,
    Star,
    Trophy,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";
import HeroBackground from "../components/HeroBackground";
import StatsCard from "../components/StatsCard";
import Seo from "../components/Seo";
import { fetchAnalytics } from "../lib/api";

const NEON = ["#C9A05C", "#7A8C7A", "#B5634B", "#C9A05C", "#7A8C7A", "#C9A05C"];

const tooltipStyle = {
    backgroundColor: "rgba(10,10,12,0.92)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "white",
    backdropFilter: "blur(12px)",
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics()
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="pt-40 text-center font-mono text-ink/40">
                Loading analytics…
            </div>
        );
    }

    const stats = data.stats;
    const yearTrendsDecadeAvg = aggregateByDecade(data.year_trends);

    return (
        <div className="page-enter relative pt-32 pb-20 min-h-screen">
            <Seo
                title="Cinema Insights"
                path="/analytics"
                description="Live cinema insights — rating spread, genre momentum, director pedigree and audience scale at a glance."
            />
            <HeroBackground />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="eyebrow text-center">⌬ Insights</p>
                <h1 className="font-display font-black text-4xl md:text-6xl mt-3 tracking-tighter text-center">
                    Cinema <span className="gradient-text">intelligence</span>
                </h1>
                <p className="text-center text-[color:rgba(23,23,23,0.6)] mt-3 max-w-2xl mx-auto">
                    Live insights distilled from {stats.total_movies.toLocaleString()}{" "}
                    real films — the same wisdom that powers every forecast.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                    <StatsCard
                        label="Films Studied"
                        value={stats.total_movies.toLocaleString()}
                        icon={Film}
                        accent="from-[#C9A05C] to-[#7A8C7A]"
                        testId="analytics-stat-movies"
                    />
                    <StatsCard
                        label="Average Verdict"
                        value={stats.avg_rating}
                        icon={Star}
                        accent="from-[#7A8C7A] to-[#B5634B]"
                        testId="analytics-stat-avg"
                    />
                    <StatsCard
                        label="Genres"
                        value={stats.total_genres}
                        icon={Tag}
                        accent="from-[#B5634B] to-[#C9A05C]"
                        testId="analytics-stat-genres"
                    />
                    <StatsCard
                        label="Directors"
                        value={stats.total_directors.toLocaleString()}
                        icon={Brain}
                        accent="from-[#C9A05C] to-[#7A8C7A]"
                        testId="analytics-stat-directors"
                    />
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Highlight
                        icon={Trophy}
                        label="Top Genre"
                        value={stats.highest_rated_genre}
                        accent="#C9A05C"
                        testId="hl-top-genre"
                    />
                    <Highlight
                        icon={Brain}
                        label="Top Director"
                        value={stats.highest_rated_director}
                        accent="#7A8C7A"
                        testId="hl-top-director"
                    />
                    <Highlight
                        icon={Users}
                        label="Top Actor"
                        value={stats.highest_rated_actor}
                        accent="#B5634B"
                        testId="hl-top-actor"
                    />
                </div>

                {/* Charts grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                    <ChartCard
                        title="Rating Distribution"
                        subtitle="Bucketed counts across 0–10 in 0.5 steps"
                        className="lg:col-span-7"
                        testId="chart-rating-dist"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.rating_distribution}>
                                <defs>
                                    <linearGradient
                                        id="ratingGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#C9A05C"
                                            stopOpacity={0.95}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#7A8C7A"
                                            stopOpacity={0.4}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    stroke="rgba(255,255,255,0.04)"
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="bin"
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="url(#ratingGrad)"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Vote Distribution"
                        subtitle="How votes are spread"
                        className="lg:col-span-5"
                        testId="chart-vote-dist"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={data.vote_distribution}
                                    dataKey="count"
                                    nameKey="bucket"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                >
                                    {data.vote_distribution.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={NEON[i % NEON.length]}
                                            stroke="rgba(0,0,0,0.3)"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
    contentStyle={tooltipStyle}
    itemStyle={{ color: "#ffffff" }}
    labelStyle={{ color: "#ffffff" }}
/>
                            </PieChart>
                        </ResponsiveContainer>
                        <Legend items={data.vote_distribution} keyField="bucket" />
                    </ChartCard>

                    <ChartCard
                        title="Genre Performance"
                        subtitle="Average rating by genre (min 30 movies)"
                        className="lg:col-span-7"
                        testId="chart-genres"
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={data.genre_performance} layout="vertical">
                                <defs>
                                    <linearGradient
                                        id="genreGrad"
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="0"
                                    >
                                        <stop offset="0%" stopColor="#7A8C7A" />
                                        <stop offset="100%" stopColor="#B5634B" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    stroke="rgba(255,255,255,0.04)"
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                    domain={[0, 10]}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="genre"
                                    width={92}
                                    tick={{ fill: "#ffffffaa", fontSize: 11 }}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar
                                    dataKey="avg_rating"
                                    fill="url(#genreGrad)"
                                    radius={[0, 6, 6, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Year Trends"
                        subtitle="Average rating per decade"
                        className="lg:col-span-5"
                        testId="chart-year"
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={yearTrendsDecadeAvg}>
                                <defs>
                                    <linearGradient
                                        id="areaGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#C9A05C"
                                            stopOpacity={0.6}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#C9A05C"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    stroke="rgba(255,255,255,0.04)"
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="decade"
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                    domain={[0, 10]}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area
                                    type="monotone"
                                    dataKey="avg_rating"
                                    stroke="#C9A05C"
                                    strokeWidth={2}
                                    fill="url(#areaGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Top Directors"
                        subtitle="Average rating · min 5 movies"
                        className="lg:col-span-6"
                        testId="chart-directors"
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={data.director_performance.slice(0, 10)}>
                                <CartesianGrid
                                    stroke="rgba(255,255,255,0.04)"
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="director"
                                    tick={{ fill: "#ffffff60", fontSize: 10 }}
                                    angle={-25}
                                    textAnchor="end"
                                    height={70}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                    domain={[0, 10]}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar
                                    dataKey="avg_rating"
                                    fill="#7A8C7A"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Top Actors"
                        subtitle="Average rating · min 5 movies"
                        className="lg:col-span-6"
                        testId="chart-actors"
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={data.actor_performance.slice(0, 10)}>
                                <CartesianGrid
                                    stroke="rgba(255,255,255,0.04)"
                                    strokeDasharray="3 3"
                                />
                                <XAxis
                                    dataKey="actor"
                                    tick={{ fill: "#ffffff60", fontSize: 10 }}
                                    angle={-25}
                                    textAnchor="end"
                                    height={70}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fill: "#ffffff60", fontSize: 11 }}
                                    domain={[0, 10]}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar
                                    dataKey="avg_rating"
                                    fill="#B5634B"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children, className = "", testId }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass rounded-3xl p-5 ${className}`}
            data-testid={testId}
        >
            <div className="mb-3">
                <h3 className="font-display font-bold text-lg">{title}</h3>
                <p className="text-xs text-ink/45 mt-0.5">{subtitle}</p>
            </div>
            {children}
        </motion.div>
    );
}

function Highlight({ icon: Icon, label, value, accent, testId }) {
    return (
        <div
            className="glass rounded-2xl p-5 flex items-center gap-4"
            data-testid={testId}
        >
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                style={{
                    background: `${accent}22`,
                    borderColor: `${accent}55`,
                }}
            >
                <Icon size={20} style={{ color: accent }} />
            </div>
            <div className="min-w-0">
                <div className="text-[10px] tracking-[0.2em] uppercase text-ink/40 font-mono">
                    {label}
                </div>
                <div className="font-display font-bold text-lg truncate">
                    {value || "—"}
                </div>
            </div>
        </div>
    );
}

function Legend({ items, keyField = "bucket" }) {
    return (
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
            {items.map((it, i) => (
                <div key={it[keyField]} className="flex items-center gap-2">
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: NEON[i % NEON.length] }}
                    />
                    <span className="text-ink/55">
                        {it[keyField]}{" "}
                        <span className="text-ink/30 font-mono">
                            · {it.count}
                        </span>
                    </span>
                </div>
            ))}
        </div>
    );
}

function aggregateByDecade(yearTrends) {
    if (!yearTrends?.length) return [];
    const buckets = {};
    yearTrends.forEach((y) => {
        const d = Math.floor(y.year / 10) * 10;
        if (!buckets[d]) buckets[d] = { decade: `${d}s`, total: 0, sum: 0, count: 0 };
        buckets[d].sum += y.avg_rating * y.count;
        buckets[d].count += y.count;
    });
    return Object.values(buckets)
        .map((b) => ({
            decade: b.decade,
            avg_rating: Number((b.sum / b.count).toFixed(2)),
            count: b.count,
        }))
        .sort((a, b) =>
            a.decade.localeCompare(b.decade, undefined, { numeric: true }),
        );
}
