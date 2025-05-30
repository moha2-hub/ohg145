"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageToggle } from "@/components/language-toggle"
import { translations } from "@/lib/translations"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<"ar" | "en">("ar")

  useEffect(() => {
    // Get initial language
    const savedLanguage = (localStorage.getItem("language") as "ar" | "en") || "ar"
    setLanguage(savedLanguage)

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const t = (key: string) => {
    return translations[language]?.[key as keyof (typeof translations)[typeof language]] || key
  }

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const registered = searchParams.get("registered") === "true"

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(formData)

      if (result.success) {
        const role = result.user.role
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "customer") {
          router.push("/customer")
        } else if (role === "seller") {
          router.push("/seller")
        } else {
          router.push("/")
        }
      } else {
        setError(result.message || (language === "ar" ? "فشل في تسجيل الدخول" : "Login failed"))
      }
    } catch (err) {
      setError(language === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t("mohstore")}</CardTitle>
          <CardDescription className="text-center">{t("loginToAccount")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

            {registered && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
                {language === "ar"
                  ? "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول."
                  : "Account created successfully! You can now log in."}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("loading") : t("signIn")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {t("dontHaveAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("register")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
