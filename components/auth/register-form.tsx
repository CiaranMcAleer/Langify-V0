// components/auth/register-form.tsx
"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/actions/auth"
import { useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

export default function RegisterForm({
  onRegisterSuccess,
  onSwitchToLogin,
}: { onRegisterSuccess: (user: any) => void; onSwitchToLogin: () => void }) {
  const [state, formAction, isPending] = useActionState(register, null)
  const { t } = useLanguage()

  useEffect(() => {
    if (state?.success && state.user) {
      onRegisterSuccess(state.user)
    }
  }, [state, onRegisterSuccess])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("registerForLangify")}</CardTitle>
        <CardDescription>{t("createAccount")}</CardDescription>
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
