// api.js
// Real API — Auth + Players + Categories + Sports
// All requests go to your backend. No mock data.

import axios from 'axios'

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aanandgames.onrender.com/aanand-sports/'
// For Create React App use: process.env.REACT_APP_API_BASE_URL

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
})

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Do NOT manually set Content-Type — axios sets it automatically,
    // including the correct multipart boundary for FormData uploads.
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — unwrap data, handle auth errors ───────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || error.message || 'Something went wrong'

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    const err    = new Error(message)
    err.status   = status
    err.data     = error.response?.data
    return Promise.reject(err)
  }
)

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /auth/login
 * Body (JSON): { type: 'email', email, password, role, fcmToken }
 * Returns { token: string, user: User, message: string }
 *
 * Usage:
 *   await loginUser({ email: 'admin@example.com', password: '123456' })
 */
export const loginUser = ({ email, password, role = 'admin', fcmToken = '' }) =>
  api.post('/auth/login', {
    type: 'email',   // required — missing this causes "Mobile number is required"
    email,
    password,
    role,
    fcmToken,
  })

/**
 * POST /auth/logout
 * Invalidates token on server side (if backend supports it)
 * Header: Bearer token required
 * Returns { message: string }
 */
export const logoutUser = () =>
  api.post('/auth/logout')

/**
 * POST /auth/register
 * Body (JSON): { name, email, password, role? }
 * Returns { token: string, user: User, message: string }
 */
export const registerUser = ({ name, email, password, role = 'admin' }) =>
  api.post('/auth/register', { name, email, password, role })

/**
 * POST /auth/forgot-password
 * Body (JSON): { email }
 * Returns { message: string }
 */
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

/**
 * POST /auth/reset-password
 * Body (JSON): { token, newPassword }
 * Returns { message: string }
 */
export const resetPassword = ({ token, newPassword }) =>
  api.post('/auth/reset-password', { token, newPassword })

/**
 * POST /auth/change-password
 * Body (JSON): { oldPassword, newPassword }
 * Header: Bearer token required
 * Returns { message: string }
 */
export const changePassword = ({ oldPassword, newPassword }) =>
  api.post('/auth/change-password', { oldPassword, newPassword })

/**
 * GET /auth/me
 * Header: Bearer token required
 * Returns { data: User }
 */
export const getMe = () =>
  api.get('/auth/me')

/**
 * PUT /auth/update-profile
 * Body (FormData or JSON): { name?, email?, image? }
 * Header: Bearer token required
 * Returns { data: User, message: string }
 */
export const updateProfile = (data) =>
  api.put('/auth/update-profile', data)

// ══════════════════════════════════════════════════════════════════════════════
// PLAYERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /players
 * GET /players?search=Luca
 * Returns { data: Player[], total: number }
 */
export const getUsers = (search = '') =>
  api.get('/users/get', { params: search ? { search } : {} })

/**
 * GET /players/:id
 * Returns { data: Player }
 */
export const getPlayerById = (id) =>
  api.get(`/users/${id}`)

/**
 * POST /players
 * Body (JSON): { name, num, position, nationality, age, status }
 * Returns { data: Player, message: string }
 */
export const createPlayer = (playerData) =>
  api.post('/players', playerData)

/**
 * PUT /players/:id
 * Body (JSON): { ...fields to update }
 * Returns { data: Player, message: string }
 */
export const updatePlayer = (id, updates) =>
  api.put(`/players/${id}`, updates)

/**
 * DELETE /players/:id
 * Returns { message: string }
 */
export const deleteUser = (id) =>
  api.delete(`/users/${id}`)

/**
 * GET /players/stats/summary
 * Returns { data: { totalPlayers, totalGoals, totalAssists, avgRating, activeCount, injuredCount } }
 */
export const getTeamStats = () =>
  api.get('/players/stats/summary')

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /categories
 * Returns { data: Category[] }
 */
export const getCategories = () =>
  api.get('/categories/getAll')

/**
 * GET /categories/:id
 * Returns { data: Category }
 */
export const getCategoryById = (id) =>
  api.get(`/categories/${id}`)

/**
 * POST /categories
 * Body (FormData): { name, description, image? }
 * Returns { data: Category, message: string }
 */
export const createCategory = (formData) =>
  api.post('/categories/create', formData)

/**
 * PUT /categories/:id
 * Body (FormData): { name, description, isActive?, image? }
 * Returns { data: Category, message: string }
 */
export const updateCategory = (id, formData) =>
  api.put(`/categories/update/${id}`, formData)

/**
 * DELETE /categories/:id
 * Returns { message: string }
 */
export const deleteCategory = (id) =>
  api.delete(`/categories/delete/${id}`)

// ══════════════════════════════════════════════════════════════════════════════
// SPORTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /sports
 * Returns { data: Sport[] }
 */
export const getSports = () =>
  api.get('/sports/getAll')

