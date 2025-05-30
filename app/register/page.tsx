"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowRight, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await register(formData)

      if (result.success) {
        // Redirect to login page with a success message
        router.push("/login?registered=true")
      } else {
        setError(result.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md overflow-hidden border-none shadow-xl">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <UserPlus className="h-6 w-6" />
            MOHSTORE
          </div>
          <p className="mt-2 text-sm opacity-90">Create a new account to get started</p>
        </div>

        <CardContent className="p-6 pt-8">
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input id="username" name="username" placeholder="johndoe" className="h-11" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" className="h-11" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" className="h-11" required />
              <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="+1234567890"
                className="h-11"
                required
              />
              <p className="text-xs text-gray-500">Enter your WhatsApp number with country code</p>
            </div>

            <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t bg-gray-50 p-6">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-600">Already have an account?</span>
            <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Sign in
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
