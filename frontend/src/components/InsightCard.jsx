import React from "react";
import { motion } from "framer-motion";

export default function InsightCard({
    title,
    score,
    description,
    accent = "#C9A05C",
    icon: Icon,
    delay = 0,
    testId,
}) {
    // score is expected in [-3..+3] range (delta to global mean)
    const positive = score >= 0;
    const absPct = Math.min(1, Math.abs(score) / 2);
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass rounded-2xl p-5"
            data-testid={testId || "insight-card"}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {Icon && (
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center border"
                            style={{
                                background: `${accent}22`,
                                borderColor: `${accent}55`,
                            }}
                        >
                            <Icon size={16} style={{ color: accent }} />
                        </div>
                    )}
                    <span className="text-[10px] tracking-[0.2em] uppercase text-ink/45 font-semibold">
                        {title}
                    </span>
                </div>
                <span
                    className={`text-xs font-mono font-semibold ${
                        positive ? "text-emerald-300" : "text-rose-300"
                    }`}
                >
                    {positive ? "+" : ""}
                    {score.toFixed(2)}
                </span>
            </div>
            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${absPct * 100}%` }}
                    transition={{ delay: delay + 0.2, duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                        background: positive
                            ? `linear-gradient(90deg, ${accent}, #C9A05C)`
                            : "linear-gradient(90deg, #B5634B, #7A8C7A)",
                    }}
                />
            </div>
            {description && (
                <p className="text-xs text-ink/50 mt-3 leading-relaxed">
                    {description}
                </p>
            )}
        </motion.div>
    );
}
