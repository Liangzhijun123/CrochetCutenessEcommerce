import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, onboardingData } = body

    if (!userId || !onboardingData) {
      return NextResponse.json({ error: "User ID and onboarding data are required" }, { status: 400 })
    }

    // Fetch user from Supabase
    const { data: user, error: fetchErr } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (fetchErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mark onboarding as completed in Supabase
    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({ seller_onboarding_completed: true })
      .eq("id", userId)

    if (updateErr) {
      console.error("Error updating onboarding status:", updateErr)
      return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 })
    }

    // Save/update the seller store profile in the sellers table
    const sellerId = user.seller_id
    if (sellerId) {
      const { error: sellerUpdateErr } = await supabaseAdmin
        .from("sellers")
        .update({
          shop_name: onboardingData.storeName || null,
          shop_description: onboardingData.storeDescription || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sellerId)

      if (sellerUpdateErr) {
        console.error("Error updating seller profile:", sellerUpdateErr)
      }
    } else {
      // Create seller record if it doesn't exist
      const { data: newSeller, error: sellerCreateErr } = await supabaseAdmin
        .from("sellers")
        .insert({
          user_id: userId,
          shop_name: onboardingData.storeName || null,
          shop_description: onboardingData.storeDescription || null,
        })
        .select("id")
        .single()

      if (sellerCreateErr) {
        console.error("Error creating seller record:", sellerCreateErr)
      } else if (newSeller) {
        // Link seller record to user
        await supabaseAdmin
          .from("users")
          .update({ seller_id: newSeller.id })
          .eq("id", userId)
      }
    }

    // Save store settings (specialties, slogan, target audience, bank info)
    const storeSettings = {
      store_slogan: onboardingData.storeSlogan || null,
      specialties: onboardingData.specialties || null,
      target_audience: onboardingData.targetAudience || null,
      bank_info_provided: !!(onboardingData.bankInfo?.accountNumber),
    }

    // Store additional settings in the sellers table or a separate table
    if (sellerId || user.seller_id) {
      const sid = sellerId || user.seller_id
      await supabaseAdmin
        .from("sellers")
        .update(storeSettings)
        .eq("id", sid)
    }

    // Send welcome email (non-blocking)
    try {
      await sendEmail(user.email, "seller-onboarding-welcome", {
        name: user.full_name,
        storeName: onboardingData.storeName || "your store",
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/seller-dashboard`,
        supportUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/contact`,
        guideUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/seller-guide`,
      })
    } catch {
      // Don't fail onboarding if email fails
    }

    return NextResponse.json({
      user: { ...user, seller_onboarding_completed: true },
      message: "Onboarding completed successfully",
    })
  } catch (error) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json({ error: "An error occurred while completing onboarding" }, { status: 500 })
  }
}