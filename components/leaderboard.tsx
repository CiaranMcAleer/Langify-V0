// components/leaderboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getLeaderboard } from "@/actions/app"
import { Trophy } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function Leaderboard({ onGoBack }: { onGoBack: () => void }) {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const data = await getLeaderboard()
      setLeaderboardData(data)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>{t("loadingLeaderboard")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-7 w-7" />
          {t("leaderboard")}
        </h1>
        <Button onClick={onGoBack} variant="outline">
          {t("backToDashboard")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("topLearners")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{t("rank")}</TableHead>
                <TableHead>{t("username")}</TableHead>
                <TableHead className="text-right">{t("points")}</TableHead>
                <TableHead className="text-right">{t("level")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {t("noUsersLeaderboard")}
                  </TableCell>
                </TableRow>
              ) : (
                leaderboardData.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell className="text-right">{user.points}</TableCell>
                    <TableCell className="text-right">{user.level}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
