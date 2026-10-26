import "../index.css";
import Providers from "../components/Providers";
import Preloader from "../components/Preloader";
import ScrollToTop from "../components/ScrollToTop";
import SiteJsonLd from "../components/SiteJsonLd";
import { buildRootMetadata } from "../lib/metadata";

export async function generateMetadata() {
  return buildRootMetadata();
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteJsonLd />
        <Providers>
          <Preloader />
          <ScrollToTop />
          {children}
        </Providers>
      </body>
    </html>
  );
}
