import { getSeoSettingsCached, robotsBody } from "../../lib/seoStore";

export const revalidate = 60;

export async function GET() {
  const settings = await getSeoSettingsCached();
  const body = robotsBody(settings);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
