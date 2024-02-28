import { useFetchers } from "@remix-run/react"
import { buildAwardsNavigationList } from "~/utils/helpers"

type StatusIconProps = {
  item: ReturnType<typeof buildAwardsNavigationList>[0]
  fetchers: ReturnType<typeof useFetchers>
}

export default function StatusIcon({ item, fetchers }: StatusIconProps) {
  const icon = (() => {
    if (
      fetchers.find((fetcher) => fetcher.key === item.awardName)?.state ===
      "submitting"
    ) {
      return "⏳"
    }
    if (item.isPicked) {
      return "✅"
    }
    return ""
  })()

  return <span className="text-xs">{icon}</span>
}
