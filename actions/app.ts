// actions/app.ts
"use server"

import { db } from "./db"

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

export async function submitLessonAnswer(userId: string, lessonId: string, score: number) {
  // Update user's points
  const users = await db.query("SELECT * FROM users WHERE id = ?", [userId])
  const currentUser = users[0]
  if (currentUser) {
    const newPoints = currentUser.points + score
    await db.query("UPDATE users SET points = ? WHERE id = ?", [newPoints, userId])
  }

  // Update user progress for the lesson
  const existingProgress = await db.query("SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?", [
    userId,
    lessonId,
  ])
  if (existingProgress.length > 0) {
    await db.query("UPDATE user_progress SET completed = ?, score = ? WHERE user_id = ? AND lesson_id = ?", [
      true,
      score,
      userId,
      lessonId,
    ])
  } else {
    await db.query("INSERT INTO user_progress (user_id, lesson_id, completed, score) VALUES (?, ?, ?, ?)", [
      userId,
      lessonId,
      true,
      score,
    ])
  }

  // Return updated user data
  const updatedUser = (await db.query("SELECT * FROM users WHERE id = ?", [userId]))[0]
  return {
    success: true,
    user: { id: updatedUser.id, username: updatedUser.username, points: updatedUser.points, level: updatedUser.level },
  }
}

export async function getLeaderboard() {
  return await db.query("SELECT id, username, points, level FROM users ORDER BY points DESC")
}
