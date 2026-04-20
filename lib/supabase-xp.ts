import { supabaseAdmin } from './supabase-admin'

// XP amounts per activity
export const XP_RATES = {
  pattern_pdf: 4,
  plushie: 10,
  pattern_testing: 2,
  signup_bonus: 50,
  review: 10,
  referral: 20,
} as const

export type XPActivity = keyof typeof XP_RATES

// Tier thresholds
export const XP_TIERS = [
  { name: 'bronze', label: 'Bronze', min: 0, max: 200 },
  { name: 'silver', label: 'Silver', min: 200, max: 1000 },
  { name: 'gold', label: 'Gold', min: 1000, max: 3000 },
  { name: 'platinum', label: 'Platinum', min: 3000, max: 10000 },
] as const

export function computeTier(xp: number): string {
  if (xp >= 3000) return 'platinum'
  if (xp >= 1000) return 'gold'
  if (xp >= 200) return 'silver'
  return 'bronze'
}

// ── Ensure a user_xp row exists (idempotent) ─────────────────
export async function ensureUserXP(userId: string) {
  const { data: existing } = await supabaseAdmin
    .from('user_xp')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabaseAdmin
    .from('user_xp')
    .insert({ user_id: userId, total_xp: 0, tier: 'bronze' })
    .select()
    .single()

  if (error) {
    // Race condition: another request created the row first
    if (error.code === '23505') {
      const { data: retry } = await supabaseAdmin
        .from('user_xp')
        .select('*')
        .eq('user_id', userId)
        .single()
      return retry
    }
    throw error
  }
  return data
}

// ── Award XP for an activity ─────────────────────────────────
export async function awardXP(
  userId: string,
  activity: XPActivity,
  orderId?: string,
) {
  const xpAmount = XP_RATES[activity]

  // 1. Make sure user_xp row exists
  await ensureUserXP(userId)

  // 2. Insert transaction record
  const { error: txError } = await supabaseAdmin
    .from('xp_transactions')
    .insert({
      user_id: userId,
      activity_type: activity,
      xp_amount: xpAmount,
      description: getActivityDescription(activity),
      order_id: orderId || null,
    })

  if (txError) throw txError

  // 3. Increment total_xp (the DB trigger auto-updates tier)
  const { data: updated, error: updateError } = await supabaseAdmin.rpc(
    'increment_user_xp',
    { target_user_id: userId, xp_to_add: xpAmount },
  )

  // Fallback if RPC doesn't exist yet: manual update
  if (updateError) {
    const { data: current } = await supabaseAdmin
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single()

    const newTotal = (current?.total_xp || 0) + xpAmount
    const { error: manualErr } = await supabaseAdmin
      .from('user_xp')
      .update({ total_xp: newTotal, tier: computeTier(newTotal) })
      .eq('user_id', userId)

    if (manualErr) throw manualErr
    return { total_xp: newTotal, xp_awarded: xpAmount, tier: computeTier(newTotal) }
  }

  return { total_xp: updated, xp_awarded: xpAmount }
}

// ── Get a single user's XP data ──────────────────────────────
export async function getUserXP(userId: string) {
  await ensureUserXP(userId)

  const { data, error } = await supabaseAdmin
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

// ── Get user XP transaction history ──────────────────────────
export async function getUserXPHistory(userId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ── Leaderboard: top N users by XP (excludes admins) ─────────
export async function getLeaderboard(limit = 50) {
  // Get admin user IDs to exclude
  const { data: adminUsers } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'admin')

  const adminIds = (adminUsers || []).map((u) => u.id)

  let query = supabaseAdmin
    .from('user_xp')
    .select('user_id, total_xp, tier')
    .order('total_xp', { ascending: false })
    .limit(limit)

  if (adminIds.length > 0) {
    query = query.not('user_id', 'in', `(${adminIds.join(',')})`)
  }

  const { data, error } = await query
  if (error) throw error

  // Fetch display names for all returned users
  const userIds = (data || []).map((r) => r.user_id)
  if (userIds.length === 0) return []

  const { data: profiles } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds)

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p]),
  )

  return (data || []).map((entry, idx) => {
    const profile = profileMap.get(entry.user_id)
    return {
      rank: idx + 1,
      userId: entry.user_id,
      username: profile?.full_name || profile?.email?.split('@')[0] || 'Anonymous',
      xp: entry.total_xp,
      tier: entry.tier,
    }
  })
}

// ── Get a specific user's rank ───────────────────────────────
export async function getUserRank(userId: string) {
  // Count how many users have more XP
  const userXP = await getUserXP(userId)

  const { count, error } = await supabaseAdmin
    .from('user_xp')
    .select('*', { count: 'exact', head: true })
    .gt('total_xp', userXP.total_xp)

  if (error) throw error
  return (count || 0) + 1
}

function getActivityDescription(activity: XPActivity): string {
  switch (activity) {
    case 'pattern_pdf': return 'Pattern PDF purchase'
    case 'plushie': return 'Plushie purchase'
    case 'pattern_testing': return 'Pattern testing task completed'
    case 'signup_bonus': return 'Welcome sign-up bonus'
    case 'review': return 'Product review'
    case 'referral': return 'Referral bonus'
    default: return activity
  }
}
