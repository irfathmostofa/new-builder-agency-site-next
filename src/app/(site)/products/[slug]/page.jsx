import ProductDetail from "../../../../views/ProductDetail";
import { buildSlugMetadata } from "../../../../lib/metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildSlugMetadata("product", slug);
}

export default function Page() {
  return <ProductDetail />;
}
