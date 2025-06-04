// components/profile-page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Trophy, TrendingUp, Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserHistory } from "@/actions/app"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/contexts/language-context"

export default function ProfilePage({ user, onGoBack }: { user: any; onGoBack: () => void }) {
  const { t } = useLanguage()
  const [historyData, setHistoryData] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      setIsLoadingHistory(true)
      const data = await getUserHistory(user.id)
      // Format data for Recharts: parse timestamp and ensure numeric values
      const formattedData = data.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp).toLocaleDateString(), // Format date for display
        points: Number(entry.points),
        level: Number(entry.level),
      }))
      setHistoryData(formattedData)
      setIsLoadingHistory(false)
    }
    fetchHistory()
  }, [user.id])

  const pointsToNextLevel = user.level < 10 ? user.level * 100 - user.points : 0
  const nextLevelThreshold = user.level < 10 ? user.level * 100 : null

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-7 w-7" />
          {t("myProfile")}
        </h1>
        <Button onClick={onGoBack} variant="outline">
          {t("backToDashboard")}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("userDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <User className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">{t("username")}</div>
              <div className="text-muted-foreground">{user.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">{t("totalPointsProfile")}</div>
              <div className="text-muted-foreground">{user.points}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">{t("currentLevelProfile")}</div>
              <div className="text-muted-foreground">
                {t("level")} {user.level}
              </div>
            </div>
          </div>
          {user.level < 10 && (
            <div className="flex items-center gap-4">
              <Trophy className="h-6 w-6 text-muted-foreground" />
              <div className="grid gap-1">
                <div className="text-lg font-medium">{t("pointsToNextLevel")}</div>
                <div className="text-muted-foreground">
                  {pointsToNextLevel} {t("points")} {t("toReachLevel")} {user.level + 1} ({t("at")} {nextLevelThreshold}{" "}
                  {t("points")})
                </div>
              </div>
            </div>
          )}
          {user.level === 10 && (
            <div className="flex items-center gap-4">
              <Trophy className="h-6 w-6 text-muted-foreground" />
              <div className="grid gap-1">
                <div className="text-lg font-medium">{t("maxLevelAchieved")}</div>
                <div className="text-muted-foreground">{t("highestLevel")}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Flame className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">{t("streak")}</div>
              <div className="text-muted-foreground">
                {user.current_streak} {t("days")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("pointsAndLevelHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-[300px]">
              <p>Loading history...</p>
            </div>
          ) : historyData.length > 1 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={historyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" label={{ value: t("points"), angle: -90, position: "insideLeft" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: t("level"), angle: 90, position: "insideRight" }}
                />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="points" stroke="#8884d8" name={t("points")} />
                <Line yAxisId="right" type="monotone" dataKey="level" stroke="#82ca9d" name={t("level")} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">{t("noHistory")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
