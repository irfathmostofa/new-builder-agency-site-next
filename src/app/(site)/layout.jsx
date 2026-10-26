import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FloatingWhatsApp from "../../components/FloatingWhatsApp";
import BackToTop from "../../components/BackToTop";

export const revalidate = 60;

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <BackToTop />
    </div>
  );
}
