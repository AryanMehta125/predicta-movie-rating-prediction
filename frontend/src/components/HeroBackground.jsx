import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Editorial backdrop — soft cream orbs, hairline grid, optional cinema stills.
 */
export default function HeroBackground({ posters = false }) {
    const wrapRef = useRef(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const handler = (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.setProperty("--mx", `${x * 24}px`);
            el.style.setProperty("--my", `${y * 24}px`);
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);

    const posterImages = [
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=300&q=70",
        "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=300&q=70",
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=300&q=70",
        "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=300&q=70",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=300&q=70",
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=70",
    ];

    return (
        <div
            ref={wrapRef}
            className="absolute inset-0 overflow-hidden pointer-events-none noise"
            style={{ "--mx": "0px", "--my": "0px" }}
            aria-hidden
        >
            <div className="absolute inset-0 grid-bg" />

            <div
                className="orb orb-cream orb-anim-1"
                style={{
                    width: 460,
                    height: 460,
                    top: "-140px",
                    left: "-100px",
                    transform: "translate(var(--mx), var(--my))",
                }}
            />
            <div
                className="orb orb-champagne orb-anim-2"
                style={{
                    width: 520,
                    height: 520,
                    top: "30%",
                    right: "-180px",
                    transform: "translate(calc(var(--mx) * -1), var(--my))",
                }}
            />
            <div
                className="orb orb-mist orb-anim-3"
                style={{
                    width: 380,
                    height: 380,
                    bottom: "-120px",
                    left: "30%",
                }}
            />

            {/* Particles — tiny ink dots */}
            {Array.from({ length: 18 }).map((_, i) => {
                const left = (i * 37) % 100;
                const top = (i * 53) % 100;
                const delay = (i % 10) * 0.4;
                const dur = 6 + (i % 7);
                return (
                    <motion.span
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            background: "rgba(23,23,23,0.25)",
                        }}
                        animate={{
                            y: [0, -16, 0],
                            opacity: [0.1, 0.4, 0.1],
                        }}
                        transition={{
                            duration: dur,
                            repeat: Infinity,
                            delay,
                            ease: "easeInOut",
                        }}
                    />
                );
            })}

            {posters &&
                posterImages.map((src, idx) => {
                    const positions = [
                        { left: "5%", top: "14%", rot: -8 },
                        { left: "83%", top: "10%", rot: 6 },
                        { left: "10%", top: "70%", rot: 10 },
                        { left: "80%", top: "62%", rot: -6 },
                        {
    left: window.innerWidth < 768 ? "45%" : "46%",
    top: window.innerWidth < 768 ? "10%" : "10%",
    rot: 3
},
                        { left: "50%", top: "82%", rot: -3 },
                    ];
                    const p = positions[idx];
                    return (
                        <motion.div
                            key={src}
                            className="poster"
                            style={{
                                left: p.left,
                                top: p.top,
                                backgroundImage: `url(${src})`,
                                transform: `rotate(${p.rot}deg)`,
                            }}
                            animate={{
                                y: [0, -10, 0],
                                rotate: [p.rot, p.rot + 2, p.rot],
                            }}
                            transition={{
                                duration: 6 + idx,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: idx * 0.4,
                            }}
                        />
                    );
                })}

            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[var(--rice)]" />
        </div>
    );
}
