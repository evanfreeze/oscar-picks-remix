import { LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, useFetchers, useLoaderData } from "@remix-run/react"
import AwardPageLink from "~/components/AwardPageLink"
import { buildAwardsNavigationList } from "~/utils/helpers"
import { fetchUsersPicks, requireUserId } from "~/utils/helpers.server"
import { useSelectedAwardSlug } from "~/utils/hooks"

export async function loader(args: LoaderFunctionArgs) {
  const userId = await requireUserId(args)
  const picks = await fetchUsersPicks(userId)
  const navData = buildAwardsNavigationList(picks)
  return { navData }
}

export default function PicksPage() {
  const { navData } = useLoaderData<typeof loader>()
  const selectedAwardSlug = useSelectedAwardSlug()
  const fetchers = useFetchers()

  return (
    <div className="grid grid-cols-[auto_1fr] gap-8">
      <section>
        <h2 className="text-xl font-bold mb-1">Awards</h2>
        <ul className="space-y-1">
          {navData.map((item) => (
            <AwardPageLink
              key={item.awardSlug}
              item={item}
              fetchers={fetchers}
              isActive={selectedAwardSlug === item.awardSlug}
            />
          ))}
        </ul>
      </section>
      <section>
        {selectedAwardSlug ? (
          <Outlet />
        ) : (
          <div className="grid min-h-[60vh] place-content-center text-gray-500">
            <p>No award selected</p>
          </div>
        )}
      </section>
    </div>
  )
}
