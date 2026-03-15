import React from "react";
import styles from "./SiteFooter.module.css";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <p>
        designed by{" "}
        <a
          href="https://etienne.design/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Étienne Mineur
        </a>{" "}
        with{" "}
        <a
          href="https://floot.com?fpr=etienne"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Floot
        </a>
      </p>
    </footer>
  );
}