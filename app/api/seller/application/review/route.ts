import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import crypto from "crypto"

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$"
  let password = ""
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

export async function GET() {
  try {
    const { data: applications, error } = await supabaseAdmin
      .from("seller_applications")
      .select("*, users!seller_applications_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ applications: applications || [] })
  } catch (error) {
    console.error("Error fetching seller applications:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching applications" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { application_id, action, admin_feedback } = await request.json()

    if (!application_id || !action) {
      return NextResponse.json(
        { error: "application_id and action are required" },
        { status: 400 }
      )
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    const status = action === "approve" ? "approved" : "rejected"

    // Update the application
    const { data: application, error: updateErr } = await supabaseAdmin
      .from("seller_applications")
      .update({
        status,
        admin_feedback: admin_feedback || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", application_id)
      .select("*, users!seller_applications_user_id_fkey(full_name, email)")
      .single()

    if (updateErr) throw updateErr

    let generatedPassword: string | null = null

    if (action === "approve") {
      // Generate a random password for the new seller
      generatedPassword = generatePassword()

      await supabaseAdmin
        .from("users")
        .update({
          role: "seller",
          is_seller: true,
          seller_application_status: "approved",
          seller_generated_password: generatedPassword,
        })
        .eq("id", application.user_id)
    } else {
      await supabaseAdmin
        .from("users")
        .update({ role: "customer", seller_application_status: "rejected" })
        .eq("id", application.user_id)
    }

    return NextResponse.json({
      application,
      generatedPassword,
      message: `Application ${status}`,
    })
  } catch (error) {
    console.error("Error updating seller application:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the application" },
      { status: 500 }
    )
  }
}
