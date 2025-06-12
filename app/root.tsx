import { ClerkApp, ClerkErrorBoundary, UserButton } from "@clerk/remix"
import { rootAuthLoader } from "@clerk/remix/ssr.server"
import type { LinksFunction, LoaderFunction } from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Outlet,
  Scripts,
  useLocation,
} from "@remix-run/react"
import styles from "./tailwind.css?url"
import { ReactNode } from "react"

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
        <header className="flex flex-col gap-2 items-center border-b pb-4 mb-6">
          <div className="w-full flex justify-between items-center gap-1">
            <h1 className="text-2xl font-bold">Oscar Picks 2025</h1>
            <div className="flex gap-5 items-center">
              <div className="hidden sm:block">
                <Navigation />
              </div>
              <UserButton />
            </div>
          </div>
          <div className="sm:hidden w-full border-t flex justify-center pt-4">
            <Navigation />
          </div>
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

type HeaderLinkProps = {
  to: string
  isActive: boolean
  children: ReactNode
}

const HeaderLink = ({ to, isActive, children }: HeaderLinkProps) => {
  return (
    <Link
      to={to}
      className={`px-3 py-1 rounded-md ${isActive ? "bg-gray-300 shadow-inner" : "bg-transparent hover:bg-gray-200"}`}
    >
      {children}
    </Link>
  )
}

const Navigation = () => {
  const location = useLocation()
  return (
    <nav className="flex gap-5 items-center justify-end sm:mr-5">
      <HeaderLink to="/picks" isActive={location.pathname.startsWith("/picks")}>
        Picks
      </HeaderLink>
      <HeaderLink to="/summary" isActive={location.pathname === "/summary"}>
        Summary
      </HeaderLink>
      <HeaderLink to="/results" isActive={location.pathname === "/results"}>
        Results
      </HeaderLink>
    </nav>
  )
}
