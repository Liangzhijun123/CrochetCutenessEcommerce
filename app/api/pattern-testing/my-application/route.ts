import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const { data: app, error } = await supabaseAdmin
      .from("pattern_testing_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (!app) {
      return NextResponse.json({ application: null })
    }

    // Get user info
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("full_name, email")
      .eq("id", userId)
      .single()

    return NextResponse.json({
      application: {
        id: app.id,
        userId: app.user_id,
        userName: user?.full_name || user?.email || "Unknown",
        userEmail: user?.email || "",
        whyTesting: app.why_testing,
        experienceLevel: app.experience_level,
        availability: app.availability,
        comments: app.comments,
        status: app.status,
        createdAt: app.created_at,
        reviewedAt: app.reviewed_at,
      },
    })
  } catch (error) {
    console.error("Error fetching pattern testing application:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
