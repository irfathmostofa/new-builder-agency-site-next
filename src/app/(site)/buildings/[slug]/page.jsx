import BuildingDetail from "../../../../views/BuildingDetail";
import { buildSlugMetadata } from "../../../../lib/metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildSlugMetadata("building", slug);
}

export default function Page() {
  return <BuildingDetail />;
}
