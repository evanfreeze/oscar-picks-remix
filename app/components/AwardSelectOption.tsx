import { useFetchers } from "@remix-run/react"
import { buildAwardsNavigationList } from "~/utils/helpers"

export default function AwardSelectOption({
  item,
  fetchers,
}: {
  item: ReturnType<typeof buildAwardsNavigationList>[0]
  fetchers: ReturnType<typeof useFetchers>
}) {
  const leadingIcon = (() => {
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

  return (
    <option key={item.awardSlug} value={item.awardSlug}>
      {leadingIcon} {item.awardName}
    </option>
  )
}
