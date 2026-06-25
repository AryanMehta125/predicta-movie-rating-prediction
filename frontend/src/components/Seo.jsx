import React from "react";
import { Helmet } from "react-helmet-async";

const SITE = "MovieAI · Cinema Intelligence";
const DEFAULT_DESC =
    "Forecast a film's audience rating before release with cinema-grade AI. Combine predictive intelligence with audience sentiment to gauge box-office potential in seconds.";

export default function Seo({
    title,
    description = DEFAULT_DESC,
    path = "/",
    image,
}) {
    const fullTitle = title ? `${title} — ${SITE}` : SITE;
    const origin =
        typeof window !== "undefined" ? window.location.origin : "https://movieai.app";
    const url = `${origin}${path}`;
    const ogImage = image || `${origin}/og-default.png`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={ogImage} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            <meta name="theme-color" content="#FAF5EF" />
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}
