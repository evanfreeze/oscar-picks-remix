import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useRevalidator } from "@remix-run/react"
import { useEffect } from "react"
import { getProdUserById } from "~/db/clerk.server"
import { getUserPicksByUserId } from "~/db/fauna.server"
import { CURRENT_YEAR } from "~/utils/constants"
import { fetchThisYearsWinners, requireUserId } from "~/utils/helpers.server"

export async function loader(args: LoaderFunctionArgs) {
  // redirect anyone who isn't in the family
  const userId = await requireUserId(args)
  const allowedIds = [
    "user_2dJrUAR5YmAAyqzwqtDLWl42Tyt", // Susan
    "user_2cre6K0CUzdpmeeWK9COMFIja9B", // Greg
    "user_2bbaeZNlRyUVzTFJ3KvCJHnKGAI", // Jasmin
    "user_2bTdlSNgTjX7iTE6ODGOSz8VBDy", // Evan
  ]
  const isEvanDev = userId === "user_2arVL40et626Wse6CLl9rkI4CI3"
  if (!allowedIds.includes(userId) && !isEvanDev) {
    throw redirect("/results")
  }

  // get the users and picks for the family
  const users = await Promise.all(allowedIds.map((id) => getProdUserById(id)))
  const picks = await Promise.all(
    allowedIds.map((id) => getUserPicksByUserId(id)),
  )

  // get the current award
  const awardWinners = await fetchThisYearsWinners()
  const currentAwardName = awardWinners?.currentAward ?? ""
  const currentAwardWinner =
    awardWinners?.winners.find(
      (winner) => winner.awardName === currentAwardName,
    )?.winner ?? ""

  // match everything up
  const results = users.map((user) => {
    const userPicks = picks.find((pick) => pick?.userId === user.id)
    if (!userPicks)
      return {
        firstName: user.firstName,
        imageUrl: user.imageUrl,
        pick: "Didn't pick",
        isCorrect: false,
      }

    const pick = userPicks.picks.find(
      (pick) =>
        pick.awardName === currentAwardName && pick.year === CURRENT_YEAR,
    )?.pick

    const currentAwardWinner =
      awardWinners?.winners.find(
        (winner) => winner.awardName === currentAwardName,
      )?.winner ?? "Not yet awarded"

    return {
      firstName: user.firstName,
      imageUrl: user.imageUrl,
      pick,
      isCorrect:
        currentAwardWinner !== "Not yet awarded"
          ? pick === currentAwardWinner
          : null,
    }
  })

  // Leaderboard
  const leaderboard = users
    .map((user) => {
      const userPicks = picks.find((pick) => pick?.userId === user.id)
      if (!userPicks) {
        return {
          firstName: user.firstName,
          imageUrl: user.imageUrl,
          totalCorrect: 0,
        }
      }

      const correctPicks =
        awardWinners?.winners.filter((winner) => {
          const pickForAward = userPicks.picks.find(
            (pick) =>
              pick.awardName === winner.awardName && pick.year === CURRENT_YEAR,
          )
          if (!pickForAward) return false
          return pickForAward.pick === winner.winner
        }) ?? []

      return {
        firstName: user.firstName,
        imageUrl: user.imageUrl,
        totalCorrect: correctPicks.length,
      }
    })
    .sort((a, b) => b.totalCorrect - a.totalCorrect)

  return {
    currentAwardName,
    currentAwardWinner,
    results,
    leaderboard,
  }
}

export default function FreezeFamilyLiveResultsPage() {
  const { currentAwardName, currentAwardWinner, results, leaderboard } =
    useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate()
    }, 5000)
    return () => clearInterval(interval)
  }, [revalidator])

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Freeze Family Live Results</h1>
      <h2 className="text-lg font-semibold mb-2">Current Award</h2>
      <div className="mb-6 bg-gray-200 p-4 rounded-xl flex justify-between">
        {currentAwardName ? (
          <>
            <p className="font-semibold">{currentAwardName}</p>
            <p className={currentAwardWinner ? "" : "italic text-black/40"}>
              {currentAwardWinner || "Not yet awarded"}
            </p>
          </>
        ) : (
          <p className="text-black/40 italic text-center w-full">
            No current award
          </p>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-2">Our Picks</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {results.map((result) => (
          <li
            key={result.firstName}
            className="grid justify-center items-start grid-rows-[auto_1fr_auto] bg-gray-200 p-6 rounded-xl"
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 overflow-hidden justify-self-center rounded-full bg-gray-300 mb-3">
              <img
                className="object-cover"
                src={result.imageUrl}
                width={224}
                height={224}
                alt={result.firstName ?? "Profile"}
              />
            </div>

            <p className="font-semibold mb-1 text-center">
              {result.pick || "—"}
            </p>
            {currentAwardName && (
              <span className="justify-self-center">
                {result.isCorrect === null
                  ? "👀"
                  : result.isCorrect
                    ? "✅"
                    : "⛔️"}
              </span>
            )}
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
      <ul className="space-y-1">
        {leaderboard.map((item) => (
          <li
            key={item.firstName}
            className="grid grid-cols-[auto_auto_1fr] items-center gap-2 bg-gray-200 p-3 py-3 rounded-xl"
          >
            <div className="w-8 h-8 overflow-hidden rounded-full">
              <img
                src={item.imageUrl}
                className="object-cover"
                alt={item.firstName ?? "Profile"}
                width={48}
                height={48}
              />
            </div>
            <p>{item.firstName}</p>
            <p className="justify-self-end">{item.totalCorrect} correct</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
