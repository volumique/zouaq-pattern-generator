/**
 * @file GeneratorPageLayout.tsx
 * @description Layout wrapper specifically for the Generator application page.
 */

import { ReactNode } from "react";
import styles from "./GeneratorPageLayout.module.css";

/**
 * Handles full viewport sizing, overflow hiding, and base typography/colors
 * to ensure the app behaves like a strict native desktop application in the browser.
 * 
 * @param props.children - The specific application elements to render.
 */
export function GeneratorPageLayout({ children }: { children: ReactNode }) {
  return <div className={styles.layout}>{children}</div>;
}