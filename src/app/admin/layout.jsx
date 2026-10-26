import AdminGate from "../../views/admin/AdminGate";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return <AdminGate>{children}</AdminGate>;
}
