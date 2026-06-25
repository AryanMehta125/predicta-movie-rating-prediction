import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Circular animated rating gauge (SVG).
// value: number 0..max
export default function RatingGauge({
    value = 0,
    max = 10,
    size = 220,
    label = "Predicted Rating",
    accent = "#C9A05C",
    duration = 1.4,
}) {
    const stroke = 16;
    const radius = (size - stroke) / 2;
    const circ = 2 * Math.PI * radius;
    const safe = Math.max(0, Math.min(max, value));
    const pct = safe / max;
    const offset = circ * (1 - pct);

    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const startedAt = performance.now();
        let raf;
        const loop = (t) => {
            const p = Math.min(1, (t - startedAt) / (duration * 1000));
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(safe * eased);
            if (p < 1) raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [safe, duration]);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
            data-testid="rating-gauge"
        >
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#171717" />
                        <stop offset="50%" stopColor="#C9A05C" />
                        <stop offset="100%" stopColor="#171717" />
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(23,23,23,0.07)"
                    strokeWidth={stroke}
                    fill="none"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gaugeGrad)"
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="font-display font-medium text-5xl text-ink tracking-tight"
                    data-testid="rating-gauge-value"
                >
                    {display.toFixed(1)}
                </span>
                <span className="eyebrow mt-2">{label}</span>
                <span className="text-xs text-warm font-mono mt-1">/ {max}</span>
            </div>
        </div>
    );
}
