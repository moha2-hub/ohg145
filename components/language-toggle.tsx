"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context" // ✅ Import the context

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = newLanguage

    // Notify other components
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLanguage }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {language === "ar" ? "العربية" : "English"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("ar")}
          className={language === "ar" ? "bg-accent" : ""}
        >
          🇸🇦 العربية
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          🇺🇸 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
