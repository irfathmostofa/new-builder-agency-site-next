"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Link2 } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "./SocialIcons";
import { getSiteSettings, peekSiteSettings } from "../lib/queries";

const ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  x: TwitterIcon,
  youtube: YoutubeIcon,
  whatsapp: MessageCircle,
};

function iconFor(platform) {
  return ICONS[(platform ?? "").toLowerCase()] ?? Link2;
}

export default function Footer() {
  const [brand, setBrand] = useState({
    logo_url: null,
    site_name: "Meridian Builders",
    social_links: [],
  });

  useEffect(() => {
    const cached = peekSiteSettings();
    if (cached) {
      setBrand({
        logo_url: cached.logo_url,
        site_name: cached.site_name || "Meridian Builders",
        social_links: cached.social_links ?? [],
      });
    }
    getSiteSettings().then((data) => {
      if (data) {
        setBrand({
          logo_url: data.logo_url,
          site_name: data.site_name || "Meridian Builders",
          social_links: data.social_links ?? [],
        });
      }
    });
  }, []);

  return (
    <footer className="bg-ink px-6 py-16 text-concrete md:px-12">
      <div className="mx-auto grid max-w-[90rem] gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={brand.site_name}
              className="h-8 w-auto"
            />
          ) : (
            <p className="font-display text-lg font-semibold text-paper">
              {brand.site_name}
            </p>
          )}
          <p className="mt-3 max-w-xs font-body text-sm text-concrete/70">
            Structures designed with intent, built to last, documented from
            blueprint to handover.
          </p>

          {brand.social_links?.length > 0 && (
            <div className="mt-5 flex gap-4">
              {brand.social_links.map((link, i) => {
                const Icon = iconFor(link.platform);
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.platform}
                    className="text-concrete/60 transition-colors hover:text-paper"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className="font-mono text-xs uppercase tracking-widest">
          <p className="mb-3 text-steel">Site</p>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-paper">
                Home
              </Link>
            </li>
            <li>
              <Link href="/buildings" className="hover:text-paper">
                Buildings
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-paper">
                Products
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-paper">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/what-we-do" className="hover:text-paper">
                What We Do
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-paper">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-paper">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="font-mono text-xs uppercase tracking-widest">
          <p className="mb-3 text-steel">Contact</p>
          <ul className="space-y-2 normal-case tracking-normal">
            <li>hello@meridianbuilders.com</li>
            <li>+1 (555) 010-2249</li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-16 max-w-[90rem] font-mono text-[11px] text-concrete/40">
        © {new Date().getFullYear()} {brand.site_name}. All rights reserved.
      </p>
    </footer>
  );
}
