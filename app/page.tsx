// app/page.tsx
"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import Dashboard from "@/components/dashboard"
import LessonPage from "@/components/lesson/lesson-page"
import Leaderboard from "@/components/leaderboard"
import ProfilePage from "@/components/profile-page"
import Image from "next/image"
import { Moon, Sun } from "react-feather" // Import Moon and Sun components
import Button from "@/components/ui/button" // Import Button component

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentView, setCurrentView] = useState<
    "login" | "register" | "dashboard" | "lesson" | "leaderboard" | "profile"
  >("login")
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [lessonTimerEnabled, setLessonTimerEnabled] = useState(true) // Default to timer enabled
  const [theme, setTheme] = useState<string>("default") // 'default' or 'langify-modern'

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("langify-theme")
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Apply theme class to HTML element
    document.documentElement.className = theme === "langify-modern" ? "theme-langify-modern" : ""
    localStorage.setItem("langify-theme", theme)
  }, [theme])

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

  const handleShowProfile = () => {
    setCurrentView("profile")
  }

  const handleGoBackToDashboard = () => {
    setCurrentView("dashboard")
  }

  const handleToggleLessonTimer = () => {
    setLessonTimerEnabled((prev) => !prev)
  }

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "default" ? "langify-modern" : "default"))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-4 md:px-6 border-b bg-card">
        <div className="flex items-center gap-2">
          <Image src="/langify-logo.png" alt="Langify Logo" width={32} height={32} />
          <span className="text-xl font-bold">Langify</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleTheme} className="p-2 rounded-full hover:bg-accent">
            {theme === "default" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </button>
          {currentUser && (
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          )}
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center w-full pt-16 pb-12">
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
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
            lessonTimerEnabled={lessonTimerEnabled}
            onToggleLessonTimer={handleToggleLessonTimer}
          />
        ) : currentView === "lesson" && activeLessonId ? (
          <LessonPage
            user={currentUser}
            lessonId={activeLessonId}
            onLessonComplete={handleLessonComplete}
            onGoBack={handleGoBackToDashboard}
            lessonTimerEnabled={lessonTimerEnabled}
          />
        ) : currentView === "leaderboard" ? (
          <Leaderboard onGoBack={handleGoBackToDashboard} />
        ) : currentView === "profile" ? (
          <ProfilePage user={currentUser} onGoBack={handleGoBackToDashboard} />
        ) : (
          // Fallback to dashboard if state is inconsistent
          <Dashboard
            user={currentUser}
            onStartLesson={handleStartLesson}
            onShowLeaderboard={handleShowLeaderboard}
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
            lessonTimerEnabled={lessonTimerEnabled}
            onToggleLessonTimer={handleToggleLessonTimer}
          />
        )}
      </div>
    </main>
  )
}
