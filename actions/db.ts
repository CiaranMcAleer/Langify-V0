// actions/db.ts
import bcrypt from "bcryptjs"

// In-memory "database"
let users: { id: string; username: string; password_hash: string; points: number; level: number }[] = []
let languages: { id: string; name: string; code: string; flag_url: string }[] = []
let lessons: { id: string; language_id: string; title: string; description: string; order: number }[] = []
let lessonContent: { id: string; lesson_id: string; type: "multiple_choice" | "fill_in_blank"; data: string }[] = []
let userProgress: { user_id: string; lesson_id: string; completed: boolean; score: number }[] = []

// Helper to calculate level based on points
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

// Function to seed initial data into our in-memory database
async function seedDatabase() {
  // Users
  const hashedPassword1 = await bcrypt.hash("password123", 10)
  const hashedPassword2 = await bcrypt.hash("securepass", 10)
  const hashedPassword3 = await bcrypt.hash("testpass", 10)
  const hashedPassword4 = await bcrypt.hash("dianapass", 10)

  users = [
    { id: "user-1", username: "alice", password_hash: hashedPassword1, points: 180, level: calculateLevel(180) }, // Level 2
    { id: "user-2", username: "bob", password_hash: hashedPassword2, points: 350, level: calculateLevel(350) }, // Level 4
    { id: "user-3", username: "charlie", password_hash: hashedPassword3, points: 70, level: calculateLevel(70) }, // Level 1
    { id: "user-4", username: "diana", password_hash: hashedPassword4, points: 520, level: calculateLevel(520) }, // Level 6
  ]

  // Languages with flags
  languages = [
    { id: "lang-1", name: "Italian", code: "it", flag_url: "https://flagsapi.com/IT/flat/64.png" },
    { id: "lang-2", name: "Spanish", code: "es", flag_url: "https://flagsapi.com/ES/flat/64.png" },
    { id: "lang-3", name: "French", code: "fr", flag_url: "https://flagsapi.com/FR/flat/64.png" },
  ]

  // Lessons (Italian)
  lessons = [
    {
      id: "lesson-1",
      language_id: "lang-1",
      title: "Basic Greetings",
      description: "Learn how to say hello and goodbye.",
      order: 1,
    },
    {
      id: "lesson-2",
      language_id: "lang-1",
      title: "Common Phrases",
      description: "Everyday expressions for travelers.",
      order: 2,
    },
    {
      id: "lesson-3",
      language_id: "lang-1",
      title: "Numbers 1-10",
      description: "Count from one to ten in Italian.",
      order: 3,
    },
  ]

  // Lesson Content for Italian lessons with points_awarded
  lessonContent = [
    // Lesson 1: Basic Greetings (Max 20+20+30 = 70 points from questions)
    {
      id: "content-1-1",
      lesson_id: "lesson-1",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What does 'Ciao' mean?",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        correct_answer: "Hello",
        points_awarded: 20,
      }),
    },
    {
      id: "content-1-2",
      lesson_id: "lesson-1",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "How do you say 'Good morning'?",
        options: ["Buonanotte", "Buonasera", "Buongiorno", "Arrivederci"],
        correct_answer: "Buongiorno",
        points_awarded: 20,
      }),
    },
    {
      id: "content-1-3",
      lesson_id: "lesson-1",
      type: "fill_in_blank",
      data: JSON.stringify({
        sentence_before: "Come stai? - Sto ",
        blank_placeholder: "...",
        sentence_after: ".",
        correct_answer: "bene",
        points_awarded: 30,
      }),
    },

    // Lesson 2: Common Phrases (Max 20+30+20 = 70 points from questions)
    {
      id: "content-2-1",
      lesson_id: "lesson-2",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What does 'Grazie' mean?",
        options: ["Please", "Thank you", "Excuse me", "Sorry"],
        correct_answer: "Thank you",
        points_awarded: 20,
      }),
    },
    {
      id: "content-2-2",
      lesson_id: "lesson-2",
      type: "fill_in_blank",
      data: JSON.stringify({
        sentence_before: "Per favore, ",
        blank_placeholder: "...",
        sentence_after: ".",
        correct_answer: "un caffè",
        points_awarded: 30,
      }),
    },
    {
      id: "content-2-3",
      lesson_id: "lesson-2",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "How do you say 'Excuse me'?",
        options: ["Scusa", "Prego", "Mi dispiace", "Permesso"],
        correct_answer: "Scusa",
        points_awarded: 20,
      }),
    },

    // Lesson 3: Numbers 1-10 (Max 20+30+20 = 70 points from questions)
    {
      id: "content-3-1",
      lesson_id: "lesson-3",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What is 'due'?",
        options: ["One", "Two", "Three", "Four"],
        correct_answer: "Two",
        points_awarded: 20,
      }),
    },
    {
      id: "content-3-2",
      lesson_id: "lesson-3",
      type: "fill_in_blank",
      data: JSON.stringify({
        sentence_before: "Cinque, sei, ",
        blank_placeholder: "...",
        sentence_after: ".",
        correct_answer: "sette",
        points_awarded: 30,
      }),
    },
    {
      id: "content-3-3",
      lesson_id: "lesson-3",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What is 'dieci'?",
        options: ["Eight", "Nine", "Ten", "Eleven"],
        correct_answer: "Ten",
        points_awarded: 20,
      }),
    },
  ]

  // User Progress (initial, can be empty or pre-filled for testing)
  userProgress = [
    { user_id: "user-1", lesson_id: "lesson-1", completed: true, score: 70 }, // Alice completed lesson 1
    { user_id: "user-1", lesson_id: "lesson-2", completed: false, score: 0 },
    { user_id: "user-2", lesson_id: "lesson-1", completed: true, score: 70 },
    { user_id: "user-2", lesson_id: "lesson-2", completed: true, score: 60 },
    { user_id: "user-3", lesson_id: "lesson-1", completed: false, score: 0 },
  ]
}

