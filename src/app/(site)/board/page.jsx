import Board from "../../../views/Board";
import { buildMetadata } from "../../../lib/metadata";

export async function generateMetadata() {
  return buildMetadata("/board");
}

export default function Page() {
  return <Board />;
}
