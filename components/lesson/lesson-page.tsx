// components/lesson/lesson-page.tsx
"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getLessonContent, submitLessonAnswer } from "@/actions/app"
import LessonContentRenderer from "./lesson-content-renderer"

export default function LessonPage({
  user,
  lessonId,
  onLessonComplete,
  onGoBack,
}: { user: any; lessonId: string; onLessonComplete: (updatedUser: any) => void; onGoBack: () => void }) {
  const [lessonContent, setLessonContent] = useState<any[]>([])
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [lessonScore, setLessonScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      const content = await getLessonContent(lessonId)
      setLessonContent(content)
      setIsLoading(false)
    }
    fetchContent()
  }, [lessonId])

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setLessonScore((prev) => prev + 10) // Award 10 points per correct answer
    }
  }

  const handleNextItem = async () => {
    if (currentContentIndex < lessonContent.length - 1) {
      setCurrentContentIndex((prev) => prev + 1)
    } else {
      // Lesson finished
      setIsSubmitting(true)
      const result = await submitLessonAnswer(user.id, lessonId, lessonScore)
      setIsSubmitting(false)
      if (result.success) {
        onLessonComplete(result.user)
      } else {
        console.error("Failed to submit lesson:", result.message)
        onGoBack() // Go back on error
      }
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
