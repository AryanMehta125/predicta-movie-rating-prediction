import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LandingPage from "@/pages/LandingPage";
import PredictPage from "@/pages/PredictPage";
import ResultsPage from "@/pages/ResultsPage";
import SentimentPage from "@/pages/SentimentPage";
import FinalRatingPage from "@/pages/FinalRatingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AboutModelPage from "@/pages/AboutModelPage";
import SharedViewPage from "@/pages/SharedViewPage";
import ComparePage from "@/pages/ComparePage";

function ScrollReset() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);
    return null;
}

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <Routes location={location}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/predict" element={<PredictPage />} />
                    <Route path="/predict/results" element={<ResultsPage />} />
                    <Route path="/sentiment" element={<SentimentPage />} />
                    <Route path="/final-rating" element={<FinalRatingPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/about" element={<AboutModelPage />} />
                    <Route path="/share/:id" element={<SharedViewPage />} />
                    <Route path="*" element={<LandingPage />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

function App() {
    return (
        <HelmetProvider>
            <div className="App">
                <BrowserRouter>
                    <ScrollReset />
                    <Navbar />
                    <AnimatedRoutes />
                    <Footer />
                </BrowserRouter>
            </div>
        </HelmetProvider>
    );
}

export default App;
