// actions/auth.ts
"use server"

import bcrypt from "bcryptjs"
import { db } from "./db"

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { success: false, message: "Username and password are required." }
  }

  const users = await db.query("SELECT * FROM users WHERE username = ?", [username])
  const user = users[0]

  if (!user) {
    return { success: false, message: "Invalid username or password." }
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatch) {
    return { success: false, message: "Invalid username or password." }
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      points: user.points,
      level: user.level,
      last_lesson_completed_at: user.last_lesson_completed_at,
      current_streak: user.current_streak,
      isAdmin: user.isAdmin,
      ui_language: user.ui_language, // Return ui_language
    },
  }
}

export async function register(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const uiLanguage = formData.get("uiLanguage") as string

  if (!username || !password || !confirmPassword || !uiLanguage) {
    return { success: false, message: "All fields are required." }
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." }
  }

  const existingUsers = await db.query("SELECT * FROM users WHERE username = ?", [username])
  if (existingUsers.length > 0) {
    return { success: false, message: "Username already exists." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUserResult = await db.query("INSERT INTO users (username, password_hash, ui_language) VALUES (?, ?, ?)", [
    username,
    hashedPassword,
    uiLanguage,
  ])
  const newUser = newUserResult[0]

  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      points: newUser.points,
      level: newUser.level,
      last_lesson_completed_at: newUser.last_lesson_completed_at,
      current_streak: newUser.current_streak,
      isAdmin: newUser.isAdmin,
      ui_language: newUser.ui_language,
    },
  }
}

export async function changePassword(userId: string, currentPasswordInput: string, newPasswordInput: string) {
  const users = await db.query("SELECT * FROM users WHERE id = ?", [userId])
  const user = users[0]

  if (!user) {
    return { success: false, message: "User not found." }
  }

  const passwordMatch = await bcrypt.compare(currentPasswordInput, user.password_hash)
  if (!passwordMatch) {
    return { success: false, message: "Incorrect current password." }
  }

  const newHashedPassword = await bcrypt.hash(newPasswordInput, 10)
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHashedPassword, userId])

  return { success: true, message: "Password changed successfully!" }
}

export async function deleteAccount(userId: string, usernameInput: string, passwordInput: string) {
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

  // Delete user's progress, history, and then the user itself
  await db.query("DELETE FROM user_progress WHERE user_id = ?", [userId])
  await db.query("DELETE FROM user_history WHERE user_id = ?", [userId])
  await db.query("DELETE FROM users WHERE id = ?", [userId])

  return { success: true, message: "Account deleted successfully!" }
}
