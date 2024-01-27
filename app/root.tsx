import { ClerkApp, ClerkErrorBoundary, UserButton } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import type { LinksFunction, LoaderFunction } from "@remix-run/node"
import { Links, LiveReload, Outlet, Scripts } from "@remix-run/react"
import styles from "./tailwind.css"

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }]

export const loader: LoaderFunction = (args) => rootAuthLoader(args)

export const ErrorBoundary = ClerkErrorBoundary()

function App() {
  return (
    <html className="bg-gray-100" lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Oscar Picks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Links />
      </head>
      <body className="max-w-screen-lg mx-auto py-6 px-12">
        <header className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Oscar Picks 2024</h1>
          <UserButton />
        </header>
        <main>
          <Outlet />
        </main>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default ClerkApp(App)
