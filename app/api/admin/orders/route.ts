import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, users(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      // If orders table doesn't exist yet, return empty array
      if (error.code === "42P01") {
        return NextResponse.json({ orders: [] })
      }
      throw error
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ orders: [] })
  }
}
