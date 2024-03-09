import { Client, fql, FaunaError } from "fauna"
import { AwardPick, AwardWinner, UserPick } from "~/types"

export const getUserPicksByUserId = async (userId: string) => {
  const client = new Client()

  try {
    const query = fql`UserPicks.byUserId(${userId}).first()`
    const response = await client.query<UserPick>(query)
    return response.data
  } catch (error) {
    if (error instanceof FaunaError) {
      console.error("FaunaError — ", error)
    } else {
      console.error("Non-Fauna Error — ", error)
    }
  } finally {
    client.close()
  }
}

export const createUserPicksForUserId = async (userId: string) => {
  const client = new Client()

  try {
    const query = fql`UserPicks.create({ userId: ${userId} })`
    const response = await client.query<UserPick>(query)
    if (response.data) {
      return response.data
    } else {
      throw new Error("Fauna succeeded but no user picks data found")
    }
  } catch (error) {
    if (error instanceof FaunaError) {
      console.error("FaunaError — ", error)
    } else {
      console.error("Non-Fauna Error — ", error)
    }
  } finally {
    client.close()
  }
}

export const updatePicksByUserId = async (
  userId: string,
  picks: Array<AwardPick>,
) => {
  const client = new Client()

  try {
    const query = fql`UserPicks.byUserId(${userId}).first()!.updateData({ picks: ${picks} })`
    const response = await client.query(query)
    if (response.data) {
      return response.data
    } else {
      throw new Error("Fauna succeeded but no data found after updating picks")
    }
  } catch (error) {
    if (error instanceof FaunaError) {
      console.error("FaunaError — ", error)
    } else {
      console.error("Non-Fauna Error — ", error)
    }
  } finally {
    client.close()
  }
}

export const getAwardWinnersByYear = async (year: string) => {
  const client = new Client()

  try {
    const query = fql`AwardWinners.byYear(${year}).first()`
    const response = await client.query<AwardWinner>(query)
    if (response.data) {
      return response.data
    } else {
      throw new Error("No award winners data found for year: " + year)
    }
  } catch (error) {
    if (error instanceof FaunaError) {
      console.error("FaunaError — ", error)
    } else {
      console.error("Non-Fauna Error — ", error)
    }
  } finally {
    client.close()
  }
}

export const setCurrentAward = async (year: string, award: string) => {
  const client = new Client()

  try {
    const query = fql`AwardWinners.byYear(${year}).first()!.updateData({ currentAward: ${award} })`
    const response = await client.query<AwardWinner>(query)
    if (response.data) {
      return response.data
    } else {
      throw new Error(
        "Fauna succeeded but no data found after updating current award",
      )
    }
  } catch (error) {
    if (error instanceof FaunaError) {
      console.error("FaunaError — ", error)
    } else {
      console.error("Non-Fauna Error — ", error)
    }
  } finally {
    client.close()
  }
}

export const setAwardWinner = async (
  year: string,
  awardName: AwardWinner["winners"][0]["awardName"],
  winner: string,
) => {
  const client = new Client()

  console.log(year, awardName, winner)

  try {
    const query = fql`AwardWinners.byYear(${year}).first()`
    const awardWinnersResponse = await client.query<AwardWinner>(query)
    if (!awardWinnersResponse.data) {
      throw new Error(
        "Fauna succeeded but no data found after fetching current year's award winners",
      )
    }

    const newWinner = { awardName, winner }
    const { winners } = awardWinnersResponse.data
    const indexToUpdate = winners.findIndex(
      (winner) => winner.awardName === awardName,
    )

    if (indexToUpdate > -1) {
      winners[indexToUpdate] = newWinner
    } else {
      winners.push(newWinner)
    }

    const updateQuery = fql`AwardWinners.byYear(${year}).first()!.updateData({ winners: ${winners} })`
    const updateResponse = await client.query<AwardWinner>(updateQuery)

    if (updateResponse.data) {
      return updateResponse.data
    } else {
      throw new Error(
        "Fauna succeeded but no data found after updating winners",
      )
    }
  } catch (error) {
    if (error instanceof FaunaError) {
      console.error("FaunaError — ", error)
    } else {
      console.error("Non-Fauna Error — ", error)
    }
  } finally {
    client.close()
  }
}
