import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/hooks/use-toast"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Use "dark" as the default theme.
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const { toast } = useToast()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    // Always force the dark theme.
    root.classList.add("dark")
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== "dark") {
      toast({
        title: "Coming soon",
        description: "This theme is coming soon.",
      })
      return
    }
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
