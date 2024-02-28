import { useFetchers } from "@remix-run/react"
import { buildAwardsNavigationList } from "~/utils/helpers"
import StatusIcon from "./StatusIcon"

type AwardSelectOptionProps = {
  item: ReturnType<typeof buildAwardsNavigationList>[0]
  fetchers: ReturnType<typeof useFetchers>
}

export default function AwardSelectOption({
  item,
  fetchers,
}: AwardSelectOptionProps) {
  return (
    <option key={item.awardSlug} value={item.awardSlug}>
      <StatusIcon item={item} fetchers={fetchers} /> {item.awardName}
    </option>
  )
}
