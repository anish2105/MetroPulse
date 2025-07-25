import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/ui/theme-provider"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-mode"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      {/* <Label htmlFor="theme-mode" className="cursor-pointer">
        {theme === "dark" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Label> */}
    </div>
  )
}