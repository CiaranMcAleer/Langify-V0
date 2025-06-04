// components/dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getLanguages, getLessons, getUserProgress, markLessonAsCompleteDev } from "@/actions/app" // Import new action
import { Trophy, BookOpen, User, CheckCircle, Flame } from "lucide-react" // Import Settings icon
import Image from "next/image"
import ThemeSwitcher from "@/components/theme-switcher"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast" // For notifications

export default function Dashboard({
  user,
  onStartLesson,
  onShowLeaderboard,
  onShowProfile,
  onLogout,
  isDevMode, // New prop
  onShowSettings, // New prop
}: {
  user: any
  onStartLesson: (lessonId: string, timerDurationSeconds: number) => void
  onShowLeaderboard: () => void
  onShowProfile: () => void
  onLogout: () => void
  isDevMode: boolean // New prop
  onShowSettings: () => void // New prop
}) {
  const [languages, setLanguages] = useState<any[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("lang-1") // Default to Italian
  const [lessons, setLessons] = useState<any[]>([])
  const [userLessonProgress, setUserLessonProgress] = useState<any>({}) // { lessonId: { completed: boolean, score: number } }
  const { t } = useLanguage() // Removed currentLanguage, setLanguage, availableLanguages
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    const fetchedLanguages = await getLanguages()
    setLanguages(fetchedLanguages)
    const fetchedLessons = await getLessons(selectedLanguage)
    setLessons(fetchedLessons)

    const progress = await getUserProgress(user.id, selectedLanguage)
    const progressMap = progress.reduce((acc: any, item: any) => {
      acc[item.lesson_id] = { completed: item.completed, score: item.score }
      return acc
    }, {})
    setUserLessonProgress(progressMap)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedLanguage, user.id])

  const handleLanguageChange = async (langId: string) => {
    setSelectedLanguage(langId)
  }

  const handleMarkLessonComplete = async (lessonId: string) => {
    if (!isDevMode) return
    await markLessonAsCompleteDev(user.id, lessonId)
    toast({
      title: "Lesson Marked Complete",
      description: `Lesson ${lessonId} marked as complete for ${user.username}.`,
    })
    // Re-fetch data to update UI
    await fetchDashboardData()
  }

  const today = new Date()
  const lastCompletedDate = user.last_lesson_completed_at ? new Date(user.last_lesson_completed_at) : null
  const hasCompletedToday = lastCompletedDate
    ? lastCompletedDate.getDate() === today.getDate() &&
      lastCompletedDate.getMonth() === today.getMonth() &&
      lastCompletedDate.getFullYear() === today.getFullYear()
    : false

  const streakStatusMessage = hasCompletedToday
    ? t("activeStreak")
    : user.current_streak > 0
      ? t("streakReminder")
      : t("streakLost")

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("welcome", { username: user.username })}</h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button onClick={onLogout} variant="outline">
            {t("logout")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalPoints")}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.points}</div>
            <p className="text-xs text-muted-foreground">{t("earnMorePoints")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("currentLevel")}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("level")} {user.level}
            </div>
            <p className="text-xs text-muted-foreground">{t("keepLearning")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("streak")}</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.current_streak} {t("days")}
            </div>
            <p className="text-xs text-muted-foreground">{streakStatusMessage}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("chooseLanguage")}</CardTitle>
          <CardDescription>{t("selectLanguage")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang: any) => (
                <SelectItem key={lang.id} value={lang.id}>
                  <div className="flex items-center gap-2">
                    <Image src={lang.flag_url || "/placeholder.svg"} alt={`${lang.name} flag`} width={24} height={24} />
                    {lang.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {t("lessons")} (
        {languages.find((l) => l.id === selectedLanguage)?.name && (
          <Image
            src={languages.find((l) => l.id === selectedLanguage)?.flag_url || "/placeholder.svg"}
            alt={`${languages.find((l) => l.id === selectedLanguage)?.name} flag`}
            width={24}
            height={24}
          />
        )}
        {languages.find((l) => l.id === selectedLanguage)?.name})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson: any) => {
          const progress = userLessonProgress[lesson.id]
          const isCompleted = progress?.completed
          return (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {lesson.title}
                  </div>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={isCompleted}
                  onClick={() => onStartLesson(lesson.id, lesson.timer_duration_seconds)}
                >
                  {isCompleted ? t("completed") : t("startLesson")}
                </Button>
                {isDevMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkLessonComplete(lesson.id)}
                    disabled={isCompleted}
                  >
                    {t("markLessonComplete")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("actions")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button onClick={onShowLeaderboard} className="w-full">
            {t("viewLeaderboard")}
          </Button>
          <Button onClick={onShowProfile} className="w-full" variant="secondary">
            {t("viewProfile")}
          </Button>
          <Button onClick={onShowSettings} className="w-full" variant="outline">
            {t("settings")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
