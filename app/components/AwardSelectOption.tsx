import { useFetchers } from "@remix-run/react"
import { buildAwardsNavigationList } from "~/utils/helpers"
import StatusIcon from "./StatusIcon"

export default function AwardSelectOption({
  item,
  fetchers,
}: {
  item: ReturnType<typeof buildAwardsNavigationList>[0]
  fetchers: ReturnType<typeof useFetchers>
}) {
  return (
    <option key={item.awardSlug} value={item.awardSlug}>
      <StatusIcon item={item} fetchers={fetchers} /> {item.awardName}
    </option>
  )
}
