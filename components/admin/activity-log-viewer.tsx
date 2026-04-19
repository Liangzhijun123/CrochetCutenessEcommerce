'use client';

import React, { useState, useEffect } from 'react';
import { supabaseDB } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context-supabase';
import { subscribeToActivityLog } from '@/lib/supabase';
import { Activity, Filter } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description: string;
  created_at: string;
}

export function ActivityLogViewer() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    loadLogs();

    const subscription = subscribeToActivityLog((newLog) => {
      setLogs((prev) => [newLog, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [logs, filterType, filterAction]);

  const loadLogs = async () => {
    try {
      const data = await supabaseDB.getActivityLogs(200);
      setLogs(data);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    if (filterType !== 'all') {
      filtered = filtered.filter((log) => log.resource_type === filterType);
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    setFilteredLogs(filtered);
  };

  const getResourceIcon = (resourceType: string) => {
    const icons: { [key: string]: string } = {
      product: '📦',
      chat: '💬',
      donation: '❤️',
      user: '👤',
      seller: '🏪',
      order: '📋',
    };
    return icons[resourceType] || '📌';
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      deleted: 'bg-red-100 text-red-800',
      uploaded: 'bg-purple-100 text-purple-800',
      purchased: 'bg-yellow-100 text-yellow-800',
      donated: 'bg-pink-100 text-pink-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin) {
    return <p className="text-gray-500">Admin access required</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-pink-500" />
        <h2 className="text-2xl font-bold">Activity Log</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="chat">Chat</option>
            <option value="donation">Donations</option>
            <option value="user">Users</option>
            <option value="seller">Sellers</option>
            <option value="order">Orders</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
            <option value="uploaded">Uploaded</option>
            <option value="purchased">Purchased</option>
            <option value="donated">Donated</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No activity logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="flex items-center gap-2">
                        {getResourceIcon(log.resource_type)}
                        {log.resource_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {log.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Activities', count: logs.length, color: 'bg-blue-50' },
          {
            label: 'Products',
            count: logs.filter((l) => l.resource_type === 'product').length,
            color: 'bg-green-50',
          },
          {
            label: 'Donations',
            count: logs.filter((l) => l.resource_type === 'donation').length,
            color: 'bg-pink-50',
          },
          {
            label: 'Chats',
            count: logs.filter((l) => l.resource_type === 'chat').length,
            color: 'bg-purple-50',
          },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-lg p-4 text-center`}>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
