import React from "react";
import { motion } from "framer-motion";

export default function FeatureCard({
    icon: Icon,
    title,
    description,
    accent = "#C9A05C",
    index = 0,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-3xl p-6 group relative overflow-hidden"
            data-testid={`feature-card-${index}`}
        >
            <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-15 blur-3xl transition-opacity group-hover:opacity-30"
                style={{ background: accent }}
            />
            {Icon && (
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border"
                    style={{
                        background: `${accent}22`,
                        borderColor: `${accent}55`,
                    }}
                >
                    <Icon size={22} style={{ color: accent }} />
                </div>
            )}
            <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-ink/60 leading-relaxed">{description}</p>
        </motion.div>
    );
}
