// components/dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getLanguages, getLessons } from "@/actions/app"
import { Trophy, BookOpen, User } from "lucide-react"

export default function Dashboard({
  user,
  onStartLesson,
  onShowLeaderboard,
  onLogout,
}: { user: any; onStartLesson: (lessonId: string) => void; onShowLeaderboard: () => void; onLogout: () => void }) {
  const [languages, setLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState("lang-1") // Default to Italian
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    async function fetchData() {
      const fetchedLanguages = await getLanguages()
      setLanguages(fetchedLanguages)
      const fetchedLessons = await getLessons(selectedLanguage)
      setLessons(fetchedLessons)
    }
    fetchData()
  }, [selectedLanguage])

  const handleLanguageChange = async (langId: string) => {
    setSelectedLanguage(langId)
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user.username}!</h1>
        <Button onClick={onLogout} variant="outline">
          Logout
        </Button>
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
            <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={onShowLeaderboard} className="w-full">
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Choose a Language</CardTitle>
          <CardDescription>Select the language you want to learn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang: any) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Lessons ({languages.find((l) => l.id === selectedLanguage)?.name})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson: any) => (
          <Card
            key={lesson.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onStartLesson(lesson.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {lesson.title}
              </CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Lesson</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
