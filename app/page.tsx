// app/page.tsx
"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import Dashboard from "@/components/dashboard"
import LessonPage from "@/components/lesson/lesson-page"
import Leaderboard from "@/components/leaderboard"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentView, setCurrentView] = useState<"login" | "register" | "dashboard" | "lesson" | "leaderboard">("login")
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user)
    setCurrentView("dashboard")
  }

  const handleRegisterSuccess = (user: any) => {
    setCurrentUser(user)
    setCurrentView("dashboard")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView("login")
  }

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId)
    setCurrentView("lesson")
  }

  const handleLessonComplete = (updatedUser: any) => {
    setCurrentUser(updatedUser) // Update user points/level
    setActiveLessonId(null)
    setCurrentView("dashboard")
  }

  const handleShowLeaderboard = () => {
    setCurrentView("leaderboard")
  }

  const handleGoBackToDashboard = () => {
    setCurrentView("dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-950">
      {!currentUser ? (
        currentView === "login" ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView("register")} />
        ) : (
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setCurrentView("login")} />
        )
      ) : currentView === "dashboard" ? (
        <Dashboard
          user={currentUser}
          onStartLesson={handleStartLesson}
          onShowLeaderboard={handleShowLeaderboard}
          onLogout={handleLogout}
        />
      ) : currentView === "lesson" && activeLessonId ? (
        <LessonPage
          user={currentUser}
          lessonId={activeLessonId}
          onLessonComplete={handleLessonComplete}
          onGoBack={handleGoBackToDashboard}
        />
      ) : currentView === "leaderboard" ? (
        <Leaderboard onGoBack={handleGoBackToDashboard} />
      ) : (
        // Fallback to dashboard if state is inconsistent
        <Dashboard
          user={currentUser}
          onStartLesson={handleStartLesson}
          onShowLeaderboard={handleShowLeaderboard}
          onLogout={handleLogout}
        />
      )}
    </main>
  )
}
