import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, ExternalLink } from "lucide-react";

export default function ShareModal({ open, onClose, shareId }) {
    const [copied, setCopied] = useState(false);
    const url = shareId
        ? `${window.location.origin}/share/${shareId}`
        : "";

    const copy = async () => {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // fallback
            const ta = document.createElement("textarea");
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    data-testid="share-modal-overlay"
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.92, y: 10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }}
                        transition={{ type: "spring", damping: 22, stiffness: 280 }}
                        className="relative glass-strong rounded-3xl p-7 max-w-md w-full"
                        data-testid="share-modal"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 flex items-center justify-center"
                            data-testid="share-modal-close"
                            aria-label="Close share dialog"
                        >
                            <X size={16} />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A05C]/30 to-[#B5634B]/30 border border-black/10 flex items-center justify-center mb-4">
                            <Share2 size={20} />
                        </div>
                        <h3 className="font-display font-bold text-2xl">
                            Share your <span className="gradient-text">forecast</span>
                        </h3>
                        <p className="text-ink/55 text-sm mt-2">
                            Anyone with this link can view the prediction and AI insights.
                        </p>

                        <div className="mt-6 flex items-center gap-2">
                            <input
                                readOnly
                                value={url}
                                className="field flex-1 font-mono text-xs"
                                data-testid="share-url-input"
                                onFocus={(e) => e.target.select()}
                            />
                            <button
                                onClick={copy}
                                className="btn-primary"
                                data-testid="share-copy-button"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#C9A05C] hover:underline"
                                data-testid="share-open-button"
                            >
                                Open in new tab <ExternalLink size={11} />
                            </a>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
