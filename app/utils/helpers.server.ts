import { getAuth } from "@clerk/remix/ssr.server"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node"
import {
  createUserPicksForUserId,
  getAwardWinnersByYear,
  getUserPicksByUserId,
} from "~/db/mongodb.server"
import { AwardPick } from "../types"
import { CURRENT_YEAR } from "./constants"
import { mergePicks } from "./helpers"

export async function requireUserId(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    throw redirect(`/sign-in?redirect_url=${args.request.url}`)
  }
  return userId
}

export async function fetchUsersPicksForYear(
  userId: string,
  year = CURRENT_YEAR,
) {
  let userPicks = await getUserPicksByUserId(userId)

  if (!userPicks) {
    userPicks = await createUserPicksForUserId(userId)
    if (!userPicks) {
      throw new Error(`Failed to create UserPicks when fetching: ${userId}`)
    }
  }

  return {
    ...userPicks,
    picks: userPicks?.picks.filter((p) => p.year === year) ?? [],
  }
}

export async function buildMergedPicks(
  args: ActionFunctionArgs,
  userId: string,
) {
  const formData = await args.request.formData()
  const [submission] = Array.from(formData)
  const newPick: AwardPick = {
    awardName: String(submission[0]) as AwardPick["awardName"],
    pick: String(submission[1]),
    year: CURRENT_YEAR,
  }
  const existingPicks = await getUserPicksByUserId(userId)
  const mergedPicks = mergePicks(existingPicks?.picks ?? [], [newPick])
  return mergedPicks
}

export async function fetchThisYearsWinners() {
  const winners = await getAwardWinnersByYear(CURRENT_YEAR)
  return winners
}
