// components/dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getLanguages, getLessons, getUserProgress } from "@/actions/app"
import { Trophy, BookOpen, User, CheckCircle } from "lucide-react"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ThemeSwitcher from "@/components/theme-switcher" // Declare the ThemeSwitcher variable

export default function Dashboard({
  user,
  onStartLesson,
  onShowLeaderboard,
  onShowProfile,
  onLogout,
  lessonTimerEnabled,
  onToggleLessonTimer,
}: {
  user: any
  onStartLesson: (lessonId: string) => void
  onShowLeaderboard: () => void
  onShowProfile: () => void
  onLogout: () => void
  lessonTimerEnabled: boolean
  onToggleLessonTimer: () => void
}) {
  const [languages, setLanguages] = useState<any[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("lang-1") // Default to Italian
  const [lessons, setLessons] = useState<any[]>([])
  const [userLessonProgress, setUserLessonProgress] = useState<any>({}) // { lessonId: { completed: boolean, score: number } }

  useEffect(() => {
    async function fetchData() {
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
    fetchData()
  }, [selectedLanguage, user.id])

  const handleLanguageChange = async (langId: string) => {
    setSelectedLanguage(langId)
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.points}</div>
            <p className="text-xs text-muted-foreground">Earn more points by completing lessons!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {user.level}</div>
            <p className="text-xs text-muted-foreground">Keep learning to level up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button onClick={onShowLeaderboard} className="w-full">
              View Leaderboard
            </Button>
            <Button onClick={onShowProfile} className="w-full" variant="secondary">
              View Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Choose a Language</CardTitle>
          <CardDescription>Select the language you want to learn.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a language" />
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
          <div className="flex items-center space-x-2 ml-auto">
            <Switch id="lesson-timer" checked={lessonTimerEnabled} onCheckedChange={onToggleLessonTimer} />
            <Label htmlFor="lesson-timer">Lesson Timer</Label>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Lessons (
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
            <Card
              key={lesson.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onStartLesson(lesson.id)}
            >
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
              <CardContent>
                <Button className="w-full" disabled={isCompleted}>
                  {isCompleted ? "Completed" : "Start Lesson"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
