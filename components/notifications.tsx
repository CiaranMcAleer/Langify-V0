// components/notifications.tsx
"use client"

import { useEffect, useState } from "react"
import { getNotifications } from "@/actions/app"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle, CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchNotifications() {
      const fetched = await getNotifications()
      setNotifications(fetched)
      const dismissed = JSON.parse(localStorage.getItem("dismissed_notifications") || "[]")
      setDismissedNotifications(dismissed)
    }
    fetchNotifications()
  }, [])

  const handleDismiss = (id: string) => {
    const updatedDismissed = [...dismissedNotifications, id]
    setDismissedNotifications(updatedDismissed)
    localStorage.setItem("dismissed_notifications", JSON.stringify(updatedDismissed))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "event":
        return <CalendarDays className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getTitle = (type: string) => {
    switch (type) {
      case "event":
        return t("eventNotification")
      case "warning":
        return t("warningNotification")
      case "info":
      default:
        return t("infoNotification")
    }
  }

  const visibleNotifications = notifications.filter((notif) => !dismissedNotifications.includes(notif.id))

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {visibleNotifications.map((notif) => (
        <Alert key={notif.id} className="relative pr-10">
          <div className="flex items-center gap-2">
            {getIcon(notif.type)}
            <AlertTitle>{getTitle(notif.type)}</AlertTitle>
          </div>
          <AlertDescription>{notif.message}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => handleDismiss(notif.id)}
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