// Initialize the database when the module is loaded
seedDatabase()

// Simulate SQL query function for our in-memory database
export const db = {
  async query(sql: string, params?: any[]): Promise<any[]> {
    if (sql.startsWith("SELECT * FROM users")) {
      if (sql.includes("WHERE username = ?")) {
        return users.filter((u) => u.username === params[0])
      }
      if (sql.includes("ORDER BY points DESC")) {
        return [...users].sort((a, b) => b.points - a.points)
      }
      return users
    }
    if (sql.startsWith("SELECT * FROM languages")) {
      return languages
    }
    if (sql.startsWith("SELECT * FROM lessons")) {
      if (sql.includes("WHERE language_id = ?")) {
        return lessons.filter((l) => l.language_id === params[0]).sort((a, b) => a.order - b.order)
      }
      if (sql.includes("WHERE id = ?")) {
        return lessons.filter((l) => l.id === params[0])
      }
      return lessons
    }
    if (sql.startsWith("SELECT * FROM lesson_content")) {
      if (sql.includes("WHERE lesson_id = ?")) {
        return lessonContent.filter((lc) => lc.lesson_id === params[0])
      }
      return lessonContent
    }
    if (sql.startsWith("INSERT INTO users")) {
      const newUser = {
        id: `user-${users.length + 1}`,
        username: params[0],
        password_hash: params[1],
        points: 0,
        level: 1,
      }
      users.push(newUser)
      return [newUser]
    }
    if (sql.startsWith("UPDATE users SET points = ? WHERE id = ?")) {
      const userIndex = users.findIndex((u) => u.id === params[1])
      if (userIndex !== -1) {
        users[userIndex].points = params[0]
        users[userIndex].level = calculateLevel(users[userIndex].points) // Update level based on new points
      }
      return []
    }
    if (sql.startsWith("INSERT INTO user_progress")) {
      const newProgress = { user_id: params[0], lesson_id: params[1], completed: params[2], score: params[3] }
      userProgress.push(newProgress)
      return [newProgress]
    }
    if (sql.startsWith("UPDATE user_progress SET completed = ?, score = ? WHERE user_id = ? AND lesson_id = ?")) {
      const progressIndex = userProgress.findIndex((p) => p.user_id === params[2] && p.lesson_id === params[3])
      if (progressIndex !== -1) {
        userProgress[progressIndex].completed = params[0]
        userProgress[progressIndex].score = params[1]
      }
      return []
    }
    if (sql.startsWith("SELECT * FROM user_progress")) {
      if (sql.includes("WHERE user_id = ? AND language_id = ?")) {
        // This is a custom query for dashboard progress
        const languageLessons = lessons.filter((l) => l.language_id === params[1]).map((l) => l.id)
        return userProgress.filter((p) => p.user_id === params[0] && languageLessons.includes(p.lesson_id))
      }
      if (sql.includes("WHERE user_id = ? AND lesson_id = ?")) {
        return userProgress.filter((p) => p.user_id === params[0] && p.lesson_id === params[1])
      }
      return userProgress
    }

    return []
  },
}
