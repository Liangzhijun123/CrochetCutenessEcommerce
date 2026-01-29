"use client"

import { useAuth } from "@/context/auth-context"
import { useCallback } from "react"

interface AuthFetchOptions extends RequestInit {
  requireAuth?: boolean
}

/**
 * Custom hook for making authenticated API requests
 */
export function useAuthFetch() {
  const { token, logout } = useAuth()

  const authFetch = useCallback(async (
    url: string, 
    options: AuthFetchOptions = {}
  ): Promise<Response> => {
    const { requireAuth = true, headers = {}, ...restOptions } = options

    // Prepare headers
    const authHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Add authorization header if token is available and auth is required
    if (requireAuth && token) {
      authHeaders['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: authHeaders,
      })

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && requireAuth) {
        console.warn('Received 401 Unauthorized, logging out user')
        logout()
        throw new Error('Authentication expired. Please log in again.')
      }

      return response
    } catch (error) {
      console.error('Auth fetch error:', error)
      throw error
    }
  }, [token, logout])

  return authFetch
}

/**
 * Convenience hook for making authenticated API calls with JSON responses
 */
export function useAuthApi() {
  const authFetch = useAuthFetch()

  const get = useCallback(async (url: string, options: AuthFetchOptions = {}) => {
    const response = await authFetch(url, { ...options, method: 'GET' })
    return response.json()
  }, [authFetch])

  const post = useCallback(async (url: string, data?: any, options: AuthFetchOptions = {}) => {
    const response = await authFetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }, [authFetch])

  const put = useCallback(async (url: string, data?: any, options: AuthFetchOptions = {}) => {
    const response = await authFetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }, [authFetch])

  const del = useCallback(async (url: string, options: AuthFetchOptions = {}) => {
    const response = await authFetch(url, { ...options, method: 'DELETE' })
    return response.json()
  }, [authFetch])

  return { get, post, put, delete: del, authFetch }
}