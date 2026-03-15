/**
 * @file _index.tsx
 * @description Landing page for the Moroccan Motif Generator application.
 * Contains introductory marketing copy, feature highlights, and a call-to-action that leads
 * users into the main generator route.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { LandingHeroPattern } from "../components/LandingHeroPattern";
import { SiteFooter } from "../components/SiteFooter";
import { PenTool, Download, Grid, Layers } from "lucide-react";
import { Helmet } from "react-helmet";
import styles from "./_index.module.css";

/**
 * Renders the top-level structural layout for the informational landing view.
 */
export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Moroccan Pattern Generator | Zellige & Zouaq</title>
        <meta
          name="description"
          content="Generate authentic Moroccan geometric patterns in vector format."
        />
      </Helmet>

      <main>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}>
            <LandingHeroPattern />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Zouaq generator</h1>
            <p className={styles.subtitle}>
              Create authentic Zellige and Zouaq patterns with the mathematical precision of the Hasba method. Export your creations as SVG for your design projects.
            </p>
            <div className={styles.ctaContainer}>
              <Button size="lg" className={styles.ctaButton} asChild>
                <Link to="/generator">Create a Pattern</Link>
              </Button>
              <p className={styles.developerNote}>
                For developers, if you want to change or improve the code of this tool, here is a link to a first{" "}
                <a href="https://zouaq.etienne.design/DEVELOPER_GUIDE.txt" target="_blank" rel="noopener noreferrer">
                  user guide
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>The Art of Geometry</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <Grid size={32} className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>Hasba Method</h3>
              <p className={styles.featureText}>
                Based on traditional geometric construction rules. Each pattern starts from a central rosette and extends to infinity through precise regulation grids.
              </p>
            </div>
            <div className={styles.featureCard}>
              <Layers size={32} className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>Zellige & Zouaq</h3>
              <p className={styles.featureText}>
                Choose between the mosaic style of Zellige or the painted patterns of Zouaq. Customize the interlacing to add depth to your creations.
              </p>
            </div>
            <div className={styles.featureCard}>
              <Download size={32} className={styles.featureIcon} />
              <h3 className={styles.featureTitle}>Vector Export</h3>
              <p className={styles.featureText}>
                Download your patterns in high-quality SVG format. Perfect for printing, laser cutting, or integration into your web and graphic projects.
              </p>
            </div>
          </div>
        </section>

        {/* Palette Section */}
        <section className={styles.paletteSection}>
          <h2 className={styles.sectionTitle}>Traditional Colors</h2>
          <p className={styles.subtitle}>A palette inspired by the natural pigments of Fes and Casablanca.</p>
          <div className={styles.paletteGrid}>
            <div className={styles.colorSwatch}>
              <div
                className={styles.swatchCircle}
                style={{ backgroundColor: "#1E4D8C" }}
              />
              <span className={styles.swatchName}>Fes Blue</span>
            </div>
            <div className={styles.colorSwatch}>
              <div
                className={styles.swatchCircle}
                style={{ backgroundColor: "#046307" }}
              />
              <span className={styles.swatchName}>Emerald Green</span>
            </div>
            <div className={styles.colorSwatch}>
              <div
                className={styles.swatchCircle}
                style={{ backgroundColor: "#E4A010" }}
              />
              <span className={styles.swatchName}>Saffron Yellow</span>
            </div>
            <div className={styles.colorSwatch}>
              <div
                className={styles.swatchCircle}
                style={{ backgroundColor: "#C35831" }}
              />
              <span className={styles.swatchName}>Terracotta</span>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}