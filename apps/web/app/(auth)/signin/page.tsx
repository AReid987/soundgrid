import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SignInForm } from "./signin-form"

export const metadata: Metadata = {
  title: "Sign In - SoundGrid",
  description: "Sign in to your SoundGrid account",
}

export default async function SignInPage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            SoundGrid
          </h1>
          <p className="mt-2 text-text-secondary">
            The commercial operating layer for music professionals
          </p>
        </div>
        
        <div className="bg-surface rounded-lg border border-border-subtle p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">
            Sign in to your account
          </h2>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
