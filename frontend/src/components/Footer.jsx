import React, { useState } from "react";
import CreditsModal from "./CreditsModal";

export default function Footer() {
    const [open, setOpen] = useState(false);

    return (
        <footer
            data-testid="footer"
            className="relative mt-16 md:mt-32 border-t border-black/[0.08]"
        >
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-3 md:gap-6">
                    
                    {/* Mobile: Brand First */}
                    {/* Desktop: Left */}
                    <p
                        className="text-sm font-display font-medium tracking-tight text-center md:text-left text-ink md:order-1 order-1"
                        data-testid="footer-title"
                    >
                        Movie Rating Prediction{" "}
                        <span className="gradient-text">AI</span>
                    </p>

                    {/* Center */}
                    <p
                        className="text-sm text-warm text-center font-mono md:order-2 order-2"
                        data-testid="footer-copyright"
                    >
                        © 2026 Aryan Mehta
                    </p>

                    {/* Right */}
                    <div className="text-center md:text-right md:w-full md:order-3 order-3">
                        <button
                            data-testid="footer-credits-trigger"
                            onClick={() => setOpen(true)}
                            className="editorial-link text-sm text-graphite"
                        >
                            Data Sources &amp; Credits
                        </button>
                    </div>
                </div>
            </div>

            <CreditsModal
                open={open}
                onClose={() => setOpen(false)}
            />
        </footer>
    );
}