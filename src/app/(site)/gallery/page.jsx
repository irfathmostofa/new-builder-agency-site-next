import Gallery from "../../../views/Gallery";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/gallery");
}

export default function Page() {
  return <Gallery />;
}
