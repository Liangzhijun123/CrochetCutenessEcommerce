import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or anon key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const supabaseDB = {
  // User operations
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Seller operations
  async getSellerByUserId(userId: string) {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createSeller(userId: string, shopName: string, description: string) {
    const { data, error } = await supabase
      .from('sellers')
      .insert([{ user_id: userId, shop_name: shopName, shop_description: description }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Product operations (FIFO - First Upload First Shown)
  async getProductsByUploadOrder(limit: number = 20) {
    const { data, error } = await supabase
      .from('products')
      .select('*, sellers(shop_name, user_id)')
      .order('upload_order', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getProductsBySeller(sellerId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createProduct(productData: any) {
    // Get the max upload order to maintain FIFO
    const { data: maxOrder } = await supabase
      .from('products')
      .select('upload_order')
      .order('upload_order', { ascending: false })
      .limit(1)
      .single();

    const uploadOrder = (maxOrder?.upload_order || 0) + 1;

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, upload_order: uploadOrder }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Chat operations
  async createChatSession(sessionData: any) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([sessionData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getChatSession(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    if (error) throw error;
    return data;
  },

  async getUserChatSessions(userId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .or(`admin_id.eq.${userId},customer_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateChatSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async sendChatMessage(sessionId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ session_id: sessionId, sender_id: senderId, content }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getChatMessages(sessionId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data.reverse();
  },

  // Donation operations
  async createDonation(donationData: any) {
    const { data, error } = await supabase
      .from('donations')
      .insert([donationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getDonations(limit: number = 10) {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getDonationStats() {
    const { data, error } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed');
    
    if (error) throw error;
    
    const total = data.reduce((sum, d) => sum + (d.amount || 0), 0);
    const count = data.length;
    
    return { total, count, average: count > 0 ? total / count : 0 };
  },

  // Activity logging
  async logActivity(userId: string, action: string, resourceType: string, resourceId?: string, description?: string) {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{ user_id: userId, action, resource_type: resourceType, resource_id: resourceId, description }]);
    if (error) throw error;
  },

  async getActivityLogs(limit: number = 100) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  // Chat requests (for sellers/customers to request admin help)
  async createChatRequest(requesterId: string, requesterType: 'seller' | 'customer', reason: string) {
    const { data, error } = await supabase
      .from('chat_requests')
      .insert([{ requester_id: requesterId, requester_type: requesterType, reason }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPendingChatRequests() {
    const { data, error } = await supabase
      .from('chat_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async acceptChatRequest(requestId: string, adminId: string) {
    const { data: request, error: fetchError } = await supabase
      .from('chat_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Update request status
    const { error: updateError } = await supabase
      .from('chat_requests')
      .update({ status: 'accepted', responded_at: new Date() })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Create chat session
    const sessionData = {
      admin_id: adminId,
      customer_id: request.requester_type === 'customer' ? request.requester_id : null,
      seller_id: request.requester_type === 'seller' ? request.requester_id : null,
      session_type: request.requester_type === 'customer' ? 'admin_customer' : 'admin_seller',
      status: 'open',
    };

    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (sessionError) throw sessionError;
    return session;
  },

  // Seller application operations
  async createSellerApplication(data: {
    user_id: string;
    experience: string;
    reason: string;
    introduction: string;
  }) {
    const { data: app, error } = await supabase
      .from('seller_applications')
      .insert([{ ...data, status: 'pending' }])
      .select()
      .single();
    if (error) throw error;
    return app;
  },

  async getSellerApplication(userId: string) {
    const { data, error } = await supabase
      .from('seller_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getPendingSellerApplications() {
    const { data, error } = await supabase
      .from('seller_applications')
      .select('*, users(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateSellerApplicationStatus(applicationId: string, status: 'approved' | 'rejected', adminFeedback?: string) {
    const { data, error } = await supabase
      .from('seller_applications')
      .update({ status, admin_feedback: adminFeedback, reviewed_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Real-time subscriptions
export const subscribeToMessages = (sessionId: string, callback: (message: any) => void) => {
  return supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
};

export const subscribeToActivityLog = (callback: (activity: any) => void) => {
  return supabase
    .channel('activity-log')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
};
