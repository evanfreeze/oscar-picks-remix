import { AwardPick, AwardsData, UserPick } from "../types"
import awardsData from "./2024-awards-data.json"
import { CURRENT_YEAR } from "./constants"

export function mergePicks(
  oldPicks: Array<AwardPick>,
  newPicks: Array<AwardPick>,
) {
  const map = new Map<string, string>()

  oldPicks.forEach((value) => {
    map.set(...encodePick(value))
  })

  newPicks.forEach((value) => {
    map.set(...encodePick(value))
  })

  const mergedPicks: Array<AwardPick> = []

  map.forEach((value, key) => {
    mergedPicks.push(decodePick(key, value))
  })

  return mergedPicks
}

function encodePick(awardPick: AwardPick): [string, string] {
  const key = awardPick.year + "_" + awardPick.awardName
  return [key, awardPick.pick]
}

function decodePick(key: string, pick: string) {
  const [year, awardName] = key.split("_")
  return { year, awardName, pick } as AwardPick
}

export function slugifyAwardName(awardName: string) {
  return awardName
    .toLowerCase()
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll(" ", "-")
}

export function createBuildAwardsNavigationListFunction(
  awardsData: AwardsData,
) {
  return (picks: UserPick | undefined) => {
    return Array.from(Object.keys(awardsData)).map((awardName) => ({
      awardName,
      isPicked: Boolean(
        (picks?.picks ?? []).find(
          (pick) => pick.awardName === awardName && pick.year === CURRENT_YEAR,
        ),
      ),
      awardSlug: slugifyAwardName(awardName),
    }))
  }
}
export const buildAwardsNavigationList =
  createBuildAwardsNavigationListFunction(awardsData)

export function createBuildAwardDetailsDataFunction(awardsData: AwardsData) {
  return (awardNameParam: string | undefined, picks: UserPick | undefined) => {
    const [awardName, nominees] = Array.from(Object.entries(awardsData)).find(
      ([awardName]) => slugifyAwardName(awardName) === awardNameParam,
    ) ?? ["", []]

    const { pick: currentPick } =
      (picks?.picks ?? []).find((pick) => pick.awardName === awardName) ?? {}

    return { awardName, nominees, currentPick }
  }
}
export const buildAwardDetailsData =
  createBuildAwardDetailsDataFunction(awardsData)
