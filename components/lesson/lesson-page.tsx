// components/lesson/lesson-page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getLessonContent, submitLessonAnswer } from "@/actions/app"
import LessonContentRenderer from "./lesson-content-renderer"
import { Timer } from "lucide-react"

interface LessonContentItem {
  id: string
  type: "multiple_choice" | "fill_in_blank"
  data: {
    question?: string
    options?: string[]
    correct_answer: string
    sentence_before?: string
    blank_placeholder?: string
    sentence_after?: string
    points_awarded: number // Added points_awarded
  }
}

export default function LessonPage({
  user,
  lessonId,
  onLessonComplete,
  onGoBack,
  timerDurationSeconds, // This prop now defines the timer duration
}: {
  user: any
  lessonId: string
  onLessonComplete: (updatedUser: any) => void
  onGoBack: () => void
  timerDurationSeconds: number // This prop now defines the timer duration
}) {
  const [lessonContent, setLessonContent] = useState<LessonContentItem[]>([])
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [totalQuestionPoints, setTotalQuestionPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null) // Time in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const MAX_BONUS_POINTS = 100 // Max bonus points for completing fast

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      const content = await getLessonContent(lessonId)
      setLessonContent(content)
      setIsLoading(false)
      setCorrectAnswersCount(0)
      setTotalQuestionPoints(0)

      if (timerDurationSeconds > 0) {
        setTimeLeft(timerDurationSeconds)
        startTimeRef.current = Date.now()
      } else {
        setTimeLeft(null)
        startTimeRef.current = null
      }
    }
    fetchContent()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [lessonId, timerDurationSeconds])

  useEffect(() => {
    // Only run timer if timerDurationSeconds is positive and timeLeft is not null
    if (timerDurationSeconds > 0 && timeLeft !== null && timeLeft > 0 && !isLoading && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
    } else if (timeLeft === 0 && !isSubmitting) {
      // Time's up, automatically finish lesson
      handleFinishLesson()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timeLeft, timerDurationSeconds, isLoading, isSubmitting])

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1)
      const currentItemPoints = lessonContent[currentContentIndex]?.data?.points_awarded || 0
      setTotalQuestionPoints((prev) => prev + currentItemPoints)
    }
  }

  const calculateBonusPoints = (timeTakenSeconds: number) => {
    if (timerDurationSeconds <= 0 || timeTakenSeconds === 0) return 0 // No timer or no time taken

    // If time taken is more than max allowed, no bonus
    if (timeTakenSeconds >= timerDurationSeconds) return 0

    // Calculate bonus based on remaining time
    const timeRatio = timeTakenSeconds / timerDurationSeconds
    const bonus = MAX_BONUS_POINTS * (1 - timeRatio)
    return Math.round(Math.max(0, bonus)) // Ensure bonus is not negative
  }

  const handleFinishLesson = async () => {
    setIsSubmitting(true)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    let timeTakenSeconds = 0
    if (timerDurationSeconds > 0 && startTimeRef.current) {
      timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
    }

    const bonusPoints = calculateBonusPoints(timeTakenSeconds)
    const finalLessonScore = totalQuestionPoints + bonusPoints

    const result = await submitLessonAnswer(user.id, lessonId, finalLessonScore)
    setIsSubmitting(false)
    if (result.success) {
      onLessonComplete(result.user)
    } else {
      console.error("Failed to submit lesson:", result.message)
      onGoBack() // Go back on error
    }
  }

  const handleNextItem = async () => {
    if (currentContentIndex < lessonContent.length - 1) {
      setCurrentContentIndex((prev) => prev + 1)
    } else {
      await handleFinishLesson()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Loading lesson...</p>
      </div>
    )
  }

  if (lessonContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
        <p className="text-xl font-semibold mb-4">No content found for this lesson.</p>
        <Button onClick={onGoBack}>Go Back to Dashboard</Button>
      </div>
    )
  }

  const currentContent = lessonContent[currentContentIndex]
  const progress = ((currentContentIndex + 1) / lessonContent.length) * 100

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lesson Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentContentIndex + 1} / {lessonContent.length}
            </span>
          </CardTitle>
          <Progress value={progress} className="w-full" />
          {timerDurationSeconds > 0 && timeLeft !== null && (
            <div className="flex items-center justify-center gap-2 mt-2 text-lg font-medium">
              <Timer className="h-5 w-5" />
              <span>Time Left: {timeLeft}s</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <LessonContentRenderer
            content={currentContent}
            onAnswerSubmit={handleAnswerSubmit}
            isLastItem={currentContentIndex === lessonContent.length - 1}
            onNextItem={handleNextItem}
          />
          {isSubmitting && <div className="mt-4 text-center text-primary">Submitting lesson...</div>}
        </CardContent>
      </Card>
    </div>
  )
}
