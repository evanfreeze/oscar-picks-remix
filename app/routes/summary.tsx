/* eslint-disable react/no-unescaped-entities */
import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { buildAwardsNavigationList } from "~/utils/helpers"
import { fetchUsersPicks, requireUserId } from "~/utils/helpers.server"

export async function loader(args: LoaderFunctionArgs) {
  const userId = await requireUserId(args)
  const rawPicks = await fetchUsersPicks(userId)
  const navData = buildAwardsNavigationList(rawPicks)
  const picks = (rawPicks?.picks ?? []).sort((a, b) => {
    if (a.awardName > b.awardName) return 1
    if (a.awardName < b.awardName) return -1
    return 0
  })

  return { picks, navData }
}

export default function SummaryPage() {
  const { picks, navData } = useLoaderData<typeof loader>()

  return (
    <>
      <h2 className="text-xl font-bold mb-1 text-center md:text-left">
        Summary
      </h2>
      {picks.length ? (
        <div className="divide-y">
          {picks.map((pick) => (
            <dl key={pick.awardName} className="grid grid-cols-5 py-1.5">
              <dt className="font-medium col-span-5 sm:col-span-2">
                {pick.awardName}
              </dt>
              <dd className="text-gray-500 col-span-4 sm:col-span-2">
                {pick.pick}
              </dd>
              <Link
                to={`/picks/${
                  navData.find((nd) => nd.awardName === pick.awardName)
                    ?.awardSlug ?? ""
                }`}
                className="place-self-end"
                aria-label="Edit"
              >
                📝
              </Link>
            </dl>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You haven't made any picks yet</p>
      )}
    </>
  )
}
