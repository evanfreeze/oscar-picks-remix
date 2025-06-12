import awardsData from "./utils/2025-awards-data.json"

export type Year = "2023" | "2024" | "2025"

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

export type AwardWinner = {
  year: Year
  currentAward: keyof typeof awardsData | ""
  winners: Array<Winner>
}

type Winner = {
  awardName: keyof typeof awardsData
  winner: string
}

type Test = { hey: string }
