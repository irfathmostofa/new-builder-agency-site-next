import Blog from "../../../views/Blog";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/blog");
}

export default function Page() {
  return <Blog />;
}
