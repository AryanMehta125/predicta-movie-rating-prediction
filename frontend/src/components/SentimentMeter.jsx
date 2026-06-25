import React from "react";
import { motion } from "framer-motion";

export default function SentimentMeter({ polarity = 0, label = "Neutral" }) {
    // polarity range [-1, +1]
    const pct = ((polarity + 1) / 2) * 100;
    const color =
        label === "Positive"
            ? "#B9C8C5"
            : label === "Negative"
              ? "#ff007f"
              : "#7A8C7A";

    return (
        <div className="w-full" data-testid="sentiment-meter">
            <div className="flex justify-between text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-2">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden bg-black/5">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(90deg, #B5634B 0%, #7A8C7A 50%, #C9A05C 100%)",
                        opacity: 0.25,
                    }}
                />
                <motion.div
                    initial={{ left: "50%" }}
                    animate={{ left: `${pct}%` }}
                    transition={{ type: "spring", damping: 18, stiffness: 200 }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg"
                    style={{ background: color }}
                />
            </div>
            <div className="text-center mt-4">
                <span
                    className="font-display font-bold text-2xl"
                    style={{ color }}
                    data-testid="sentiment-label"
                >
                    {label}
                </span>
                <p className="text-xs text-[color:rgba(23,23,23,0.45)] font-mono mt-1">
                    polarity {polarity.toFixed(3)}
                </p>
            </div>
        </div>
    );
}
