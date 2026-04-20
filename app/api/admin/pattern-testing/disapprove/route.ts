import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, adminId, reason } = await request.json()

    if (!applicationId || !adminId) {
      return NextResponse.json({ error: "Application ID and Admin ID are required" }, { status: 400 })
    }

    // Verify admin
    const { data: admin } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", adminId)
      .single()

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Only admins can disapprove applications" }, { status: 403 })
    }

    // Get the application
    const { data: application, error: appErr } = await supabaseAdmin
      .from("pattern_testing_applications")
      .select("*")
      .eq("id", applicationId)
      .single()

    if (appErr || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Update application status
    const { error: updateErr } = await supabaseAdmin
      .from("pattern_testing_applications")
      .update({
        status: "disapproved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        comments: reason || application.comments,
      })
      .eq("id", applicationId)

    if (updateErr) throw updateErr

    return NextResponse.json({
      message: "Application disapproved successfully",
      application: { ...application, status: "disapproved" },
    })
  } catch (error) {
    console.error("Error disapproving pattern testing application:", error)
    return NextResponse.json({ error: "An error occurred while disapproving the application" }, { status: 500 })
  }
}
