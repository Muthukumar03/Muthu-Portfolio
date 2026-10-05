"use client";
import React from "react";
import Image from "next/image";
import { heroContent } from "@/data/content";
import { ArrowUpRight } from "lucide-react";

interface HeaderProps {
  onOpenWorks?: () => void;
}

export default function Header({ onOpenWorks }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-pill fx fx-header">
        <a className="brand" href="#top" aria-label={`${heroContent.headline} — home`}>
          <Image
            src="/assets/mk-logo.png?v=2"
            alt="Muthukumar (MK) Logo"
            width={64}
            height={23}
            className="brand-mark"
            priority
          />
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
          <a
            className="cta"
            href={heroContent.cta.href}
            target={heroContent.cta.href.endsWith(".pdf") ? "_blank" : undefined}
            rel={heroContent.cta.href.endsWith(".pdf") ? "noopener noreferrer" : undefined}
          >
            {/* Left arrow (arrives on hover) */}
            <ArrowUpRight className="cta-arrow cta-arrow--left" aria-hidden="true" />

            {/* Button text */}
            <span className="cta-text" data-slot="cta">{heroContent.cta.label}</span>

            {/* Expanding circle background */}
            <span className="cta-circle" aria-hidden="true" />

            {/* Right arrow (departs on hover) */}
            <ArrowUpRight className="cta-arrow cta-arrow--right" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
