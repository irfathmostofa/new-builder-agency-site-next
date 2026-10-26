"use client";

import { useEffect } from "react";
import { AuthProvider } from "../lib/auth";
import { getSiteSettings } from "../lib/queries";
import { getSeoSettingsCached } from "../lib/seoStore";

export default function Providers({ children }) {
  useEffect(() => {
    getSiteSettings();
    getSeoSettingsCached();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
