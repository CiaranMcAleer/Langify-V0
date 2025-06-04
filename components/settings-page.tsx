// components/settings-page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Lock, Trash2, RotateCcw } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { changePassword, deleteAccount } from "@/actions/auth"
import { resetUserProgress, updateUserUiLanguage } from "@/actions/app"

export default function SettingsPage({
  user,
  onGoBack,
  onUserUpdate, // To update user state in parent (e.g., after password change, language change)
  onAccountDeleted, // To log out user after account deletion
}: {
  user: any
  onGoBack: () => void
  onUserUpdate: (updatedUser: any) => void
  onAccountDeleted: () => void
}) {
  const { t, currentLanguage, setLanguage, availableLanguages } = useLanguage()
  const { toast } = useToast()

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Reset Progress State
  const [resetUsername, setResetUsername] = useState("")
  const [resetPassword, setResetPassword] = useState("")
  const [isResettingProgress, setIsResettingProgress] = useState(false)

  // Delete Account State
  const [deleteUsername, setDeleteUsername] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setPasswordChangeError(t("passwordMismatch"))
    } else {
      setPasswordChangeError(null)
    }
  }, [newPassword, confirmNewPassword, t])

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError(t("passwordMismatch"))
      return
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError("All password fields are required.")
      return
    }

    setIsChangingPassword(true)
    const result = await changePassword(user.id, currentPassword, newPassword)
    setIsChangingPassword(false)

    if (result.success) {
      toast({ title: t("passwordChanged") })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setPasswordChangeError(null)
    } else {
      setPasswordChangeError(result.message)
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handleResetProgress = async () => {
    if (!resetUsername || !resetPassword) {
      toast({
        title: "Error",
        description: "Username and password are required to reset progress.",
        variant: "destructive",
      })
      return
    }

    setIsResettingProgress(true)
    const result = await resetUserProgress(user.id, resetUsername, resetPassword)
    setIsResettingProgress(false)

    if (result.success) {
      toast({ title: t("progressReset") })
      onUserUpdate(result.user) // Update user state in parent
      setResetUsername("")
      setResetPassword("")
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteUsername || !deletePassword) {
      toast({
        title: "Error",
        description: "Username and password are required to delete account.",
        variant: "destructive",
      })
      return
    }

    setIsDeletingAccount(true)
    const result = await deleteAccount(user.id, deleteUsername, deletePassword)
    setIsDeletingAccount(false)

    if (result.success) {
      toast({ title: t("accountDeleted") })
      onAccountDeleted() // Log out user
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handleUiLanguageChange = async (langCode: string) => {
    setLanguage(langCode) // Update context immediately for UI change
    const result = await updateUserUiLanguage(user.id, langCode) // Persist to DB
    if (result.success) {
      onUserUpdate(result.user) // Update user object in parent with new ui_language
      toast({ title: "UI Language Updated", description: `UI language set to ${langCode.toUpperCase()}.` })
    } else {
      toast({ title: "Error", description: "Failed to save UI language preference.", variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7" />
          {t("settings")}
        </h1>
        <Button onClick={onGoBack} variant="outline">
          {t("backToDashboard")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("uiLanguage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="ui-language-select">{t("selectUiLanguage")}</Label>
          <Select value={currentLanguage} onValueChange={handleUiLanguageChange}>
            <SelectTrigger id="ui-language-select" className="w-[180px]">
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
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> {t("changePassword")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">{t("currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-new-password">{t("confirmNewPassword")}</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
            {passwordChangeError && <p className="text-sm text-red-500">{passwordChangeError}</p>}
          </div>
          <Button onClick={handlePasswordChange} disabled={isChangingPassword || !!passwordChangeError}>
            {isChangingPassword ? "Changing..." : t("changePassword")}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <RotateCcw className="h-5 w-5" /> {t("resetAllProgress")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("resetProgressWarning")}</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-username">{t("username")}</Label>
            <Input
              id="reset-username"
              type="text"
              placeholder={t("typeUsername")}
              value={resetUsername}
              onChange={(e) => setResetUsername(e.target.value)}
              disabled={isResettingProgress}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reset-password">{t("password")}</Label>
            <Input
              id="reset-password"
              type="password"
              placeholder={t("typePassword")}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              disabled={isResettingProgress}
            />
          </div>
          <Button onClick={handleResetProgress} variant="destructive" disabled={isResettingProgress}>
            {isResettingProgress ? "Resetting..." : t("resetAllProgress")}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" /> {t("deleteAccount")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("deleteAccountWarning")}</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="delete-username">{t("username")}</Label>
            <Input
              id="delete-username"
              type="text"
              placeholder={t("typeUsername")}
              value={deleteUsername}
              onChange={(e) => setDeleteUsername(e.target.value)}
              disabled={isDeletingAccount}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delete-password">{t("password")}</Label>
            <Input
              id="delete-password"
              type="password"
              placeholder={t("typePassword")}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={isDeletingAccount}
            />
          </div>
          <Button onClick={handleDeleteAccount} variant="destructive" disabled={isDeletingAccount}>
            {isDeletingAccount ? "Deleting..." : t("confirmDelete")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
