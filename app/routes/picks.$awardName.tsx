import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { useRef } from "react"
import NomineeOption from "~/components/NomineeOption"
import { updatePicksByUserId } from "~/db/fauna.server"
import { buildAwardDetailsData } from "~/utils/helpers"
import {
  buildMergedPicks,
  fetchUsersPicks,
  requireUserId,
} from "~/utils/helpers.server"

export async function loader(args: LoaderFunctionArgs) {
  const userId = await requireUserId(args)
  const picks = await fetchUsersPicks(userId)
  return buildAwardDetailsData(args.params.awardName, picks)
}

export async function action(args: ActionFunctionArgs) {
  const userId = await requireUserId(args)
  const mergedPicks = await buildMergedPicks(args, userId)
  const picks = await updatePicksByUserId(userId, mergedPicks)
  return { picks }
}

export default function AwardPickerPage() {
  const { awardName, nominees, currentPick } = useLoaderData<typeof loader>()
  const formRef = useRef<HTMLFormElement>(null)
  const fetcher = useFetcher({ key: awardName })

  return (
    <fetcher.Form method="POST" ref={formRef} className="sticky top-6">
      <h3 className="text-xl font-bold ml-4">{awardName}</h3>
      <div className="grid my-4 max-w-fit gap-y-0.5">
        {(nominees ?? []).map((nominee) => (
          <NomineeOption
            key={nominee.title}
            nominee={nominee}
            awardName={awardName}
            isChecked={currentPick === nominee.title}
            onClick={() => fetcher.submit(formRef.current)}
          />
        ))}
      </div>
    </fetcher.Form>
  )
}
