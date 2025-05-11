// Email service for sending order notifications
// This is a mock implementation for demonstration purposes

export type EmailTemplate =
  | "order-confirmation"
  | "order-processing"
  | "order-shipped"
  | "order-delivered"
  | "order-cancelled"

export interface EmailData {
  id: string
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, any>
  sentAt: string
  status: "sent" | "failed"
}

// Store sent emails in localStorage for demo purposes
const getSentEmails = (): EmailData[] => {
  if (typeof window === "undefined") return []

  try {
    const emails = localStorage.getItem("crochet_sent_emails")
    return emails ? JSON.parse(emails) : []
  } catch (error) {
    console.error("Error retrieving sent emails:", error)
    return []
  }
}

const storeSentEmail = (email: EmailData): void => {
  if (typeof window === "undefined") return

  try {
    const emails = getSentEmails()
    emails.push(email)
    localStorage.setItem("crochet_sent_emails", JSON.stringify(emails))
  } catch (error) {
    console.error("Error storing sent email:", error)
  }
}

// Email templates
const getEmailSubject = (template: EmailTemplate, data: Record<string, any>): string => {
  const orderId = data.orderId || data.order?.id || "Unknown"
  const shortOrderId = typeof orderId === "string" ? orderId.slice(0, 8) : orderId

  switch (template) {
    case "order-confirmation":
      return `Order Confirmation #${shortOrderId} - Thank you for your purchase!`
    case "order-processing":
      return `Your Order #${shortOrderId} is Being Processed`
    case "order-shipped":
      return `Your Order #${shortOrderId} Has Shipped!`
    case "order-delivered":
      return `Your Order #${shortOrderId} Has Been Delivered`
    case "order-cancelled":
      return `Your Order #${shortOrderId} Has Been Cancelled`
    default:
      return `Update on Your Order #${shortOrderId}`
  }
}

// Send email function
export const sendEmail = async (to: string, template: EmailTemplate, data: Record<string, any>): Promise<EmailData> => {
  // In a real app, this would connect to an email service like SendGrid, Mailgun, etc.
  console.log(`Sending ${template} email to ${to}`, data)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const emailData: EmailData = {
    id: crypto.randomUUID(),
    to,
    subject: getEmailSubject(template, data),
    template,
    data,
    sentAt: new Date().toISOString(),
    status: Math.random() > 0.05 ? "sent" : "failed", // 5% chance of failure for demo
  }

  // Store the email in localStorage for demo purposes
  storeSentEmail(emailData)

  return emailData
}

// Get emails for a specific recipient
export const getEmailsForRecipient = (email: string): EmailData[] => {
  const emails = getSentEmails()
  return emails.filter((e) => e.to === email)
}

// Get all sent emails
export const getAllSentEmails = (): EmailData[] => {
  return getSentEmails()
}

// Clear all sent emails (for demo purposes)
export const clearSentEmails = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("crochet_sent_emails")
}
