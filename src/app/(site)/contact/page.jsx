import Contact from "../../../views/Contact";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/contact");
}

export default function Page() {
  return <Contact />;
}
