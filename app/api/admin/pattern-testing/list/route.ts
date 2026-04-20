import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data: apps, error } = await supabaseAdmin
      .from("pattern_testing_applications")
      .select("*, users!pattern_testing_applications_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })

    if (error) throw error

    const applications = (apps || []).map((app: any) => ({
      id: app.id,
      userId: app.user_id,
      userName: app.users?.full_name || app.users?.email || "Unknown",
      userEmail: app.users?.email || "",
      whyTesting: app.why_testing,
      experienceLevel: app.experience_level,
      availability: app.availability,
      comments: app.comments,
      status: app.status,
      createdAt: app.created_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewed_by,
    }))

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching pattern testing applications:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
