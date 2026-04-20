// Email service for sending order notifications
// This is a mock implementation for demonstration purposes

export type EmailTemplate =
  | "order-confirmation"
  | "order-processing"
  | "order-shipped"
  | "order-delivered"
  | "order-cancelled"
  | "pattern-testing-approval"
  | "pattern-testing-disapproval"
  | "seller-approval-login"
  | "seller-application-submitted"
  | "seller-application-approved"
  | "seller-application-rejected"
  | "seller-onboarding-welcome"
  | "seller-status-suspended"
  | "seller-status-reactivated"
  | "seller-verification-upgraded"
  | "seller-monthly-report"

export interface EmailData {
  id: string
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, any>
  sentAt: string
  status: "sent" | "failed"
}

import { createClient } from "@supabase/supabase-js"

const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  )

// Store sent emails in Supabase (server) or localStorage (client demo)
const getSentEmails = async (): Promise<EmailData[]> => {
  if (typeof window === "undefined") {
    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from("sent_emails")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100)
      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        to: row.to_email,
        subject: row.subject,
        template: row.template,
        data: row.data || {},
        sentAt: row.sent_at,
        status: row.status,
      }))
    } catch (err) {
      console.error("Error reading sent emails from Supabase:", err)
      return []
    }
  }

  try {
    const emails = localStorage.getItem("crochet_sent_emails")
    return emails ? JSON.parse(emails) : []
  } catch (error) {
    console.error("Error retrieving sent emails:", error)
    return []
  }
}

const storeSentEmail = async (email: EmailData): Promise<void> => {
  if (typeof window === "undefined") {
    try {
      const supabase = getSupabaseAdmin()
      await supabase.from("sent_emails").insert({
        id: email.id,
        to_email: email.to,
        subject: email.subject,
        template: email.template,
        data: email.data,
        sent_at: email.sentAt,
        status: email.status,
      })
      return
    } catch (err) {
      console.error("Error storing sent email to Supabase:", err)
      return
    }
  }

  try {
    const emails = await getSentEmails()
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
    case "pattern-testing-approval":
      return `Pattern Testing Application Approved`
    case "pattern-testing-disapproval":
      return `Pattern Testing Application Update`
    case "seller-approval-login":
      return `Your Seller Account Is Ready — Login Info`
    case "seller-application-submitted":
      return `Seller Application Received - We're Reviewing Your Submission`
    case "seller-application-approved":
      return `Congratulations! Your Seller Application Has Been Approved`
    case "seller-application-rejected":
      return `Update on Your Seller Application`
    case "seller-onboarding-welcome":
      return `Welcome to Selling! Complete Your Setup`
    case "seller-status-suspended":
      return `Important: Your Seller Account Status`
    case "seller-status-reactivated":
      return `Your Seller Account Has Been Reactivated`
    case "seller-verification-upgraded":
      return `Congratulations! Your Verification Level Has Been Upgraded`
    case "seller-monthly-report":
      return `Your Monthly Seller Report - ${data.month || 'This Month'}`
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

  // Store the email
  await storeSentEmail(emailData)

  return emailData
}

// Get emails for a specific recipient
export const getEmailsForRecipient = async (email: string): Promise<EmailData[]> => {
  const emails = await getSentEmails()
  return emails.filter((e) => e.to === email)
}

// Get all sent emails
export const getAllSentEmails = async (): Promise<EmailData[]> => {
  return getSentEmails()
}

// Clear all sent emails (for demo purposes)
export const clearSentEmails = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("crochet_sent_emails")
}
