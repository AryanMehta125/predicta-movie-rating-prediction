import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
    "Initialising cinema intelligence",
    "Analysing director pedigree",
    "Evaluating cast chemistry",
    "Reading genre momentum",
    "Comparing audience signals",
    "Weighing historical hits",
    "Drafting the verdict",
    "Polishing your forecast",
];

export default function LoadingSequence({ onComplete, stepDuration = 480 }) {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        if (idx >= STEPS.length) {
            const t = setTimeout(() => onComplete && onComplete(), 300);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => setIdx((v) => v + 1), stepDuration);
        return () => clearTimeout(t);
    }, [idx, onComplete, stepDuration]);

    return (
        <div
            className="glass-strong rounded-3xl p-7 font-mono"
            data-testid="loading-sequence"
        >
            <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B5634B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A8C7A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A05C]" />
                <span className="ml-3 text-[11px] tracking-[0.25em] uppercase text-[color:rgba(23,23,23,0.5)]">
                    movieai · cinema intelligence
                </span>
            </div>

            <div className="space-y-2 text-sm min-h-[240px]">
                <AnimatePresence>
                    {STEPS.slice(0, idx).map((s, i) => (
                        <motion.div
                            key={s}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                            data-testid={`loading-step-${i}`}
                        >
                            <span className="text-[#7A8C7A]">▸</span>
                            <span className="text-ink/80">{s}</span>
                            <span className="ml-auto text-[#C9A05C] text-xs">
                                ✓ done
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {idx < STEPS.length && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-[#C9A05C]"
                    >
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                            }}
                            className="inline-block w-3 h-3 rounded-full border-2 border-[#C9A05C] border-t-transparent"
                        />
                        <span>{STEPS[idx]}</span>
                        <span className="ml-2 inline-flex">
                            <Dot delay={0} />
                            <Dot delay={0.2} />
                            <Dot delay={0.4} />
                        </span>
                    </motion.div>
                )}
            </div>

            <div className="mt-6 h-1 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#C9A05C] via-[#7A8C7A] to-[#B5634B]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(idx / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
}

function Dot({ delay }) {
    return (
        <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay }}
            className="mx-0.5"
        >
            .
        </motion.span>
    );
}
