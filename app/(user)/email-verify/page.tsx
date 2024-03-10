"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { HTTP_POST, HTTP_POST_PATH } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export default function VerifyEmail() {
  const searchParams = useSearchParams()

  const [result, setResult] = useState<string | undefined>()

  useEffect(() => {
    const emailVerification = async () => {
      const email = searchParams?.get("email")
      const token = searchParams?.get("token")
      if (!email || !token) {
        setResult("Error verifying your email")
        return toast({
          title: "Something went wrong.",
          description: "Your email verification failed. Please try again.",
          variant: "destructive",
        })
      }

      await HTTP_POST(
        HTTP_POST_PATH.emailVerification,
        JSON.stringify({
          email,
          token,
        })
      )

      toast({
        title: "Good news",
        description: "Email verified successfully. Please relogin.",
      })
      window.location.replace("/login")
    }

    emailVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="flex h-screen items-center justify-center flex-col"
      style={{
        backgroundImage:
          "linear-gradient(to right top, #f8f9fa, #e5e8ea, #d2d7db, #bfc6cc, #adb5bd)",
      }}
    >
      <h1 className="font-medium text-3xl">
        {result ? result : "Please wait ..."}
      </h1>
      <div className="mb-4"></div>
    </div>
  )
}