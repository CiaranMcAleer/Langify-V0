// components/profile-page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Trophy, TrendingUp } from "lucide-react"

export default function ProfilePage({ user, onGoBack }: { user: any; onGoBack: () => void }) {
  const pointsToNextLevel = user.level < 10 ? user.level * 100 - user.points : 0
  const nextLevelThreshold = user.level < 10 ? user.level * 100 : null

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-7 w-7" />
          My Profile
        </h1>
        <Button onClick={onGoBack} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-4">
            <User className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">Username</div>
              <div className="text-muted-foreground">{user.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">Total Points</div>
              <div className="text-muted-foreground">{user.points}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
            <div className="grid gap-1">
              <div className="text-lg font-medium">Current Level</div>
              <div className="text-muted-foreground">Level {user.level}</div>
            </div>
          </div>
          {user.level < 10 && (
            <div className="flex items-center gap-4">
              <Trophy className="h-6 w-6 text-muted-foreground" />
              <div className="grid gap-1">
                <div className="text-lg font-medium">Points to Next Level</div>
                <div className="text-muted-foreground">
                  {pointsToNextLevel} points to reach Level {user.level + 1} (at {nextLevelThreshold} points)
                </div>
              </div>
            </div>
          )}
          {user.level === 10 && (
            <div className="flex items-center gap-4">
              <Trophy className="h-6 w-6 text-muted-foreground" />
              <div className="grid gap-1">
                <div className="text-lg font-medium">Max Level Achieved!</div>
                <div className="text-muted-foreground">You are at the highest level. Keep earning points!</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
