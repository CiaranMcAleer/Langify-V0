// actions/app.ts
"use server"

import { db } from "./db"
import bcrypt from "bcryptjs" // Import bcrypt for password verification

export async function getLanguages() {
  return await db.query("SELECT * FROM languages")
}

export async function getLessons(languageId: string) {
  return await db.query('SELECT * FROM lessons WHERE language_id = ? ORDER BY "order" ASC', [languageId])
}

export async function getLessonContent(lessonId: string) {
  const content = await db.query("SELECT * FROM lesson_content WHERE lesson_id = ?", [lessonId])
  return content.map((item) => ({
    ...item,
    data: JSON.parse(item.data), // Parse the JSON string back to an object
  }))
}

export async function submitLessonAnswer(userId: string, lessonId: string, totalLessonScore: number) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Update user's points and streak
  const users = await db.query("SELECT * FROM users WHERE id = ?", [userId])
  const currentUser = users[0]
  let newStreak = currentUser.current_streak
  let lastCompletedAt = currentUser.last_lesson_completed_at

  if (currentUser) {
    const newPoints = currentUser.points + totalLessonScore
    const newLevel = calculateLevel(newPoints)

    if (lastCompletedAt) {
      const lastCompletionDate = new Date(lastCompletedAt)
      const lastCompletionDay = new Date(
        lastCompletionDate.getFullYear(),
        lastCompletionDate.getMonth(),
        lastCompletionDate.getDate(),
      )

      const diffTime = Math.abs(today.getTime() - lastCompletionDay.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Completed yesterday, increment streak
        newStreak += 1
      } else if (diffDays > 1) {
        // Missed a day, reset streak
        newStreak = 1
      }
      // If diffDays is 0 (completed today), streak remains the same
    } else {
      // First lesson completed, start streak
      newStreak = 1
    }
    lastCompletedAt = now.toISOString() // Update last completion time to now

    await db.query(
      "UPDATE users SET points = ?, level = ?, last_lesson_completed_at = ?, current_streak = ? WHERE id = ?",
      [newPoints, newLevel, lastCompletedAt, newStreak, userId],
    )

    // Record history
    await db.query("INSERT INTO user_history (user_id, timestamp, points, level) VALUES (?, ?, ?, ?)", [
      userId,
      now.toISOString(),
      newPoints,
      newLevel,
    ])
  }

  // Update user progress for the lesson
  const existingProgress = await db.query("SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?", [
    userId,
    lessonId,
  ])
  if (existingProgress.length > 0) {
    await db.query("UPDATE user_progress SET completed = ?, score = ? WHERE user_id = ? AND lesson_id = ?", [
      true,
      totalLessonScore,
      userId,
      lessonId,
    ])
  } else {
    await db.query("INSERT INTO user_progress (user_id, lesson_id, completed, score) VALUES (?, ?, ?, ?)", [
      userId,
      lessonId,
      true,
      totalLessonScore,
    ])
  }

  // Return updated user data
  const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
  return {
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      points: updatedUser.points,
      level: updatedUser.level,
      last_lesson_completed_at: updatedUser.last_lesson_completed_at,
      current_streak: updatedUser.current_streak,
      isAdmin: updatedUser.isAdmin,
      ui_language: updatedUser.ui_language,
    },
  }
}

export async function getLeaderboard() {
  return await db.query("SELECT id, username, points, level FROM users ORDER BY points DESC")
}

export async function getUserProgress(userId: string, languageId: string) {
  return await db.query("SELECT * FROM user_progress WHERE user_id = ? AND language_id = ?", [userId, languageId])
}

export async function getUserHistory(userId: string) {
  return await db.query("SELECT * FROM user_history WHERE user_id = ? ORDER BY timestamp ASC", [userId])
}

export async function getNotifications() {
  return await db.query("SELECT * FROM notifications")
}

export async function getUiTranslations() {
  const result = await db.query("SELECT * FROM ui_translations")
  return result[0] || {} // Return the translation object
}

// DEVMODE ACTIONS
export async function markLessonAsCompleteDev(userId: string, lessonId: string) {
  await db.query("UPDATE user_progress SET completed = ? WHERE user_id = ? AND lesson_id = ?", [true, userId, lessonId])
  return { success: true }
}

