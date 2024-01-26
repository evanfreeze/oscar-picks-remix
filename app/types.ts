import awardsData from "./utils/2024-awards-data.json"

export type Year = "2023" | "2024"

export type AwardPick = {
  year: Year
  awardName: keyof typeof awardsData
  pick: string
}

export type UserPick = {
  userId: string
  picks: Array<AwardPick>
}

export type Nominee = {
  title: string
  subtitle: string
}

export type AwardsData = Record<keyof typeof awardsData, Array<Nominee>>
