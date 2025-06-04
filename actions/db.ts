// actions/db.ts
import bcrypt from "bcryptjs"

// In-memory "database"
// In a real application, this would be replaced by a connection to a persistent SQL database.
// For Next.js, we simulate it with arrays.
let users: { id: string; username: string; password_hash: string; points: number; level: number }[] = []
let languages: { id: string; name: string; code: string }[] = []
let lessons: { id: string; language_id: string; title: string; description: string; order: number }[] = []
let lessonContent: { id: string; lesson_id: string; type: "multiple_choice" | "fill_in_blank"; data: string }[] = []
let userProgress: { user_id: string; lesson_id: string; completed: boolean; score: number }[] = []

// Function to seed initial data into our in-memory database
async function seedDatabase() {
  // Users
  //These are hardcoded test user accounts but this will be removed at a leter point
  //TODO remember to remove these
  const hashedPassword1 = await bcrypt.hash("password123", 10)
  const hashedPassword2 = await bcrypt.hash("securepass", 10)
  const hashedPassword3 = await bcrypt.hash("testpass", 10)

  users = [
    { id: "user-1", username: "alice", password_hash: hashedPassword1, points: 150, level: 2 },
    { id: "user-2", username: "bob", password_hash: hashedPassword2, points: 200, level: 3 },
    { id: "user-3", username: "charlie", password_hash: hashedPassword3, points: 80, level: 1 },
  ]

  // Languages
  languages = [
    { id: "lang-1", name: "Italian", code: "it" },
    { id: "lang-2", name: "Spanish", code: "es" },
    { id: "lang-3", name: "French", code: "fr" },
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

  // Lesson Content for Italian lessons
  lessonContent = [
    // Lesson 1: Basic Greetings
    {
      id: "content-1-1",
      lesson_id: "lesson-1",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What does 'Ciao' mean?",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        correct_answer: "Hello",
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
      }),
    },

    // Lesson 2: Common Phrases
    {
      id: "content-2-1",
      lesson_id: "lesson-2",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What does 'Grazie' mean?",
        options: ["Please", "Thank you", "Excuse me", "Sorry"],
        correct_answer: "Thank you",
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
      }),
    },

    // Lesson 3: Numbers 1-10
    {
      id: "content-3-1",
      lesson_id: "lesson-3",
      type: "multiple_choice",
      data: JSON.stringify({
        question: "What is 'due'?",
        options: ["One", "Two", "Three", "Four"],
        correct_answer: "Two",
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
      }),
    },
  ]

  // User Progress (initial, can be empty or pre-filled for testing)
  userProgress = [
    { user_id: "user-1", lesson_id: "lesson-1", completed: true, score: 30 },
    { user_id: "user-1", lesson_id: "lesson-2", completed: false, score: 0 },
    { user_id: "user-2", lesson_id: "lesson-1", completed: true, score: 30 },
    { user_id: "user-2", lesson_id: "lesson-2", completed: true, score: 25 },
    { user_id: "user-3", lesson_id: "lesson-1", completed: false, score: 0 },
  ]
}

// Initialize the database when the module is loaded
seedDatabase()

// Simulate SQL query function for our in-memory database
export const db = {
  async query(sql: string, params?: any[]): Promise<any[]> {
    // This is a very simplified simulation of SQL queries on in-memory arrays.
    // In a real application, this would connect to a database like PostgreSQL, MySQL, etc.

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
        // Simple level up logic based on points
        if (users[userIndex].points >= 100 && users[userIndex].level < 2) users[userIndex].level = 2
        if (users[userIndex].points >= 200 && users[userIndex].level < 3) users[userIndex].level = 3
        if (users[userIndex].points >= 300 && users[userIndex].level < 4) users[userIndex].level = 4
        if (users[userIndex].points >= 400 && users[userIndex].level < 5) users[userIndex].level = 5
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
      if (sql.includes("WHERE user_id = ? AND lesson_id = ?")) {
        return userProgress.filter((p) => p.user_id === params[0] && p.lesson_id === params[1])
      }
      return userProgress
    }

    return []
  },
}
