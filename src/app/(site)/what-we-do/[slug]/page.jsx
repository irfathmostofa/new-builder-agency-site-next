import ServiceDetail from "../../../../views/ServiceDetail";
import { buildSlugMetadata } from "../../../../lib/metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildSlugMetadata("service", slug);
}

export default function Page() {
  return <ServiceDetail />;
}
