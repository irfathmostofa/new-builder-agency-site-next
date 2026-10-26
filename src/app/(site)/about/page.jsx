import About from "../../../views/About";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/about");
}

export default function Page() {
  return <About />;
}
