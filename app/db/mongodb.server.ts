import { MongoClient, ServerApiVersion } from "mongodb"
import { AwardPick, AwardWinner, UserPick } from "~/types"

const Database = "OscarPicks"
enum Collection {
  AwardWinners = "AwardWinners",
  UserPicks = "UserPicks",
}

function createMongoClient() {
  const url = process.env.MONGODB_ATLAS_URL

  if (!url) throw new Error("Must provide MONGODB_ATLAS_URL in .env")

  return new MongoClient(url, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })
}

export async function getUserPicksByUserId(userId: string) {
  const client = createMongoClient()

  try {
    await client.connect()
    const userPicksCollection = client
      .db(Database)
      .collection(Collection.UserPicks)
    const response = (await userPicksCollection.findOne({
      userId,
    })) as UserPick | null
    return response
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
  return null
}

export async function createUserPicksForUserId(userId: string) {
  const client = createMongoClient()

  try {
    await client.connect()
    const userPicksCollection = client
      .db(Database)
      .collection(Collection.UserPicks)
    const response = await userPicksCollection.insertOne({ userId })
    if (response.insertedId) {
      const picks = (await userPicksCollection.findOne({
        _id: response.insertedId,
      })) as UserPick | null
      return picks
    } else {
      throw new Error(`Failed to insert new UserPick: ${{ userId, response }}`)
    }
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
  return null
}

export async function updatePicksByUserId(
  userId: string,
  picks: Array<AwardPick>,
) {
  const client = createMongoClient()

  try {
    await client.connect()
    const userPicksCollection = client
      .db(Database)
      .collection(Collection.UserPicks)
    const response = await userPicksCollection.findOneAndUpdate(
      { userId },
      { $set: { picks } },
      { upsert: false },
    )
    if (response?._id) {
      const picks = (await userPicksCollection.findOne({
        _id: response._id,
      })) as UserPick | null
      return picks
    } else {
      throw new Error(`Failed to update UserPick: ${{ userId }}`)
    }
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
  return null
}

export async function getAwardWinnersByYear(year: string) {
  const client = createMongoClient()

  try {
    await client.connect()
    const awardWinnersCollection = client
      .db(Database)
      .collection(Collection.AwardWinners)
    const response = (await awardWinnersCollection.findOne({
      year,
    })) as AwardWinner | null
    return response
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
  return null
}

export async function setCurrentAward(year: string, currentAward: string) {
  const client = createMongoClient()

  try {
    await client.connect()
    const awardWinnersCollection = client
      .db(Database)
      .collection(Collection.AwardWinners)
    const response = await awardWinnersCollection.findOneAndUpdate(
      { year },
      { $set: { currentAward } },
      { upsert: false },
    )
    if (response?._id) {
      const updatedAwards = await awardWinnersCollection.findOne({
        _id: response._id,
      })
      return updatedAwards as AwardWinner | null
    }
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
  return null
}

export async function setAwardWinner(
  year: string,
  awardName: AwardWinner["winners"][0]["awardName"],
  winner: string,
) {
  const client = createMongoClient()

  try {
    await client.connect()
    const awardWinnersCollection = client
      .db(Database)
      .collection(Collection.AwardWinners)
    const response = (await awardWinnersCollection.findOne({
      year,
    })) as AwardWinner | null
    if (!response) {
      throw new Error("No data found for current year's award winners")
    }

    const newWinner = { awardName, winner }
    const { winners } = response
    const indexToUpdate = winners.findIndex(
      (winner) => winner.awardName === awardName,
    )

    if (indexToUpdate > -1) {
      winners[indexToUpdate] = newWinner
    } else {
      winners.push(newWinner)
    }

    const updated = await awardWinnersCollection.findOneAndUpdate(
      { year },
      { $set: { winners } },
      { upsert: false },
    )
    if (updated?._id) {
      const updatedAwards = await awardWinnersCollection.findOne({
        _id: updated._id,
      })
      return updatedAwards as AwardWinner | null
    }
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
  return null
}
