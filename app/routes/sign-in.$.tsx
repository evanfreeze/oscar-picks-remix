import { SignIn } from "@clerk/remix"

export default function SignInPage() {
  return (
    <div className="grid place-content-center min-h-[60vh]">
      <SignIn />
    </div>
  )
}