/**
 * GET /sports/:id
 * Returns { data: Sport }
 */
export const getSportById = (id) =>
  api.get(`/sports/${id}`)

/**
 * POST /sports/create
 * Body (FormData): { name, description, image?(optional), isActive?(optional, default true) }
 * Returns { data: Sport, message: string }
 *
 * Usage:
 *   const formData = new FormData()
 *   formData.append('name', 'Table-tennis')
 *   formData.append('description', 'Best game for India')
 *   formData.append('image', fileInput)      // optional
 *   formData.append('isActive', 'true')      // optional, default true
 *   await createSport(formData)
 */
export const createSport = (formData) =>
  api.post('/sports/create', formData)

/**
 * PUT /sports/:id
 * Body (FormData): { name?, description?, image?, isActive? }
 * Returns { data: Sport, message: string }
 *
 * Usage:
 *   const formData = new FormData()
 *   formData.append('name', 'Updated name')
 *   formData.append('isActive', 'false')
 *   await updateSport(id, formData)
 */
export const updateSport = (id, formData) =>
  api.put(`/sports/update/${id}`, formData)

/**
 * DELETE /sports/:id
 * Returns { message: string }
 */
export const deleteSport = (id) =>
  api.delete(`/sports/delete/${id}`)

/**
 * PATCH /sports/:id/toggle-status
 * Toggles isActive between true and false
 * Returns { data: Sport, message: string }
 */
export const toggleSportStatus = (id) =>
  api.patch(`/sports/${id}/toggle-status`)

export const getVenues        = () => api.get('/venues/getAll')
export const createVenue      = (fd) => api.post('/venues/create', fd)
export const updateVenue      = (id, fd) => api.put(`/venues/update/${id}`, fd)
export const deleteVenue      = (id) => api.delete(`/venues/${id}`)
export const toggleVenueStatus = (id) => api.patch(`/venues/${id}/toggle`)



// ── API helpers (direct — no ENDPOINTS import) ────────────────────────────────
export const fetchAllPolicies = ()         => api.get('/privacy-and-policies/getAll')
export const createPolicy     = (data)     => api.post('/privacy-and-policies/create', data)
 export const updatePolicy     = (id, data) => api.put(`/privacy-and-policies/update/${id}`, data)
export const deletePolicy     = (id)       => api.delete(`/privacy-and-policies/delete/${id}`)


 export const fetchAllTerms  = ()           => api.get('terms-and-conditions/getAll')
 export const createTerm     = (data)       => api.post('/terms-and-conditions/create', data)
 export const updateTerm     = (id, data)   => api.put(`${'terms-and-conditions/update'}/${id}`, data)
 export const deleteTerm     = (id)         => api.delete(`${'terms-and-conditions/delete'}/${id}`)

 export const getLocations = () => api.get('/locations/getAll')   // ✅ FIXED

 export const locationsAPI = {
  createLocation: (locationData) => api.post('/locations/create', locationData,
     { 
      headers: {
        'Content-Type': 'application/json', // ✅ IMPORTANT: Must be JSON
      }
    }
  ),
  getAllLocations: () => api.get('/locations/getAll'),
  getLocationById: (id) => api.get(`/locations/${id}`),
  updateLocation: (id, locationData) => api.put(`/locations/${id}`, locationData,
     { 
      headers: {
        'Content-Type': 'application/json', // ✅ IMPORTANT: Must be JSON
      }
    }
  ),
  deleteLocation: (id) => api.delete(`/locations/delete/${id}`),
};


export const getBanners  = ()           => api.get('/banners/getAll')
 export const createBanner     = (data)       => api.post('/banners/create', data)
 export const updateBanner     = (id, data)   => api.put(`${'banners/update'}/${id}`, data)
 export const deleteBanner     = (id)         => api.delete(`${'banners/delete'}/${id}`)


//  sport Ground 
export const getGrounds   = ()       => api.get('/sportGrounds/getAll')
export const createGround = (fd)     => api.post('/sportGrounds/create', fd)
export const updateGround = (id, fd) => api.put(`/sportGrounds/update/${id}`, fd)
export const deleteGround = (id)     => api.delete(`/sportGrounds/delete/${id}`)


// BOOKINGS
// ══════════════════════════════════════════════════════════════════════════════
 
/**
 * GET /bookings/getAll?page=1&limit=10&search=
 * Returns { success, message, data: { total, totalPages, page, limit, data: Booking[] } }
 */
export const getBookings = (page = 1, limit = 10, search = '') =>
  api.get('/bookings/getAll', { params: { page, limit, ...(search ? { search } : {}) } })
 
/**
 * PUT /bookings/:id
 * Body (JSON): { status?, paymentStatus? }
 * Returns { success, message, data: Booking }
 */
export const updateBooking = (id, updates) =>
  api.put(`/bookings/${id}`, updates)

export default api