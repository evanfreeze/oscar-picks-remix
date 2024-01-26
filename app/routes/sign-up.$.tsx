import { SignUp } from "@clerk/remix"

export default function SignUpPage() {
  return (
    <div className="grid place-content-center min-h-[60vh]">
      <SignUp />
    </div>
  )
}
