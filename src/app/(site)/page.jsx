import Home from "../../views/Home";
import { buildMetadata } from "../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/");
}

export default function Page() {
  return <Home />;
}
