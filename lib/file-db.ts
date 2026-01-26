import * as fs from "fs"
import * as path from "path"

const DB_DIR = path.join(process.cwd(), ".db")
const USERS_FILE = path.join(DB_DIR, "users.json")

// Ensure database directory exists
function ensureDBDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
    console.log(`[DB] Created database directory: ${DB_DIR}`)
  }
}

// Read users from file
export function readUsersFromFile(): any[] {
  ensureDBDir()
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8")
      const users = JSON.parse(data)
      console.log(`[DB] Loaded ${users.length} users from ${USERS_FILE}`)
      return users
    } else {
      console.log(`[DB] Users file does not exist yet: ${USERS_FILE}`)
    }
  } catch (error) {
    console.error("[DB] Error reading users from file:", error)
  }
  return []
}

// Write users to file
export function writeUsersToFile(users: any[]) {
  ensureDBDir()
  try {
    console.log(`[FILE-DB] About to write ${users.length} users to ${USERS_FILE}`)
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
    console.log(`[FILE-DB] ✅ Successfully saved ${users.length} users to ${USERS_FILE}`)
  } catch (error) {
    console.error(`[FILE-DB] ❌ Error writing users to file:`, error)
  }
}

// Read products from file
export function readProductsFromFile(): any[] {
  ensureDBDir()
  const productsFile = path.join(DB_DIR, "products.json")
  try {
    if (fs.existsSync(productsFile)) {
      const data = fs.readFileSync(productsFile, "utf-8")
      const products = JSON.parse(data)
      console.log(`[DB] Loaded ${products.length} products from ${productsFile}`)
      return products
    }
  } catch (error) {
    console.error("[DB] Error reading products from file:", error)
  }
  return []
}

// Write products to file
export function writeProductsToFile(products: any[]) {
  ensureDBDir()
  const productsFile = path.join(DB_DIR, "products.json")
  try {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), "utf-8")
  } catch (error) {
    console.error("Error writing products to file:", error)
  }
}

// Read orders from file
export function readOrdersFromFile(): any[] {
  ensureDBDir()
  const ordersFile = path.join(DB_DIR, "orders.json")
  try {
    if (fs.existsSync(ordersFile)) {
      const data = fs.readFileSync(ordersFile, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading orders from file:", error)
  }
  return []
}

// Write orders to file
export function writeOrdersToFile(orders: any[]) {
  ensureDBDir()
  const ordersFile = path.join(DB_DIR, "orders.json")
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8")
    console.log(`[DB] Saved ${orders.length} orders to ${ordersFile}`)
  } catch (error) {
    console.error("[DB] Error writing orders to file:", error)
  }
}

// Read pattern testing applications from file
export function readPatternTestingApplicationsFromFile(): any[] {
  ensureDBDir()
  const applicationsFile = path.join(DB_DIR, "pattern-testing-applications.json")
  try {
    if (fs.existsSync(applicationsFile)) {
      const data = fs.readFileSync(applicationsFile, "utf-8")
      const applications = JSON.parse(data)
      console.log(`[DB] Loaded ${applications.length} pattern testing applications from file`)
      return applications
    }
  } catch (error) {
    console.error("[DB] Error reading pattern testing applications from file:", error)
  }
  return []
}

// Write pattern testing applications to file
export function writePatternTestingApplicationsToFile(applications: any[]) {
  ensureDBDir()
  const applicationsFile = path.join(DB_DIR, "pattern-testing-applications.json")
  try {
    fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2), "utf-8")
    console.log(`[DB] Saved ${applications.length} pattern testing applications to file`)
  } catch (error) {
    console.error("[DB] Error writing pattern testing applications to file:", error)
  }
}

// Read sent emails from file
export function readSentEmailsFromFile(): any[] {
  ensureDBDir()
  const emailsFile = path.join(DB_DIR, "sent-emails.json")
  try {
    if (fs.existsSync(emailsFile)) {
      const data = fs.readFileSync(emailsFile, "utf-8")
      const emails = JSON.parse(data)
      console.log(`[DB] Loaded ${emails.length} sent emails from file`)
      return emails
    }
  } catch (error) {
    console.error("[DB] Error reading sent emails from file:", error)
  }
  return []
}

// Write sent emails to file
export function writeSentEmailsToFile(emails: any[]) {
  ensureDBDir()
  const emailsFile = path.join(DB_DIR, "sent-emails.json")
  try {
    fs.writeFileSync(emailsFile, JSON.stringify(emails, null, 2), "utf-8")
    console.log(`[DB] Saved ${emails.length} sent emails to file`)
  } catch (error) {
    console.error("[DB] Error writing sent emails to file:", error)
  }
}
