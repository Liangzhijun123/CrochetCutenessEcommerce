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

function generateUsername(fullName: string, email: string): string {
  // Use full name or email prefix to create a seller username
  const base = fullName
    ? fullName.toLowerCase().replace(/[^a-z0-9]/g, "")
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
  const suffix = crypto.randomBytes(3).toString("hex").slice(0, 4)
  return `seller_${base.slice(0, 12)}_${suffix}`
}

export async function GET() {
  try {
    const { data: applications, error } = await supabaseAdmin
      .from("seller_applications")
      .select("*, users!seller_applications_user_id_fkey(full_name, email, seller_username, seller_generated_password)")
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

    if (action !== "approve" && action !== "reject" && action !== "generate_credentials") {
      return NextResponse.json(
        { error: "action must be 'approve', 'reject', or 'generate_credentials'" },
        { status: 400 }
      )
    }

    // Handle credential generation for already-approved sellers
    if (action === "generate_credentials") {
      const { data: application, error: fetchErr } = await supabaseAdmin
        .from("seller_applications")
        .select("*, users!seller_applications_user_id_fkey(full_name, email)")
        .eq("id", application_id)
        .single()

      if (fetchErr || !application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }

      if (application.status !== "approved") {
        return NextResponse.json({ error: "Application must be approved first" }, { status: 400 })
      }

      const generatedPassword = generatePassword()
      const fullName = application.users?.full_name || ""
      const email = application.users?.email || ""
      const generatedUsername = generateUsername(fullName, email)

      await supabaseAdmin
        .from("users")
        .update({
          seller_generated_password: generatedPassword,
          seller_username: generatedUsername,
        })
        .eq("id", application.user_id)

      return NextResponse.json({
        application,
        generatedPassword,
        generatedUsername,
        message: "Credentials generated successfully",
      })
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
    let generatedUsername: string | null = null

    if (action === "approve") {
      // Generate credentials for the new seller
      generatedPassword = generatePassword()
      const fullName = application.users?.full_name || ""
      const email = application.users?.email || ""
      generatedUsername = generateUsername(fullName, email)

      // Create a seller record if one doesn't already exist
      const { data: existingSeller } = await supabaseAdmin
        .from("sellers")
        .select("id")
        .eq("user_id", application.user_id)
        .maybeSingle()

      let sellerId = existingSeller?.id
      if (!sellerId) {
        const { data: newSeller } = await supabaseAdmin
          .from("sellers")
          .insert({
            user_id: application.user_id,
            shop_name: fullName ? `${fullName}'s Shop` : `${email.split("@")[0]}'s Shop`,
          })
          .select("id")
          .single()
        sellerId = newSeller?.id
      }

      await supabaseAdmin
        .from("users")
        .update({
          role: "seller",
          is_seller: true,
          seller_application_status: "approved",
          seller_generated_password: generatedPassword,
          seller_username: generatedUsername,
          ...(sellerId ? { seller_id: sellerId } : {}),
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
      generatedUsername,
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
