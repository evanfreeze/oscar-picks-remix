import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import {
  Link,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
} from "@remix-run/react"
import { useRef } from "react"
import NomineeOption from "~/components/NomineeOption"
import { updatePicksByUserId } from "~/db/fauna.server"
import {
  blockIfAwardsHaveStarted,
  buildAwardDetailsData,
} from "~/utils/helpers"
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
  // blockIfAwardsHaveStarted(Date.now())
  blockIfAwardsHaveStarted(new Date("2024-03-10T23:00:01").getTime())
  const userId = await requireUserId(args)
  const mergedPicks = await buildMergedPicks(args, userId)
  const picks = await updatePicksByUserId(userId, mergedPicks)
  return { picks }
}

export default function AwardPickerPage() {
  const { awardName, nominees, currentPick } = useLoaderData<typeof loader>()
  const formRef = useRef<HTMLFormElement>(null)
  const fetcher = useFetcher({ key: awardName })
  const navigation = useNavigation()
  const isNavigating = navigation.state !== "idle"

  return (
    <fetcher.Form
      method="POST"
      ref={formRef}
      className={`sticky top-6 ${isNavigating ? "opacity-30" : ""}`}
    >
      <h3 className="text-xl font-bold md:ml-4 text-center md:text-left">
        {awardName}
      </h3>
      <div className="grid my-4 w-full md:max-w-fit gap-y-0.5">
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

export function ErrorBoundary() {
  const error = useRouteError()
  const location = useLocation()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="mb-4">{error.message}</p>
        <Link className="underline" to={location.pathname}>
          View your pick for this award
        </Link>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}
