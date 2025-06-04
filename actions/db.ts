// actions/db.ts
import bcrypt from "bcryptjs"

// In-memory "database"
let users: {
  id: string
  username: string
  password_hash: string
  points: number
  level: number
  last_lesson_completed_at: string | null // New: for streak
  current_streak: number // New: for streak
  isAdmin: boolean // New: for admin devmode
  ui_language: string // New: User's preferred UI language
}[] = []
let languages: { id: string; name: string; code: string; flag_url: string }[] = []
let lessons: {
  id: string
  language_id: string
  title: string
  description: string
  order: number
  timer_enabled: boolean
  timer_duration_seconds: number
}[] = []
let lessonContent: {
  id: string
  lesson_id: string
  type:
    | "multiple_choice"
    | "fill_in_blank"
    | "audio_multiple_choice_translation" // New type
    | "audio_multiple_choice_text" // New type
  data: string
}[] = []
let userProgress: { user_id: string; lesson_id: string; completed: boolean; score: number }[] = []
let userHistory: { user_id: string; timestamp: string; points: number; level: number }[] = [] // New: for profile graph
let notifications: { id: string; message: string; type: "info" | "warning" | "event"; created_at: string }[] = [] // New: for notifications

// UI Translations
const uiTranslations: { [key: string]: { [key: string]: string } } = {
  en: {
    welcome: "Welcome, {username}!",
    totalPoints: "Total Points",
    currentLevel: "Current Level",
    earnMorePoints: "Earn more points by completing lessons!",
    keepLearning: "Keep learning to level up!",
    actions: "Actions",
    viewLeaderboard: "View Leaderboard",
    viewProfile: "View Profile",
    chooseLanguage: "Choose a Language",
    selectLanguage: "Select a language",
    lessons: "Lessons",
    completed: "Completed",
    startLesson: "Start Lesson",
    loginToLangify: "Login to Langify",
    enterCredentials: "Enter your username and password to access your account.",
    username: "Username",
    password: "Password",
    loggingIn: "Logging in...",
    login: "Login",
    noAccount: "Don't have an account?",
    register: "Register",
    registerForLangify: "Register for Langify",
    createAccount: "Create your account to start learning!",
    registering: "Registering...",
    alreadyAccount: "Already have an account?",
    lessonProgress: "Lesson Progress",
    timeLeft: "Time Left:",
    checkAnswer: "Check Answer",
    next: "Next",
    finishLesson: "Finish Lesson",
    correct: "Correct!",
    incorrect: "Incorrect.",
    loadingLesson: "Loading lesson...",
    noContent: "No content found for this lesson.",
    goBackToDashboard: "Go Back to Dashboard",
    leaderboard: "Leaderboard",
    topLearners: "Top Learners",
    rank: "Rank",
    points: "Points",
    level: "Level",
    noUsersLeaderboard: "No users on the leaderboard yet.",
    backToDashboard: "Back to Dashboard",
    myProfile: "My Profile",
    userDetails: "User Details",
    totalPointsProfile: "Total Points",
    currentLevelProfile: "Current Level",
    pointsToNextLevel: "Points to Next Level",
    maxLevelAchieved: "Max Level Achieved!",
    highestLevel: "You are at the highest level. Keep earning points!",
    logout: "Logout",
    completeSentence: "Complete the sentence:",
    streak: "Streak",
    days: "days",
    activeStreak: "Your streak is active!",
    streakReminder: "Complete a lesson today to keep your streak!",
    streakLost: "Your streak was lost. Start a new one!",
    language: "Language",
    uiLanguage: "UI Language",
    selectUiLanguage: "Select UI Language",
    eventNotification: "Event Notification",
    infoNotification: "Info Notification",
    warningNotification: "Warning Notification",
    dismiss: "Dismiss",
    pointsAndLevelHistory: "Points and Level History",
    noHistory: "No history data available.",
    toReachLevel: "to reach Level",
    at: "at",
    devMode: "Dev Mode",
    markLessonComplete: "Mark Lesson Complete",
    addDayToStreak: "Add Day to Streak",
    editPointsLevel: "Edit Points/Level",
    saveChanges: "Save Changes",
    resetProgress: "Reset Progress",
    confirmReset: "Are you sure you want to reset all your progress?",
    progressReset: "Progress reset successfully!",
    pointsUpdated: "Points and level updated!",
    streakUpdated: "Streak updated!",
    settings: "Settings",
    backToProfile: "Back to Profile",
    accountSettings: "Account Settings",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordChanged: "Password changed successfully!",
    passwordMismatch: "New passwords do not match.",
    incorrectCurrentPassword: "Incorrect current password.",
    deleteAccount: "Delete Account",
    deleteAccountWarning:
      "This action cannot be undone. This will permanently delete your account and all associated data.",
    typeUsername: "Type your username",
    typePassword: "Type your password",
    confirmDelete: "I understand the consequences, delete my account.",
    accountDeleted: "Account deleted successfully!",
    resetAllProgress: "Reset All Progress",
    resetProgressWarning:
      "This will clear all your lesson progress, points, level, and streak. This action cannot be undone.",
    confirmPassword: "Confirm Password",
    passwordsDoNotMatch: "Passwords do not match.",
    selectYourUiLanguage: "Select your UI language",
  },
  it: {
    welcome: "Benvenuto, {username}!",
    totalPoints: "Punti Totali",
    currentLevel: "Livello Attuale",
    earnMorePoints: "Guadagna più punti completando le lezioni!",
    keepLearning: "Continua a imparare per salire di livello!",
    actions: "Azioni",
    viewLeaderboard: "Visualizza Classifica",
    viewProfile: "Visualizza Profilo",
    chooseLanguage: "Scegli una Lingua",
    selectLanguage: "Seleziona una lingua",
    lessons: "Lezioni",
    completed: "Completato",
    startLesson: "Inizia Lezione",
    loginToLangify: "Accedi a Langify",
    enterCredentials: "Inserisci nome utente e password per accedere al tuo account.",
    username: "Nome Utente",
    password: "Password",
    loggingIn: "Accesso in corso...",
    login: "Accedi",
    noAccount: "Non hai un account?",
    register: "Registrati",
    registerForLangify: "Registrati a Langify",
    createAccount: "Crea il tuo account per iniziare a imparare!",
    registering: "Registrazione in corso...",
    alreadyAccount: "Hai già un account?",
    lessonProgress: "Progresso Lezione",
    timeLeft: "Tempo Rimanente:",
    checkAnswer: "Verifica Risposta",
    next: "Avanti",
    finishLesson: "Termina Lezione",
    correct: "Corretto!",
    incorrect: "Sbagliato.",
    loadingLesson: "Caricamento lezione...",
    noContent: "Nessun contenuto trovato per questa lezione.",
    goBackToDashboard: "Torna alla Dashboard",
    leaderboard: "Classifica",
    topLearners: "Migliori Studenti",
    rank: "Posizione",
    points: "Punti",
    level: "Livello",
    noUsersLeaderboard: "Nessun utente in classifica.",
    backToDashboard: "Torna alla Dashboard",
    myProfile: "Il Mio Profilo",
    userDetails: "Dettagli Utente",
    totalPointsProfile: "Punti Totali",
    currentLevelProfile: "Livello Attuale",
    pointsToNextLevel: "Punti per il Prossimo Livello",
    maxLevelAchieved: "Livello Massimo Raggiunto!",
    highestLevel: "Sei al livello più alto. Continua a guadagnare punti!",
    logout: "Esci",
    completeSentence: "Completa la frase:",
    streak: "Serie",
    days: "giorni",
    activeStreak: "La tua serie è attiva!",
    streakReminder: "Completa una lezione oggi per mantenere la tua serie!",
    streakLost: "La tua serie è stata persa. Iniziane una nuova!",
    language: "Lingua",
    uiLanguage: "Lingua UI",
    selectUiLanguage: "Seleziona Lingua UI",
    eventNotification: "Notifica Evento",
    infoNotification: "Notifica Informativa",
    warningNotification: "Notifica di Avviso",
    dismiss: "Ignora",
    pointsAndLevelHistory: "Cronologia Punti e Livello",
    noHistory: "Nessun dato storico disponibile.",
    toReachLevel: "per raggiungere il Livello",
    at: "a",
    devMode: "Modalità Sviluppatore",
    markLessonComplete: "Segna Lezione Completata",
    addDayToStreak: "Aggiungi Giorno alla Serie",
    editPointsLevel: "Modifica Punti/Livello",
    saveChanges: "Salva Modifiche",
    resetProgress: "Reimposta Progresso",
    confirmReset: "Sei sicuro di voler reimpostare tutti i tuoi progressi?",
    progressReset: "Progresso reimpostato con successo!",
    pointsUpdated: "Punti e livello aggiornati!",
    streakUpdated: "Serie aggiornata!",
    settings: "Impostazioni",
    backToProfile: "Torna al Profilo",
    accountSettings: "Impostazioni Account",
    changePassword: "Cambia Password",
    currentPassword: "Password Attuale",
    newPassword: "Nuova Password",
    confirmNewPassword: "Conferma Nuova Password",
    passwordChanged: "Password cambiata con successo!",
    passwordMismatch: "Le nuove password non corrispondono.",
    incorrectCurrentPassword: "Password attuale errata.",
    deleteAccount: "Elimina Account",
    deleteAccountWarning:
      "Questa azione non può essere annullata. Eliminerà permanentemente il tuo account e tutti i dati associati.",
    typeUsername: "Digita il tuo nome utente",
    typePassword: "Digita la tua password",
    confirmDelete: "Capisco le conseguenze, elimina il mio account.",
    accountDeleted: "Account eliminato con successo!",
    resetAllProgress: "Reimposta Tutti i Progressi",
    resetProgressWarning:
      "Questo cancellerà tutti i tuoi progressi nelle lezioni, punti, livello e serie. Questa azione non può essere annullata.",
    confirmPassword: "Conferma Password",
    passwordsDoNotMatch: "Le password non corrispondono.",
    selectYourUiLanguage: "Seleziona la tua lingua UI",
  },
}

