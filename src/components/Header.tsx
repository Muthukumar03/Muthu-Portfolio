"use client";

import React from "react";
import { heroContent } from "@/data/content";

interface HeaderProps {
  onOpenWorks?: () => void;
}

export default function Header({ onOpenWorks }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-pill fx fx-header">
        <a className="brand" href="#top" aria-label={`${heroContent.headline} — home`}>
          <svg
            className="brand-mark"
            viewBox="0 0 44 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 4.5 4.5 12l7.5 7.5" />
            <path d="M32 4.5 39.5 12 32 19.5" />
            <path d="M25.5 3.5 18.5 20.5" />
          </svg>
          <span className="brand-dot" aria-hidden="true"></span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {heroContent.nav.map((item, i) => (
              <li key={item.label}>
                <a
                  className={`nav-link ${item.active ? "is-active" : ""}`}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  data-slot={`nav-${i}`}
                  onClick={(e) => {
                    if (item.href === "#projects" && onOpenWorks) {
                      e.preventDefault();
                      onOpenWorks();
                    }
                  }}
                >
                  {item.active && <span className="nav-dot" aria-hidden="true"></span>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a className="cta" href={heroContent.cta.href}>
            <span data-slot="cta">{heroContent.cta.label}</span>
            <svg
              className="cta-arrow"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.2 10.8 10.8 3.2M5 3.2h5.8V9" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
