import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, whyTesting, experienceLevel, availability, comments } = await request.json()

    if (!userId || !whyTesting || !experienceLevel || !availability) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email")
      .eq("id", userId)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check for existing pending application
    const { data: existing } = await supabaseAdmin
      .from("pattern_testing_applications")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You already have a pending application" }, { status: 409 })
    }

    const { data: newApp, error: insertErr } = await supabaseAdmin
      .from("pattern_testing_applications")
      .insert({
        user_id: userId,
        why_testing: whyTesting,
        experience_level: experienceLevel,
        availability,
        comments: comments || null,
        status: "pending",
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({
      message: "Application submitted successfully. Pending admin review.",
      application: {
        id: newApp.id,
        userId: newApp.user_id,
        userName: user.full_name || user.email,
        userEmail: user.email,
        whyTesting: newApp.why_testing,
        experienceLevel: newApp.experience_level,
        availability: newApp.availability,
        comments: newApp.comments,
        status: newApp.status,
        createdAt: newApp.created_at,
      },
    })
  } catch (error) {
    console.error("Error submitting pattern testing application:", error)
    return NextResponse.json({ error: "An error occurred while submitting the application" }, { status: 500 })
  }
}
