import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { applicationId, adminId } = await request.json()

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
      return NextResponse.json({ error: "Only admins can approve applications" }, { status: 403 })
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
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", applicationId)

    if (updateErr) throw updateErr

    // Grant pattern testing access to the user
    await supabaseAdmin
      .from("users")
      .update({
        pattern_testing_approved: true,
        tester_level: 1,
        tester_xp: 0,
      })
      .eq("id", application.user_id)

    return NextResponse.json({
      message: "Application approved successfully",
      application: { ...application, status: "approved" },
    })
  } catch (error) {
    console.error("Error approving pattern testing application:", error)
    return NextResponse.json({ error: "An error occurred while approving the application" }, { status: 500 })
  }
}
