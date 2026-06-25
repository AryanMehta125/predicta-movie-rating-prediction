import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({
    label,
    value,
    icon: Icon,
    accent = "from-[#C9A05C] to-[#7A8C7A]",
    sub,
    testId,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl p-5 relative overflow-hidden"
            data-testid={testId || "stats-card"}
        >
            {Icon && (
                <div
                    className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl`}
                />
            )}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.2em] uppercase text-ink/45 font-semibold">
                    {label}
                </span>
                {Icon && (
                    <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent}/30 border border-black/10 flex items-center justify-center`}
                    >
                        <Icon size={16} className="text-ink" />
                    </div>
                )}
            </div>
            <div
                className="font-display font-bold text-3xl tracking-tight"
                data-testid={`${testId}-value`}
            >
                {value}
            </div>
            {sub && <p className="text-xs text-ink/50 mt-1">{sub}</p>}
        </motion.div>
    );
}
