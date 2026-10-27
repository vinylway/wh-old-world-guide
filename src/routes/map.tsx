import { createFileRoute } from "@tanstack/react-router";
import OldWorldMap from "@/pages/OldWorldMap";

export const Route = createFileRoute("/map")({
  component: OldWorldMap,
});
