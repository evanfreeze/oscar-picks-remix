import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import { getUserById } from "~/db/clerk.server"
import { fetchThisYearsWinners, requireUserId } from "~/utils/helpers.server"
import awardsData from "~/utils/2024-awards-data.json"
import { Form, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { setAwardWinner, setCurrentAward } from "~/db/fauna.server"
import { CURRENT_YEAR } from "~/utils/constants"

export async function loader(args: LoaderFunctionArgs) {
  const userId = await requireUserId(args)
  const user = await getUserById(userId)
  if (!user.privateMetadata["isAdmin"]) {
    throw redirect("/")
  }

  const awardNames = Object.keys(awardsData) as Array<keyof typeof awardsData>
  const awardWinners = await fetchThisYearsWinners()

  return { awardNames, awardsData, awardWinners }
}

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.formData()
  const action = formData.get("_action")
  const currentAward = formData.get("currentAward")
    ? (String(formData.get("currentAward")) as keyof typeof awardsData)
    : undefined
  const winner = formData.get("winner")
    ? String(formData.get("winner"))
    : undefined

  if (!currentAward)
    throw new Error(
      "No current award when trying to run admin action: " + action,
    )

  switch (action) {
    case "setCurrentAward": {
      const updatedAwards = await setCurrentAward(CURRENT_YEAR, currentAward)
      return updatedAwards
    }
    case "setWinner": {
      if (!winner) throw new Error("No winner found when trying to set winner")
      const updatedAwards = await setAwardWinner(
        CURRENT_YEAR,
        currentAward,
        winner,
      )
      return updatedAwards
    }
    default: {
      throw new Error("Unknown action")
    }
  }
}

export default function AdminPage() {
  const { awardNames, awardWinners } = useLoaderData<typeof loader>()
  const [selectedAward, setSelectedAward] = useState<
    keyof typeof awardsData | ""
  >(awardWinners?.currentAward ?? "")

  const selectedIsCurrent = selectedAward === awardWinners?.currentAward
  const currentAwardWinner = awardWinners?.winners.find(
    (winner) => winner.awardName === awardWinners.currentAward,
  )

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Admin Page</h1>
      <div className="grid sm:grid-cols-2 mb-6 gap-3">
        <div className="bg-gray-200 p-2 px-3 sm:p-4 rounded-xl">
          <p className="uppercase text-xs text-black/50">Current Award</p>
          <p>{awardWinners?.currentAward || "Not selected"}</p>
        </div>
        <div className="bg-gray-200 p-2 px-3 sm:p-4 rounded-xl">
          <p className="uppercase text-xs text-black/50">Winner</p>
          <p>
            {awardWinners?.winners.find(
              (winner) => awardWinners.currentAward === winner.awardName,
            )?.winner ?? "Not selected"}
          </p>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-2">Choose an award</h2>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-start mb-6">
        <select
          value={selectedAward}
          onChange={(e) =>
            setSelectedAward(e.target.value as keyof typeof awardsData)
          }
        >
          <option disabled value="">
            Select an award
          </option>
          {awardNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <Form method="POST">
          <input type="hidden" name="currentAward" value={selectedAward} />
          <button
            disabled={selectedIsCurrent}
            name="_action"
            value="setCurrentAward"
            className={`w-full text-sm px-3 py-1.5 bg-gray-300 rounded-xl ${selectedIsCurrent ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {selectedIsCurrent ? "Current" : "Mark as current"}
          </button>
        </Form>
      </div>
      <h2 className="text-lg font-semibold mb-2">Choose the winner</h2>
      <ul className="divide-y">
        {awardWinners?.currentAward === selectedAward &&
        selectedAward &&
        awardsData[selectedAward].length
          ? awardsData[selectedAward].map((nominee) => {
              const isSelected = nominee.title === currentAwardWinner?.winner
              return (
                <li key={nominee.title}>
                  <Form
                    method="POST"
                    className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 py-3"
                  >
                    <div>
                      <p className="font-semibold">{nominee.title}</p>
                      <p className="text-sm text-black/50">
                        {nominee.subtitle}
                      </p>
                    </div>
                    <input type="hidden" name="winner" value={nominee.title} />
                    <input
                      type="hidden"
                      name="currentAward"
                      value={awardWinners?.currentAward}
                    />
                    <button
                      disabled={isSelected}
                      name="_action"
                      value="setWinner"
                      className={`text-sm px-3 py-1.5 bg-gray-300 rounded-xl ${isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isSelected ? "Winner" : "Mark as winner"}
                    </button>
                  </Form>
                </li>
              )
            })
          : null}
      </ul>
    </div>
  )
}
