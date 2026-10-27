import { createFileRoute } from "@tanstack/react-router";
import GmCorner from "@/pages/GmCorner";

export const Route = createFileRoute("/gm-corner")({
  component: GmCorner,
});
