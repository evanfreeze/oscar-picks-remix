import { useMatches } from "@remix-run/react"

export function useSelectedAwardSlug() {
  const matches = useMatches()

  const selectedAwardSlug = matches.find((match) => match.pathname === "/picks")
    ?.params.awardName

  return selectedAwardSlug
}
