import { createFileRoute } from "@tanstack/react-router";
import PlayerCorner from "@/pages/PlayerCorner";

export const Route = createFileRoute("/player-corner")({
  component: PlayerCorner,
});
