import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseDB } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { amount, tier, message, is_anonymous } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // Create donation record
    const donation = await supabaseDB.createDonation({
      donor_id: userId,
      amount,
      tier: tier || 'custom',
      message: message || null,
      is_anonymous: is_anonymous || false,
      status: 'completed', // In production, integrate with Stripe/payment gateway
    });

    // Log activity
    if (userId) {
      await supabaseDB.logActivity(
        userId,
        'donated',
        'donation',
        donation.id,
        `Donated $${amount} to ${tier || 'custom'} tier`
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your donation!',
        donation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Donation error:', error);
    return NextResponse.json({ error: 'Failed to process donation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const donations = await supabaseDB.getDonations(10);
    const stats = await supabaseDB.getDonationStats();

    return NextResponse.json({
      donations,
      stats,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
