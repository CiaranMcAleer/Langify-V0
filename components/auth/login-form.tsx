// components/auth/login-form.tsx
"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/actions/auth"
import { useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

export default function LoginForm({
  onLoginSuccess,
  onSwitchToRegister,
}: { onLoginSuccess: (user: any) => void; onSwitchToRegister: () => void }) {
  const [state, formAction, isPending] = useActionState(login, null)
  const { t } = useLanguage()

  useEffect(() => {
    if (state?.success && state.user) {
      onLoginSuccess(state.user)
    }
  }, [state, onLoginSuccess])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("loginToLangify")}</CardTitle>
        <CardDescription>{t("enterCredentials")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">{t("username")}</Label>
            <Input id="username" name="username" type="text" placeholder="john.doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("loggingIn") : t("login")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {t("noAccount")}{" "}
          <Button variant="link" onClick={onSwitchToRegister} className="p-0 h-auto">
            {t("register")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
