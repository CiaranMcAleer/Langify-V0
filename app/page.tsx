"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import Dashboard from "@/components/dashboard"
import LessonPage from "@/components/lesson/lesson-page"
import Leaderboard from "@/components/leaderboard"
import ProfilePage from "@/components/profile-page"
import SettingsPage from "@/components/settings-page" // Import SettingsPage
import Image from "next/image"
import { Moon, Sun, Settings } from "react-feather"
import { Button } from "@/components/ui/button"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import Notifications from "@/components/notifications"
import { Toaster } from "@/components/ui/toaster"

function AppContent() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentView, setCurrentView] = useState<
    "login" | "register" | "dashboard" | "lesson" | "leaderboard" | "profile" | "settings" // Add 'settings'
  >("login")
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [activeLessonTimerDurationSeconds, setActiveLessonTimerDurationSeconds] = useState<number>(0)
  const [theme, setTheme] = useState<string>("default")
  const [isDevMode, setIsDevMode] = useState(false)
  const { t, setLanguage } = useLanguage() // Get setLanguage from context

  useEffect(() => {
    const savedTheme = localStorage.getItem("langify-theme")
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.className = theme === "langify-modern" ? "theme-langify-modern" : ""
    localStorage.setItem("langify-theme", theme)
  }, [theme])

  useEffect(() => {
    if (currentUser?.isAdmin) {
      setIsDevMode(true)
    } else {
      setIsDevMode(false)
    }
    // Set UI language from user preference on login
    if (currentUser?.ui_language) {
      setLanguage(currentUser.ui_language)
    }
  }, [currentUser, setLanguage])

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

  const handleStartLesson = (lessonId: string, timerDurationSeconds: number) => {
    setActiveLessonId(lessonId)
    setActiveLessonTimerDurationSeconds(timerDurationSeconds)
    setCurrentView("lesson")
  }

  const handleLessonComplete = (updatedUser: any) => {
    setCurrentUser(updatedUser)
    setActiveLessonId(null)
    setActiveLessonTimerDurationSeconds(0)
    setCurrentView("dashboard")
  }

  const handleShowLeaderboard = () => {
    setCurrentView("leaderboard")
  }

  const handleShowProfile = () => {
    setCurrentView("profile")
  }

  const handleShowSettings = () => {
    setCurrentView("settings")
  }

  const handleGoBackToDashboard = () => {
    setCurrentView("dashboard")
  }

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "default" ? "langify-modern" : "default"))
  }

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser)
  }

  const handleAccountDeleted = () => {
    setCurrentUser(null)
    setCurrentView("login")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between px-4 md:px-6 border-b bg-card">
        <div className="flex items-center gap-2">
          <Image src="/placeholder.svg?height=32&width=32" alt="Langify Logo" width={32} height={32} />
          <span className="text-xl font-bold">Langify</span>
        </div>
        <div className="flex items-center gap-2">
          {isDevMode && (
            <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
              <Settings className="h-4 w-4" /> {t("devMode")}
            </div>
          )}
          <button onClick={handleToggleTheme} className="p-2 rounded-full hover:bg-accent">
            {theme === "default" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </button>
          {currentUser && (
            <Button onClick={handleLogout} variant="outline" size="sm">
              {t("logout")}
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
            isDevMode={isDevMode}
            onShowSettings={handleShowSettings} // Pass new prop
          />
        ) : currentView === "lesson" && activeLessonId ? (
          <LessonPage
            user={currentUser}
            lessonId={activeLessonId}
            onLessonComplete={handleLessonComplete}
            onGoBack={handleGoBackToDashboard}
            timerDurationSeconds={activeLessonTimerDurationSeconds}
            isDevMode={isDevMode}
          />
        ) : currentView === "leaderboard" ? (
          <Leaderboard onGoBack={handleGoBackToDashboard} />
        ) : currentView === "profile" ? (
          <ProfilePage
            user={currentUser}
            onGoBack={handleGoBackToDashboard}
            onUserUpdate={handleUserUpdate}
            isDevMode={isDevMode}
          />
        ) : currentView === "settings" ? (
          <SettingsPage
            user={currentUser}
            onGoBack={handleGoBackToDashboard}
            onUserUpdate={handleUserUpdate}
            onAccountDeleted={handleAccountDeleted}
          />
        ) : (
          // Fallback to dashboard if state is inconsistent
          <Dashboard
            user={currentUser}
            onStartLesson={handleStartLesson}
            onShowLeaderboard={handleShowLeaderboard}
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
            isDevMode={isDevMode}
            onShowSettings={handleShowSettings}
          />
        )}
      </div>
      <Notifications />
      <Toaster />
    </main>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