export async function addStreakDayDev(userId: string) {
  const users = await db.query("SELECT * FROM users WHERE id = ?", [userId])
  const currentUser = users[0]
  if (currentUser) {
    const newStreak = currentUser.current_streak + 1
    // Set last_lesson_completed_at to now to ensure streak is maintained
    await db.query("UPDATE users SET current_streak = ?, last_lesson_completed_at = ? WHERE id = ?", [
      newStreak,
      new Date().toISOString(),
      userId,
    ])
    const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
    return {
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        points: updatedUser.points,
        level: updatedUser.level,
        last_lesson_completed_at: updatedUser.last_lesson_completed_at,
        current_streak: updatedUser.current_streak,
        isAdmin: updatedUser.isAdmin,
        ui_language: updatedUser.ui_language,
      },
    }
  }
  return { success: false, message: "User not found." }
}

export async function updateUserStatsDev(userId: string, points: number, level: number) {
  const newLevel = calculateLevel(points) // Recalculate level based on new points
  await db.query("UPDATE users SET points = ?, level = ? WHERE id = ?", [points, newLevel, userId])
  // Record history for manual update
  await db.query("INSERT INTO user_history (user_id, timestamp, points, level) VALUES (?, ?, ?, ?)", [
    userId,
    new Date().toISOString(),
    points,
    newLevel,
  ])
  const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
  return {
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      points: updatedUser.points,
      level: updatedUser.level,
      last_lesson_completed_at: updatedUser.last_lesson_completed_at,
      current_streak: updatedUser.current_streak,
      isAdmin: updatedUser.isAdmin,
      ui_language: updatedUser.ui_language,
    },
  }
}

export async function resetUserProgressDev(userId: string) {
  await db.query("DELETE FROM user_progress WHERE user_id = ?", [userId])
  await db.query("DELETE FROM user_history WHERE user_id = ?", [userId])
  // Reset user's points, level, and streak
  await db.query(
    "UPDATE users SET points = ?, level = ?, last_lesson_completed_at = ?, current_streak = ? WHERE id = ?",
    [0, 1, null, 0, userId],
  )
  const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
  return {
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      points: updatedUser.points,
      level: updatedUser.level,
      last_lesson_completed_at: updatedUser.last_lesson_completed_at,
      current_streak: updatedUser.current_streak,
      isAdmin: updatedUser.isAdmin,
      ui_language: updatedUser.ui_language,
    },
  }
}

export async function resetUserProgress(userId: string, usernameInput: string, passwordInput: string) {
  const users = await db.query("SELECT * FROM users WHERE id = ?", [userId])
  const user = users[0]

  if (!user) {
    return { success: false, message: "User not found." }
  }

  if (user.username !== usernameInput) {
    return { success: false, message: "Incorrect username." }
  }

  const passwordMatch = await bcrypt.compare(passwordInput, user.password_hash)
  if (!passwordMatch) {
    return { success: false, message: "Incorrect password." }
  }

  await db.query("DELETE FROM user_progress WHERE user_id = ?", [userId])
  await db.query("DELETE FROM user_history WHERE user_id = ?", [userId])
  // Reset user's points, level, and streak
  await db.query(
    "UPDATE users SET points = ?, level = ?, last_lesson_completed_at = ?, current_streak = ? WHERE id = ?",
    [0, 1, null, 0, userId],
  )
  const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
  return {
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      points: updatedUser.points,
      level: updatedUser.level,
      last_lesson_completed_at: updatedUser.last_lesson_completed_at,
      current_streak: updatedUser.current_streak,
      isAdmin: updatedUser.isAdmin,
      ui_language: updatedUser.ui_language,
    },
  }
}

export async function updateUserUiLanguage(userId: string, newLanguageCode: string) {
  await db.query("UPDATE users SET ui_language = ? WHERE id = ?", [newLanguageCode, userId])
  const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
  return {
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      points: updatedUser.points,
      level: updatedUser.level,
      last_lesson_completed_at: updatedUser.last_lesson_completed_at,
      current_streak: updatedUser.current_streak,
      isAdmin: updatedUser.isAdmin,
      ui_language: updatedUser.ui_language,
    },
  }
}

// Helper function for level calculation (copied from db.ts to be available in server action context)
function calculateLevel(points: number): number {
  if (points >= 900) return 10
  if (points >= 800) return 9
  if (points >= 700) return 8
  if (points >= 600) return 7
  if (points >= 500) return 6
  if (points >= 400) return 5
  if (points >= 300) return 4
  if (points >= 200) return 3
  if (points >= 100) return 2
  return 1
}
