import { LoaderFunction, redirect } from "@remix-run/node"
import { requireUserId } from "~/utils/helpers.server"

export const loader: LoaderFunction = async (args) => {
  const userId = await requireUserId(args)

  if (userId) {
    return redirect("/picks")
  }
}

export default function IndexPage() {
  return <></>
}