// Flag to ensure database is seeded only once
let isDbSeeded = false

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
  if (isDbSeeded) {
    return // Already seeded, do nothing
  }

  // Users
  const hashedPassword1 = await bcrypt.hash("password123", 10)
  const hashedPassword2 = await bcrypt.hash("securepass", 10)
  const hashedPassword3 = await bcrypt.hash("testpass", 10)
  const hashedPassword4 = await bcrypt.hash("dianapass", 10)
  const hashedPassword5 = await bcrypt.hash("evapass", 10)
  const hashedPassword6 = await bcrypt.hash("frankpass", 10)
  const hashedPasswordAdmin = await bcrypt.hash("admin", 10) // Admin password

  users = [
    {
      id: "user-1",
      username: "alice",
      password_hash: hashedPassword1,
      points: 180,
      level: calculateLevel(180),
      last_lesson_completed_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // Completed yesterday, streak active
      current_streak: 3,
      isAdmin: false,
      ui_language: "en",
    },
    {
      id: "user-2",
      username: "bob",
      password_hash: hashedPassword2,
      points: 350,
      level: calculateLevel(350),
      last_lesson_completed_at: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(), // Completed 2 days ago, streak lost
      current_streak: 5,
      isAdmin: false,
      ui_language: "en",
    },
    {
      id: "user-3",
      username: "charlie",
      password_hash: hashedPassword3,
      points: 70,
      level: calculateLevel(70),
      last_lesson_completed_at: null, // No recent lesson, no streak
      current_streak: 0,
      isAdmin: false,
      ui_language: "en",
    },
    {
      id: "user-4",
      username: "diana",
      password_hash: hashedPassword4,
      points: 520,
      level: calculateLevel(520),
      last_lesson_completed_at: new Date().toISOString(), // Completed today, streak active
      current_streak: 7,
      isAdmin: false,
      ui_language: "it", // Example: Diana prefers Italian
    },
    {
      id: "user-5",
      username: "eva",
      password_hash: hashedPassword5,
      points: 810,
      level: calculateLevel(810),
      last_lesson_completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Old completion, streak lost
      current_streak: 10,
      isAdmin: false,
      ui_language: "en",
    },
    {
      id: "user-6",
      username: "frank",
      password_hash: hashedPassword6,
      points: 950,
      level: calculateLevel(950),
      last_lesson_completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Completed recently, streak active
      current_streak: 1,
      isAdmin: false,
      ui_language: "en",
    },
    {
      id: "user-admin",
      username: "admin",
      password_hash: hashedPasswordAdmin,
      points: 0,
      level: 1,
      last_lesson_completed_at: null,
      current_streak: 0,
      isAdmin: true, // Admin user
      ui_language: "en",
    },
  ]

  // Languages with flags
  languages = [
    { id: "lang-1", name: "Italian", code: "it", flag_url: "https://flagsapi.com/IT/flat/64.png" },
    { id: "lang-2", name: "Spanish", code: "es", flag_url: "https://flagsapi.com/ES/flat/64.png" },
    { id: "lang-3", name: "French", code: "fr", flag_url: "https://flagsapi.com/FR/flat/64.png" },
  ]

  // Lessons (Italian) with timer_enabled and timer_duration_seconds
  lessons = [
    {
      id: "lesson-1",
      language_id: "lang-1",
      title: "Basic Greetings",
      description: "Learn how to say hello and goodbye.",
      order: 1,
      timer_enabled: true,
      timer_duration_seconds: 60, // 60 seconds for this lesson
    },
    {
      id: "lesson-2",
      language_id: "lang-1",
      title: "Common Phrases",
      description: "Everyday expressions for travelers.",
      order: 2,
      timer_enabled: false,
      timer_duration_seconds: 0, // No timer for this lesson
    },
    {
      id: "lesson-3",
      language_id: "lang-1",
      title: "Numbers 1-10",
      description: "Count from one to ten in Italian.",
      order: 3,
      timer_enabled: true,
      timer_duration_seconds: 90, // 90 seconds for this lesson
    },
    {
      id: "lesson-4",
      language_id: "lang-1",
      title: "Audio: Common Words",
      description: "Listen and identify common Italian words.",
      order: 4,
      timer_enabled: true,
      timer_duration_seconds: 75,
    },
    {
      id: "lesson-5",
      language_id: "lang-1",
      title: "Audio: Translate Phrases",
      description: "Listen to Italian phrases and select the English translation.",
      order: 5,
      timer_enabled: false,
      timer_duration_seconds: 0,
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
    // Lesson 4: Audio: Common Words (Max 25+25 = 50 points)
    {
      id: "content-4-1",
      lesson_id: "lesson-4",
      type: "audio_multiple_choice_text",
      data: JSON.stringify({
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder audio
        question: "What word do you hear?",
        options: ["Casa", "Acqua", "Pane", "Libro"],
        correct_answer: "Casa",
        points_awarded: 25,
      }),
    },
    {
      id: "content-4-2",
      lesson_id: "lesson-4",
      type: "audio_multiple_choice_text",
      data: JSON.stringify({
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", // Placeholder audio
        question: "What word do you hear?",
        options: ["Gatto", "Cane", "Uccello", "Pesce"],
        correct_answer: "Cane",
        points_awarded: 25,
      }),
    },
    // Lesson 5: Audio: Translate Phrases (Max 30+30 = 60 points)
    {
      id: "content-5-1",
      lesson_id: "lesson-5",
      type: "audio_multiple_choice_translation",
      data: JSON.stringify({
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", // Placeholder audio
        question: "Listen and select the correct English translation:",
        options: ["How are you?", "What is your name?", "Where are you from?", "I am fine."],
        correct_answer: "How are you?",
        points_awarded: 30,
      }),
    },
    {
      id: "content-5-2",
      lesson_id: "lesson-5",
      type: "audio_multiple_choice_translation",
      data: JSON.stringify({
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", // Placeholder audio
        question: "Listen and select the correct English translation:",
        options: ["Thank you very much.", "You're welcome.", "Please help me.", "I don't understand."],
        correct_answer: "Thank you very much.",
        points_awarded: 30,
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
    { user_id: "user-4", lesson_id: "lesson-1", completed: true, score: 70 },
    { user_id: "user-4", lesson_id: "lesson-2", completed: true, score: 70 },
    { user_id: "user-4", lesson_id: "lesson-3", completed: true, score: 70 },
    { user_id: "user-5", lesson_id: "lesson-1", completed: true, score: 70 },
    { user_id: "user-5", lesson_id: "lesson-2", completed: true, score: 70 },
    { user_id: "user-5", lesson_id: "lesson-3", completed: true, score: 70 },
    { user_id: "user-6", lesson_id: "lesson-1", completed: true, score: 70 },
    { user_id: "user-6", lesson_id: "lesson-2", completed: true, score: 70 },
    { user_id: "user-6", lesson_id: "lesson-3", completed: true, score: 70 },
  ]

  // User History (initial data for graph)
  userHistory = [
    {
      user_id: "user-1",
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      points: 0,
      level: 1,
    },
    {
      user_id: "user-1",
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      points: 50,
      level: 1,
    },
    {
      user_id: "user-1",
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      points: 120,
      level: 2,
    },
    {
      user_id: "user-1",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      points: 180,
      level: 2,
    },
    {
      user_id: "user-2",
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      points: 0,
      level: 1,
    },
    {
      user_id: "user-2",
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      points: 150,
      level: 2,
    },
    {
      user_id: "user-2",
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      points: 280,
      level: 3,
    },
    {
      user_id: "user-2",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      points: 350,
      level: 4,
    },
  ]

  // Notifications
  notifications = [
    {
      id: "notif-1",
      message: "New Italian lessons available! Check out 'Audio: Common Words'.",
      type: "event",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-2",
      message: "Welcome to Langify! Start your first lesson today.",
      type: "info",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-3",
      message: "Server maintenance scheduled for tomorrow at 2 AM UTC.",
      type: "warning",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  isDbSeeded = true // Mark as seeded
}
// Initialize the database when the module is loaded
// Use an IIFE (Immediately Invoked Function Expression) to call async seedDatabase
// This ensures it runs once when the module is first imported.
;(async () => {
  await seedDatabase()
})()

// Simulate SQL query function for our in-memory database
export const db = {
  async query(sql: string, params?: any[]): Promise<any[]> {
    // Ensure database is seeded before any query
    if (!isDbSeeded) {
      await seedDatabase()
    }

    if (sql.startsWith("SELECT * FROM users")) {
      if (sql.includes("WHERE username = ?")) {
        return users.filter((u) => u.username === params[0])
      }
      if (sql.includes("WHERE id = ?")) {
        return users.filter((u) => u.id === params[0])
      }
      if (sql.includes("ORDER BY points DESC")) {
        return [...users].sort((a, b) => b.points - a.points)
      }
      return users
    }
    if (
      sql.startsWith(
        "UPDATE users SET points = ?, level = ?, last_lesson_completed_at = ?, current_streak = ? WHERE id = ?",
      )
    ) {
      const userIndex = users.findIndex((u) => u.id === params[4])
      if (userIndex !== -1) {
        users[userIndex].points = params[0]
        users[userIndex].level = params[1]
        users[userIndex].last_lesson_completed_at = params[2]
        users[userIndex].current_streak = params[3]
      }
      return []
    }
    if (sql.startsWith("UPDATE users SET current_streak = ?, last_lesson_completed_at = ? WHERE id = ?")) {
      const userIndex = users.findIndex((u) => u.id === params[2])
      if (userIndex !== -1) {
        users[userIndex].current_streak = params[0]
        users[userIndex].last_lesson_completed_at = params[1]
      }
      return []
    }
    if (sql.startsWith("UPDATE users SET points = ?, level = ? WHERE id = ?")) {
      const userIndex = users.findIndex((u) => u.id === params[2])
      if (userIndex !== -1) {
        users[userIndex].points = params[0]
        users[userIndex].level = params[1]
      }
      return []
    }
    if (sql.startsWith("UPDATE users SET password_hash = ? WHERE id = ?")) {
      const userIndex = users.findIndex((u) => u.id === params[1])
      if (userIndex !== -1) {
        users[userIndex].password_hash = params[0]
      }
      return []
    }
    if (sql.startsWith("UPDATE users SET ui_language = ? WHERE id = ?")) {
      const userIndex = users.findIndex((u) => u.id === params[1])
      if (userIndex !== -1) {
        users[userIndex].ui_language = params[0]
      }
      return []
    }
    if (sql.startsWith("INSERT INTO users")) {
      const newUser = {
        id: `user-${users.length + 1}`,
        username: params[0],
        password_hash: params[1],
        points: 0,
        level: 1,
        last_lesson_completed_at: null,
        current_streak: 0,
        isAdmin: false, // New users are not admins by default
        ui_language: params[2] || "en", // Set UI language on registration
      }
      users.push(newUser)
      return [newUser]
    }

    if (sql.startsWith("DELETE FROM users WHERE id = ?")) {
      users = users.filter((u) => u.id !== params[0])
      return []
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
    if (sql.startsWith("UPDATE user_progress SET completed = ? WHERE user_id = ? AND lesson_id = ?")) {
      const progressIndex = userProgress.findIndex((p) => p.user_id === params[1] && p.lesson_id === params[2])
      if (progressIndex !== -1) {
        userProgress[progressIndex].completed = params[0]
      } else {
        // If progress doesn't exist, create it as completed with 0 score
        userProgress.push({ user_id: params[1], lesson_id: params[2], completed: params[0], score: 0 })
      }
      return []
    }
    if (sql.startsWith("SELECT * FROM user_progress")) {
      if (sql.includes("WHERE user_id = ? AND language_id = ?")) {
        const userId = params[0]
        const languageId = params[1]
        const lessonIdsInLanguage = lessons.filter((l) => l.language_id === languageId).map((l) => l.id)
        return userProgress.filter((p) => p.user_id === userId && lessonIdsInLanguage.includes(p.lesson_id))
      }
      if (sql.includes("WHERE user_id = ? AND lesson_id = ?")) {
        return userProgress.filter((p) => p.user_id === params[0] && p.lesson_id === params[1])
      }
      return userProgress
    }
    if (sql.startsWith("INSERT INTO user_history")) {
      const newHistoryEntry = { user_id: params[0], timestamp: params[1], points: params[2], level: params[3] }
      userHistory.push(newHistoryEntry)
      return [newHistoryEntry]
    }
    if (sql.startsWith("SELECT * FROM user_history WHERE user_id = ? ORDER BY timestamp ASC")) {
      return userHistory
        .filter((h) => h.user_id === params[0])
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }
    if (sql.startsWith("DELETE FROM user_progress WHERE user_id = ?")) {
      userProgress = userProgress.filter((p) => p.user_id !== params[0])
      return []
    }
    if (sql.startsWith("DELETE FROM user_history WHERE user_id = ?")) {
      userHistory = userHistory.filter((h) => h.user_id !== params[0])
      return []
    }
    if (sql.startsWith("SELECT * FROM notifications")) {
      return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    if (sql.startsWith("SELECT * FROM ui_translations")) {
      return [uiTranslations] // Return the whole object
    }

    return []
  },
}
