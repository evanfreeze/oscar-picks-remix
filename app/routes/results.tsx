import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useRevalidator } from "@remix-run/react"
import { useEffect } from "react"
import awardsData from "~/utils/2024-awards-data.json"
import {
  requireUserId,
  fetchUsersPicks,
  fetchThisYearsWinners,
} from "~/utils/helpers.server"

export async function loader(args: LoaderFunctionArgs) {
  const userId = await requireUserId(args)
  const rawPicks = await fetchUsersPicks(userId)
  const rawWinners = await fetchThisYearsWinners()

  if (!rawPicks) throw redirect("/picks")
  if (!rawWinners) throw new Error("Failed to load award results")

  const allAwardNames = Object.keys(awardsData) as Array<
    keyof typeof awardsData
  >
  const presentedAwardNames = rawWinners.winners.map(
    (winner) => winner.awardName,
  )

  const awarded = rawWinners.winners.map((winner) => {
    const pick = rawPicks.picks.find(
      (pick) => pick.awardName === winner.awardName,
    )
    return {
      awardName: winner.awardName,
      yourPick: pick?.pick ?? "You didn't pick this award",
      winner: winner.winner,
      isCorrect: pick?.pick === winner.winner,
    }
  })

  const notYetAwarded = allAwardNames
    .filter((awardName) => {
      return !presentedAwardNames.includes(awardName)
    })
    .map((awardName) => {
      const pick = rawPicks.picks.find((pick) => pick.awardName === awardName)
      return {
        awardName,
        yourPick: pick?.pick ?? "You didn't pick this award",
        winner: "Not yet awarded",
        isCorrect: null,
      }
    })

  const numberCorrect = awarded.filter((award) => award.isCorrect).length
  const numberAwarded = awarded.length
  const percentageCorrect = Math.round((numberCorrect / numberAwarded) * 100)
  const percent = isNaN(percentageCorrect) ? "" : ` (${percentageCorrect}%)`
  const score = `${numberCorrect} of ${numberAwarded} correct ${percent}`

  return { awarded, notYetAwarded, score }
}

export default function ResultsPage() {
  const { awarded, notYetAwarded, score } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate()
    }, 5000)
    return () => clearInterval(interval)
  }, [revalidator])

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Results</h1>
      <div className="flex justify-between items-baseline sticky top-0 bg-gray-100 py-2">
        <h2 className="text-lg font-semibold">Awarded</h2>
        <p className="text-black/50">{score}</p>
      </div>
      <ul className="space-y-1 mb-4">
        {awarded.length > 0 ? (
          awarded.map((result) => (
            <AwardRow key={result.awardName} result={result} />
          ))
        ) : (
          <p className="bg-gray-200 p-4 rounded-xl text-black/50 italic text-center">
            No categories have been awarded
          </p>
        )}
      </ul>
      <div className="flex justify-between items-baseline sticky top-0 bg-gray-100 py-2">
        <h2 className="text-lg font-semibold">Still to come</h2>
        <p className="text-black/50">{notYetAwarded.length} Remaining</p>
      </div>
      <ul className="space-y-1">
        {notYetAwarded.map((result) => (
          <AwardRow key={result.awardName} result={result} />
        ))}
      </ul>
    </div>
  )
}

export function ErrorBoundary() {
  return <p>Failed to load award results</p>
}

type AwardRowProps = {
  result: {
    awardName: string
    yourPick: string
    winner: string
    isCorrect: boolean | null
  }
}

function AwardRow({ result }: AwardRowProps) {
  const icon = result.isCorrect === null ? "" : result.isCorrect ? "✅" : "⛔️"
  return (
    <li className="bg-gray-200 px-4 py-4 sm:py-2 rounded-xl">
      <dl className="grid sm:grid-cols-3 gap-1 sm:gap-3 items-center">
        <div className="flex justify-between items-center">
          <h3 className="text-lg">{result.awardName}</h3>
          <span className="sm:hidden">{icon}</span>
        </div>
        <div>
          <dt className="uppercase text-xs text-black/50">Your Pick</dt>
          <dl className="">{result.yourPick}</dl>
        </div>
        <div className="mt-1 flex justify-between gap-1 items-center">
          <div>
            <dt className="uppercase text-xs text-black/50">Winner</dt>
            <dl
              className={`${result.winner === "Not yet awarded" ? "text-black/50 italic" : ""}`}
            >
              {result.winner}
            </dl>
          </div>
          <span className="hidden sm:block">{icon}</span>
        </div>
      </dl>
    </li>
  )
}
