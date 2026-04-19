'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseDB, subscribeToMessages } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context-supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  admin_id?: string;
  seller_id?: string;
  customer_id?: string;
  status: 'open' | 'closed' | 'pending';
}

interface ChatWindowProps {
  sessionId: string;
  onClose: () => void;
}

export function ChatWindow({ sessionId, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChat();
    const subscription = subscribeToMessages(sessionId, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    try {
      const chatSession = await supabaseDB.getChatSession(sessionId);
      setSession(chatSession);

      const chatMessages = await supabaseDB.getChatMessages(sessionId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setIsLoading(true);
    try {
      await supabaseDB.sendChatMessage(sessionId, user.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const closeChat = async () => {
    try {
      await supabaseDB.updateChatSession(sessionId, {
        status: 'closed',
        closed_at: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Support Chat</h3>
        <button
          onClick={onClose}
          className="hover:bg-pink-600 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender_id === user?.id
                  ? 'bg-pink-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="break-words">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-gray-50 rounded-b-lg space-y-2">
        {session?.status === 'closed' && (
          <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded text-sm">
            <AlertCircle className="w-4 h-4" />
            This chat has been closed
          </div>
        )}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            disabled={session?.status === 'closed' || isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading || session?.status === 'closed'}
            className="bg-pink-500 hover:bg-pink-600"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SellerRequestChatFormProps {
  onSubmit?: (reason: string) => void;
}

export function SellerRequestChatForm({ onSubmit }: SellerRequestChatFormProps) {
  const { user, userProfile } = useAuth();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !reason.trim()) return;

    setIsLoading(true);
    try {
      await supabaseDB.createChatRequest(user.id, 'seller', reason);
      alert('Request sent! An admin will respond shortly.');
      setReason('');
      onSubmit?.(reason);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile?.is_seller) {
    return <p className="text-gray-500">Only sellers can request support</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-lg">Request Admin Support</h3>
      <p className="text-sm text-gray-600">
        Tell us what you need help with, and an admin will respond within 24 hours.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Describe your issue..."
        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
        rows={4}
        required
      />
      <Button
        type="submit"
        disabled={!reason.trim() || isLoading}
        className="w-full bg-pink-500 hover:bg-pink-600"
      >
        {isLoading ? 'Sending...' : 'Request Support'}
      </Button>
    </form>
  );
}

interface CustomerRequestMediationFormProps {
  onSubmit?: (reason: string) => void;
}

export function CustomerRequestMediationForm({ onSubmit }: CustomerRequestMediationFormProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !reason.trim()) return;

    setIsLoading(true);
    try {
      await supabaseDB.createChatRequest(user.id, 'customer', reason);
      alert('Mediation request sent! An admin will review your case shortly.');
      setReason('');
      onSubmit?.(reason);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-lg">Request Admin Mediation</h3>
      <p className="text-sm text-gray-600">
        If you're having issues with a seller or transaction, we're here to help. Describe what happened:
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Describe your issue and what resolution you're looking for..."
        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
        rows={4}
        required
      />
      <Button
        type="submit"
        disabled={!reason.trim() || isLoading}
        className="w-full bg-pink-500 hover:bg-pink-600"
      >
        {isLoading ? 'Sending...' : 'Request Mediation'}
      </Button>
    </form>
  );
}

export function AdminChatPanel() {
  const { user, isAdmin } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    loadRequests();
  }, [isAdmin]);

  const loadRequests = async () => {
    try {
      const requests = await supabaseDB.getPendingChatRequests();
      setPendingRequests(requests);

      if (user) {
        const sessions = await supabaseDB.getUserChatSessions(user.id);
        setActiveSessions(sessions.filter((s) => s.status === 'open'));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      if (!user) return;
      const session = await supabaseDB.acceptChatRequest(requestId, user.id);
      setSelectedSession(session.id);
      await loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  if (!isAdmin) {
    return <p className="text-gray-500">Admin access required</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Support Requests</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests</p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="border rounded-lg p-4 bg-white hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {req.requester_type === 'seller' ? '🏪 Seller' : '👤 Customer'} Request
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{req.reason}</p>
                  </div>
                  <Button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="bg-pink-500 hover:bg-pink-600"
                    size="sm"
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Active Chats</h3>
        {activeSessions.length === 0 ? (
          <p className="text-gray-500">No active chats</p>
        ) : (
          <div className="space-y-2">
            {activeSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session.id)}
                className={`w-full text-left border rounded-lg p-4 transition ${
                  selectedSession === session.id
                    ? 'bg-pink-100 border-pink-500'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold">
                  {session.session_type === 'admin_seller' ? '🏪 Seller' : '👤 Customer'} Chat
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <ChatWindow sessionId={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}
