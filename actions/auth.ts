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
      isAdmin: user.isAdmin, // Return isAdmin flag
    },
  }
}

export async function register(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { success: false, message: "Username and password are required." }
  }

  const existingUsers = await db.query("SELECT * FROM users WHERE username = ?", [username])
  if (existingUsers.length > 0) {
    return { success: false, message: "Username already exists." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUserResult = await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
    username,
    hashedPassword,
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
      isAdmin: newUser.isAdmin, // Return isAdmin flag
    },
  }
}
