import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
    { to: "/", label: "Home" },
    { to: "/predict", label: "Predict" },
    { to: "/compare", label: "Compare" },
    { to: "/sentiment", label: "Sentiment" },
    { to: "/analytics", label: "Insights" },
    { to: "/about", label: "About" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => setOpen(false), [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
    data-testid="navbar"
    className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
                scrolled ? "py-2" : "py-3"
            }`}
        >
            <div
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all`}
            >
                <div
    className={`relative flex items-center justify-between rounded-full px-5 py-2.5 transition-all ${
        scrolled ? "glass-strong" : "bg-transparent"
    }`}
                    style={
                        scrolled
                            ? {}
                            : { borderBottom: "1px solid transparent" }
                    }
                >
                    <Link
    to="/"
    data-testid="navbar-logo"
    className="
        flex items-center gap-2 font-display text-lg font-semibold tracking-tight
        absolute left-1/2 -translate-x-1/2
        md:static md:translate-x-0
    "
>   
                        <span className="font-serif italic text-xl text-champagne">
                            
                        </span>
                        <span>Predicta</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.to === "/"}
                                data-testid={`nav-link-${l.label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        isActive
                                            ? "text-ink"
                                            : "text-warm hover:text-ink"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.span
                                                layoutId="nav-pill"
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    background:
                                                        "rgba(23,23,23,0.07)",
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <span className="relative">{l.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden md:block">
                        <Link
                            to="/predict"
                            data-testid="navbar-cta"
                            className="btn-primary text-sm"
                        >
                            Start Prediction
                        </Link>
                    </div>

                    <button
                        data-testid="navbar-mobile-toggle"
                        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-black/5 border border-black/10"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="md:hidden mt-2 glass-strong rounded-3xl p-3 flex flex-col gap-0.5"
                            data-testid="navbar-mobile-menu"
                        >
                            {links.map((l) => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    end={l.to === "/"}
                                    data-testid={`nav-mobile-${l.label.toLowerCase()}`}
                                    className={({ isActive }) =>
                                        `px-4 py-3 rounded-2xl text-sm font-medium ${
                                            isActive
                                                ? "bg-black/8 text-ink"
                                                : "text-graphite"
                                        }`
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                            <Link
                                to="/predict"
                                className="btn-primary justify-center mt-2"
                                data-testid="navbar-mobile-cta"
                            >
                                Start Prediction
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
