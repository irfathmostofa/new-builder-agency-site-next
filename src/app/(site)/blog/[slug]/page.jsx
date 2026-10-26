import BlogPost from "../../../../views/BlogPost";
import { buildSlugMetadata } from "../../../../lib/metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildSlugMetadata("post", slug);
}

export default function Page() {
  return <BlogPost />;
}
