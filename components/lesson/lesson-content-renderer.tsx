// components/lesson/lesson-content-renderer.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { Volume2 } from "lucide-react" // Import Volume2 from lucide-react

interface MultipleChoiceData {
  question: string
  options: string[]
  correct_answer: string
  points_awarded: number
}

interface FillInBlankData {
  sentence_before: string
  blank_placeholder: string
  sentence_after: string
  correct_answer: string
  points_awarded: number
}

interface AudioMultipleChoiceData {
  audio_url: string
  question: string
  options: string[]
  correct_answer: string
  points_awarded: number
}

interface LessonContentItem {
  id: string
  type: "multiple_choice" | "fill_in_blank" | "audio_multiple_choice_translation" | "audio_multiple_choice_text"
  data: MultipleChoiceData | FillInBlankData | AudioMultipleChoiceData
}

export default function LessonContentRenderer({
  content,
  onAnswerSubmit,
  isLastItem,
  onNextItem,
  isDevMode, // New prop
}: {
  content: LessonContentItem
  onAnswerSubmit: (isCorrect: boolean) => void
  isLastItem: boolean
  onNextItem: () => void
  isDevMode: boolean // New prop
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [fillInBlankAnswer, setFillInBlankAnswer] = useState<string>("")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [showNextButton, setShowNextButton] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    setSelectedAnswer("")
    setFillInBlankAnswer("")
    setFeedback(null)
    setShowNextButton(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load() // Reload audio when content changes
    }

    // Devmode: Pre-populate fill-in-blank
    if (isDevMode && content.type === "fill_in_blank") {
      const fibData = content.data as FillInBlankData
      setFillInBlankAnswer(fibData.correct_answer)
    }
  }, [content, isDevMode])

  const handleSubmit = () => {
    let isCorrect = false
    if (content.type === "multiple_choice") {
      const mcData = content.data as MultipleChoiceData
      isCorrect = selectedAnswer === mcData.correct_answer
    } else if (content.type === "fill_in_blank") {
      const fibData = content.data as FillInBlankData
      isCorrect = fillInBlankAnswer.trim().toLowerCase() === fibData.correct_answer.toLowerCase()
    } else if (content.type === "audio_multiple_choice_translation" || content.type === "audio_multiple_choice_text") {
      const audioMcData = content.data as AudioMultipleChoiceData
      isCorrect = selectedAnswer === audioMcData.correct_answer
    }
    setFeedback(isCorrect ? "correct" : "incorrect")
    onAnswerSubmit(isCorrect)
    setShowNextButton(true)
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
    }
  }

  const renderContent = () => {
    if (content.type === "multiple_choice") {
      const mcData = content.data as MultipleChoiceData
      return (
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold">{mcData.question}</h3>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="grid gap-2"
            disabled={feedback !== null}
          >
            {mcData.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center rounded-lg border p-4 cursor-pointer transition-colors duration-200",
                  selectedAnswer === option && "bg-accent",
                  feedback === "correct" && selectedAnswer === option && "border-green-500 bg-green-50",
                  feedback === "incorrect" && selectedAnswer === option && "border-red-500 bg-red-50",
                  feedback === "incorrect" && option === mcData.correct_answer && "border-green-500 bg-green-50",
                  isDevMode && option === mcData.correct_answer && "border-blue-500 ring-2 ring-blue-500", // Devmode highlight
                )}
                onClick={() => !feedback && setSelectedAnswer(option)}
              >
                <RadioGroupItem value={option} id={`option-${index}`} className="sr-only" />
                <Label htmlFor={`option-${index}`} className="w-full cursor-pointer text-lg font-medium">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    } else if (content.type === "fill_in_blank") {
      const fibData = content.data as FillInBlankData
      return (
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold">{t("completeSentence")}</h3>
          <div className="flex flex-wrap items-center gap-1 text-lg">
            <span>{fibData.sentence_before}</span>
            <Input
              type="text"
              placeholder={fibData.blank_placeholder}
              value={fillInBlankAnswer}
              onChange={(e) => setFillInBlankAnswer(e.target.value)}
              className={cn(
                "inline-block w-auto min-w-[100px] max-w-[200px] text-center",
                feedback === "correct" && "border-green-500 bg-green-50",
                feedback === "incorrect" && "border-red-500 bg-red-50",
                isDevMode && "border-blue-500 ring-2 ring-blue-500", // Devmode highlight
              )}
              disabled={feedback !== null}
              aria-label="Fill in the blank"
            />
            <span>{fibData.sentence_after}</span>
          </div>
          {feedback === "incorrect" && <p className="text-sm text-red-500">Correct answer: {fibData.correct_answer}</p>}
        </div>
      )
    } else if (content.type === "audio_multiple_choice_translation" || content.type === "audio_multiple_choice_text") {
      const audioMcData = content.data as AudioMultipleChoiceData
      return (
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold">{audioMcData.question}</h3>
          <div className="flex justify-center">
            <audio ref={audioRef} src={audioMcData.audio_url} preload="auto" crossOrigin="anonymous" />
            <Button onClick={handlePlayAudio} size="lg" className="text-lg">
              <Volume2 className="mr-2 h-6 w-6" /> Play Audio
            </Button>
          </div>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="grid gap-2"
            disabled={feedback !== null}
          >
            {audioMcData.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center rounded-lg border p-4 cursor-pointer transition-colors duration-200",
                  selectedAnswer === option && "bg-accent",
                  feedback === "correct" && selectedAnswer === option && "border-green-500 bg-green-50",
                  feedback === "incorrect" && selectedAnswer === option && "border-red-500 bg-red-50",
                  feedback === "incorrect" && option === audioMcData.correct_answer && "border-green-500 bg-green-50",
                  isDevMode && option === audioMcData.correct_answer && "border-blue-500 ring-2 ring-blue-500", // Devmode highlight
                )}
                onClick={() => !feedback && setSelectedAnswer(option)}
              >
                <RadioGroupItem value={option} id={`option-${index}`} className="sr-only" />
                <Label htmlFor={`option-${index}`} className="w-full cursor-pointer text-lg font-medium">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    }
    return <p>Unknown content type.</p>
  }

  return (
    <div className="grid gap-6">
      {renderContent()}
      {feedback && (
        <p className={cn("text-center font-semibold", feedback === "correct" ? "text-green-600" : "text-red-600")}>
          {feedback === "correct" ? t("correct") : t("incorrect")}
        </p>
      )}
      {!showNextButton && (
        <Button
          onClick={handleSubmit}
          disabled={
            (content.type === "multiple_choice" && !selectedAnswer) ||
            (content.type === "audio_multiple_choice_translation" && !selectedAnswer) ||
            (content.type === "audio_multiple_choice_text" && !selectedAnswer) ||
            (content.type === "fill_in_blank" && !fillInBlankAnswer.trim()) ||
            feedback !== null
          }
        >
          {t("checkAnswer")}
        </Button>
      )}
      {showNextButton && <Button onClick={onNextItem}>{isLastItem ? t("finishLesson") : t("next")}</Button>}
    </div>
  )
}
