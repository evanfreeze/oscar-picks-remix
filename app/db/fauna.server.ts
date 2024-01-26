import { Client, fql, FaunaError } from "fauna"
import { AwardPick, UserPick } from "~/types"

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
