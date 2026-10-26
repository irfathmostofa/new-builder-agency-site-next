import WhatWeDo from "../../../views/WhatWeDo";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/what-we-do");
}

export default function Page() {
  return <WhatWeDo />;
}
