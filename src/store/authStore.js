// authStore.js
// Zustand auth store — mirrors Redux authSlice logic exactly

import { create } from 'zustand'
import { loginUser } from '../api/api'

const useAuthStore = create((set) => ({
  // ── State (same as Redux initialState) ──────────────────────────────────────
  user:            JSON.parse(localStorage.getItem('user')) || null,
  token:           localStorage.getItem('token')            || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading:       false,
  error:           null,

  // ── Login (mirrors login asyncThunk) ────────────────────────────────────────
  login: async ({ email, password, role = 'admin' }) => {
    set({ isLoading: true, error: null })
    try {
      const response = await loginUser({
        type:     'email',   // ← this was missing in Login.jsx — causes "Mobile number is required"
        email,
        password,
        role,
        fcmToken: '',
      })

      // Same payload unwrap as Redux fulfilled case
      const user  = response?.data?.user  || response?.user
      const token = response?.data?.token || response?.token

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      })

      return { success: true, user }
    } catch (error) {
      // Same error unwrap as Redux rejected case
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error   ||
        error.message                 ||
        'Login failed'

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      set({
        isLoading:       false,
        error:           errorMessage,
        isAuthenticated: false,
        user:            null,
        token:           null,
      })

      return { success: false, error: errorMessage }
    }
  },

  // ── Logout (mirrors logout fulfilled case) ───────────────────────────────────
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      user:            null,
      token:           null,
      isAuthenticated: false,
      error:           null,
      isLoading:       false,
    })
  },

  // ── clearError (mirrors clearError reducer) ──────────────────────────────────
  clearError: () => set({ error: null }),

  // ── setCredentials (mirrors setCredentials reducer) ──────────────────────────
  setCredentials: ({ user, token }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  // ── clearAuth (mirrors clearAuth reducer) ────────────────────────────────────
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

export default useAuthStore