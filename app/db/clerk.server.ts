import { createClerkClient } from "@clerk/remix/api.server"

export function getProdUserById(userId: string) {
  const secretKey = process.env.CLERK_SECRET_KEY?.includes("test")
    ? process.env.CLERK_PROD_SECRET_KEY
    : process.env.CLERK_SECRET_KEY

  const client = createClerkClient({
    secretKey,
  })

  return client.users.getUser(userId)
}

export function getUserById(userId: string) {
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  return client.users.getUser(userId)
}
