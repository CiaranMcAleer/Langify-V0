// components/auth/register-form.tsx
"use client"

import type React from "react"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/actions/auth"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterForm({
  onRegisterSuccess,
  onSwitchToLogin,
}: { onRegisterSuccess: (user: any) => void; onSwitchToLogin: () => void }) {
  const [state, formAction, isPending] = useActionState(register, null)
  const { t, availableLanguages, currentLanguage } = useLanguage()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [selectedUiLanguage, setSelectedUiLanguage] = useState(currentLanguage)

  useEffect(() => {
    if (state?.success && state.user) {
      onRegisterSuccess(state.user)
    }
  }, [state, onRegisterSuccess])

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch"))
    } else {
      setPasswordError(null)
    }
  }, [password, confirmPassword, t])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch"))
      return
    }
    const formData = new FormData(event.currentTarget)
    formData.append("uiLanguage", selectedUiLanguage) // Append selected UI language
    formAction(formData)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("registerForLangify")}</CardTitle>
        <CardDescription>{t("createAccount")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">{t("username")}</Label>
            <Input id="username" name="username" type="text" placeholder="john.doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ui-language-select">{t("selectYourUiLanguage")}</Label>
            <Select value={selectedUiLanguage} onValueChange={setSelectedUiLanguage}>
              <SelectTrigger id="ui-language-select">
                <SelectValue placeholder={t("selectUiLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
          <Button type="submit" className="w-full" disabled={isPending || !!passwordError}>
            {isPending ? t("registering") : t("register")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {t("alreadyAccount")}{" "}
          <Button variant="link" onClick={onSwitchToLogin} className="p-0 h-auto">
            {t("login")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
