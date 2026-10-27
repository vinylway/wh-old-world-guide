import { createFileRoute } from "@tanstack/react-router";
import CharacterGenerator from "@/pages/CharacterGenerator";

export const Route = createFileRoute("/generator")({
  component: CharacterGenerator,
});
