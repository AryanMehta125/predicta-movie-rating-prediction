import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Database, Github, GraduationCap, ExternalLink } from "lucide-react";

export default function CreditsModal({ open, onClose }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-testid="credits-modal-overlay"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.95, y: 12, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 8, opacity: 0 }}
                        transition={{ type: "spring", damping: 24, stiffness: 280 }}
                        className="relative bg-[var(--rice)] rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-black/[0.08]"
                        data-testid="credits-modal"
                    >
                        <button
                            onClick={onClose}
                            data-testid="credits-modal-close"
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
                            aria-label="Close credits"
                        >
                            <X size={16} className="text-ink" />
                        </button>

                        <div className="mb-6">
                            <p className="eyebrow">Credits &amp; Attribution</p>
                            <h3 className="font-display text-2xl font-medium mt-2 text-ink tracking-tight">
                                Data Sources
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <a
                                href="https://www.kaggle.com/datasets/adrianmcmahon/imdb-india-movies"
                                target="_blank"
                                rel="noreferrer"
                                data-testid="credits-kaggle-link"
                                className="block bg-white rounded-2xl p-4 border border-black/[0.06] hover:border-black/20 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--white-dove)] border border-black/[0.06] flex items-center justify-center">
                                        <Database size={18} className="text-champagne" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-display font-medium text-ink">
                                                Kaggle Dataset
                                            </h4>
                                            <ExternalLink size={14} className="text-warm" />
                                        </div>
                                        <p className="text-xs text-graphite mt-1">
                                            IMDb Movies India dataset by Adrian McMahon
                                        </p>
                                    </div>
                                </div>
                            </a>

                            <a
                                href="https://github.com/AryanMehta125/Movie-Rating-Prediction"
                                target="_blank"
                                rel="noreferrer"
                                data-testid="credits-github-link"
                                className="block bg-white rounded-2xl p-4 border border-black/[0.06] hover:border-black/20 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--white-dove)] border border-black/[0.06] flex items-center justify-center">
                                        <Github size={18} className="text-ink" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-display font-medium text-ink">
                                                Original Repository
                                            </h4>
                                            <ExternalLink size={14} className="text-warm" />
                                        </div>
                                        <p className="text-xs text-graphite mt-1">
                                            Movie Rating Prediction — base workflow
                                        </p>
                                    </div>
                                </div>
                            </a>

                            <div
                                className="bg-[var(--linen)] rounded-2xl p-4 border border-black/[0.06]"
                                data-testid="credits-disclaimer"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center">
                                        <GraduationCap size={18} className="text-graphite" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-xs text-graphite leading-relaxed">
                                        This project is intended for educational, research,
                                        and portfolio purposes. Dataset rights belong to
                                        their respective owners. Original open-source
                                        contributors are credited where applicable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
