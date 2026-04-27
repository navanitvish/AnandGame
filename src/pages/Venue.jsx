import { useState, useEffect, useRef } from 'react'
import {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  toggleVenueStatus,
  getLocation,
  getAcademyManagers,
} from '../api/api'

// ─── Location label helper ─────────────────────────────────────────────────
const locationLabel = (l) => {
  if (!l) return '—'
  if (l.name) return l.name
  if (l.city && l.state) return `${l.city}, ${l.state}`
  if (l.formattedAddress) return l.formattedAddress
  return l._id || l.id || '—'
}

// ─── Fetch a single venue's location by locationId ────────────────────────
const fetchSingleLocation = async (locationId) => {
  if (!locationId) return null
  try {
    const res = await fetch(`https://aanandgames.onrender.com/aanand-sports/locations/get/${locationId}`)
    const json = await res.json()
    if (json?.data) return json.data
    return null
  } catch {
    return null
  }
}

// ─── Normalize locations from any API response shape ──────────────────────
const extractLocations = (res) => {
  if (Array.isArray(res))                         return res
  if (Array.isArray(res?.data))                   return res.data
  if (Array.isArray(res?.data?.data))             return res.data.data
  if (Array.isArray(res?.data?.data?.data))       return res.data.data.data
  return []
}

// ─── Toast Hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }
  return { toasts, show }
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg text-white
            ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmModal({ show, name, loading, onConfirm, onCancel }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-80">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-500 text-xl">⚠</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Delete Venue?</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-800">"{name}"</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-medium disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ venue, locationMap, academies, onClose }) {
  if (!venue) return null

  // ✅ FIX: use academy.name (nested), not user's name
  const academy = academies.find((a) => a.academyId === venue.academyId)
  const academyName = academy?.academy?.name || academy?.name || venue.academyId || '—'

  const locDisplay = locationMap[venue.locationId]
    ? locationLabel(locationMap[venue.locationId])
    : venue.locationId || '—'

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Venue Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {venue.image ? (
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-40 object-cover rounded-xl mb-4 bg-gray-100"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-32 rounded-xl mb-4 bg-purple-50 flex items-center justify-center">
            <span className="text-5xl">🏟️</span>
          </div>
        )}

        <div className="space-y-2">
          {[
            { label: 'ID',          value: venue._id || venue.id },
            { label: 'Name',        value: venue.name },
            { label: 'Academy',     value: academyName },
            { label: 'Location',    value: locDisplay },
            { label: 'Description', value: venue.description || '—' },
            {
              label: 'Status',
              value: (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${venue.isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  {venue.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              label: 'Created',
              value: venue.createdAt
                ? new Date(venue.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })
                : '—',
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 w-24 flex-shrink-0 mt-0.5">{label}</span>
              <span className="text-sm text-gray-800 break-all">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add / Edit Form Modal ────────────────────────────────────────────────────
function VenueFormModal({ show, editVenue, academies, academiesLoading, onClose, onSaved, toast }) {
  const fileRef = useRef(null)

  const [form, setForm]       = useState({
    academyId: '', locationId: '', name: '', description: '', isActive: 'true',
  })
  const [preview, setPreview] = useState(null)
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const [locations,        setLocations]        = useState([])
  const [locationsLoading, setLocationsLoading] = useState(false)

  // ── Fetch locations by academyId ──────────────────────────────────────────
  const fetchLocationsByAcademy = async (academyId) => {
    if (!academyId) { setLocations([]); return }
    setLocationsLoading(true)
    try {
      const res = await getLocation(academyId)
      // ✅ FIX: handle nested { data: { data: [...] } } shape
      const list = extractLocations(res)
      setLocations(list)
    } catch {
      setLocations([])
    } finally {
      setLocationsLoading(false)
    }
  }

  // ── Populate form when modal opens ────────────────────────────────────────
  useEffect(() => {
    if (!show) return
    if (editVenue) {
      setForm({
        academyId:   editVenue.academyId   || '',
        locationId:  editVenue.locationId  || '',
        name:        editVenue.name        || '',
        description: editVenue.description || '',
        isActive:    editVenue.isActive !== undefined ? String(editVenue.isActive) : 'true',
      })
      setPreview(editVenue.image || null)
      if (editVenue.academyId) fetchLocationsByAcademy(editVenue.academyId)
    } else {
      setForm({ academyId: '', locationId: '', name: '', description: '', isActive: 'true' })
      setPreview(null)
      setLocations([])
    }
    setFile(null)
    setErrors({})
  }, [editVenue, show])

  // ── Academy change ────────────────────────────────────────────────────────
  const handleAcademyChange = (e) => {
    const academyId = e.target.value
    setForm((prev) => ({ ...prev, academyId, locationId: '' }))
    setErrors((prev) => ({ ...prev, academyId: '' }))
    fetchLocationsByAcademy(academyId)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.academyId.trim())  e.academyId  = 'Academy is required'
    if (!form.locationId.trim()) e.locationId = 'Location is required'
    if (!form.name.trim())       e.name       = 'Venue name is required'
    return e
  }

  // ── Image handler ─────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const fd = new FormData()
    fd.append('locationId',  form.locationId.trim())
    fd.append('name',        form.name.trim())
    fd.append('description', form.description.trim())
    fd.append('isActive',    form.isActive)
    if (file) fd.append('image', file)

    setLoading(true)
    try {
      if (editVenue) {
        await updateVenue(editVenue._id || editVenue.id, fd)
        toast('Venue updated successfully!', 'success')
      } else {
        await createVenue(fd)
        toast('Venue created successfully!', 'success')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">
            {editVenue ? 'Edit Venue' : 'Add New Venue'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* ── Image Upload ── */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">
              Image <span className="text-neutral-300">(optional)</span>
            </label>
            <div
              onClick={() => fileRef.current.click()}
              className="relative w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden bg-gray-50"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">📷</div>
                  <p className="text-xs text-gray-400">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            {preview && (
              <button
                onClick={() => {
                  setPreview(null)
                  setFile(null)
                  if (fileRef.current) fileRef.current.value = ''
                }}
                className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
              >
                Remove image
              </button>
            )}
          </div>

          {/* ── Academy Dropdown ── */}
          {/* ✅ FIX: show a.academy.name (nested academy name), value = a.academyId */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Academy *</label>
            {academiesLoading ? (
              <div className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 bg-gray-50 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                Loading academies...
              </div>
            ) : academies.length > 0 ? (
              <select
                value={form.academyId}
                onChange={handleAcademyChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-black outline-none
                  focus:border-purple-400 transition-colors bg-white
                  ${errors.academyId ? 'border-red-400' : 'border-neutral-200'}`}
              >
                <option value="">— Select an academy —</option>
                {academies.map((a) => (
                  <option key={a.academyId} value={a.academyId}>
                    {/* ✅ FIX: a.academy.name is the real academy name */}
                    {a.academy?.name || a.name || a.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 bg-gray-50">
                No academies found
              </div>
            )}
            {errors.academyId && (
              <p className="text-xs text-red-400 mt-1">{errors.academyId}</p>
            )}
          </div>

          {/* ── Location Dropdown ── */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Location *</label>
            {!form.academyId ? (
              <div className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 bg-gray-50">
                Select an academy first
              </div>
            ) : locationsLoading ? (
              <div className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 bg-gray-50 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                Loading locations...
              </div>
            ) : locations.length > 0 ? (
              <select
                value={form.locationId}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, locationId: e.target.value }))
                  setErrors((prev) => ({ ...prev, locationId: '' }))
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-black outline-none
                  focus:border-purple-400 transition-colors bg-white
                  ${errors.locationId ? 'border-red-400' : 'border-neutral-200'}`}
              >
                <option value="">— Select a location —</option>
                {locations.map((l) => (
                  <option key={l._id || l.id} value={l._id || l.id}>
                    {locationLabel(l)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-400 bg-gray-50">
                No locations found for this academy
              </div>
            )}
            {errors.locationId && (
              <p className="text-xs text-red-400 mt-1">{errors.locationId}</p>
            )}
          </div>

          {/* ── Venue Name ── */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Venue Name *</label>
            <input
              type="text"
              placeholder="e.g. Green Valley Ground"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }))
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              className={`w-full border rounded-lg px-3 py-2 text-sm text-black outline-none
                focus:border-purple-400 transition-colors
                ${errors.name ? 'border-red-400' : 'border-neutral-200'}`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* ── Description ── */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">
              Description <span className="text-neutral-300">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Best cricket ground in Lucknow"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors resize-none"
            />
          </div>

          {/* ── Status ── */}
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">
              Status <span className="text-neutral-300">(default: Active)</span>
            </label>
            <select
              value={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value }))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400 transition-colors"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-60"
          >
            {loading
              ? editVenue ? 'Saving...' : 'Adding...'
              : editVenue ? 'Save Changes' : 'Add Venue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN VENUES PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Venues() {
  const { toasts, show: toast } = useToast()

  const [venues,           setVenues]           = useState([])
  const [loading,          setLoading]          = useState(true)
  const [search,           setSearch]           = useState('')
  const [showForm,         setShowForm]         = useState(false)
  const [editVenue,        setEditVenue]        = useState(null)
  const [viewVenue,        setViewVenue]        = useState(null)
  const [deleteTarget,     setDeleteTarget]     = useState(null)
  const [deleting,         setDeleting]         = useState(false)
  const [togglingId,       setTogglingId]       = useState(null)

  const [academies,        setAcademies]        = useState([])
  const [academiesLoading, setAcademiesLoading] = useState(false)

  // locationMap: { [locationId]: locationObject }
  const [locationMap, setLocationMap] = useState({})

  // ── Fetch Venues ──────────────────────────────────────────────────────────
  const fetchVenues = async () => {
    setLoading(true)
    try {
      const res = await getVenues()
      let list = []
      if (Array.isArray(res))                 list = res
      else if (Array.isArray(res.data))       list = res.data
      else if (Array.isArray(res.data?.data)) list = res.data.data
      setVenues(list)
      return list
    } catch (err) {
      toast(err.message || 'Failed to load venues', 'error')
      return []
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch Academies ───────────────────────────────────────────────────────
  const fetchAcademies = async () => {
    setAcademiesLoading(true)
    try {
      const res = await getAcademyManagers()
      let list = []
      if (Array.isArray(res))                 list = res
      else if (Array.isArray(res.data))       list = res.data
      else if (Array.isArray(res.data?.data)) list = res.data.data
      setAcademies(list)
      return list
    } catch {
      setAcademies([])
      return []
    } finally {
      setAcademiesLoading(false)
    }
  }

  // ── Build locationMap ─────────────────────────────────────────────────────
  // Step 1: bulk fetch per academy using academyId
  // Step 2: individually fetch any remaining unresolved locationIds
  const buildLocationMap = async (academyList, venueList) => {
    const map = {}

    // Step 1: bulk fetch per academy
    if (academyList.length > 0) {
      const results = await Promise.allSettled(
        academyList.map((a) => getLocation(a.academyId))
      )
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          // ✅ FIX: handle deeply nested { data: { data: [...] } } shape
          const locs = extractLocations(r.value)
          locs.forEach((l) => {
            const lid = l._id || l.id
            if (lid) map[lid] = l
          })
        }
      })
    }

    // Step 2: individually fetch still-unresolved locationIds
    const unresolvedIds = [
      ...new Set(
        venueList
          .map((v) => v.locationId)
          .filter((id) => id && !map[id])
      ),
    ]

    if (unresolvedIds.length > 0) {
      const singles = await Promise.allSettled(
        unresolvedIds.map((id) => fetchSingleLocation(id))
      )
      singles.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          const l = r.value
          const lid = l._id || l.id || unresolvedIds[i]
          map[lid] = l
        }
      })
    }

    setLocationMap(map)
  }

  // ── On Mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const [venueList, academyList] = await Promise.all([fetchVenues(), fetchAcademies()])
      await buildLocationMap(academyList, venueList)
    }
    init()
  }, [])

  // ── Refresh venues + re-resolve locations ─────────────────────────────────
  const refreshVenuesAndLocations = async () => {
    const venueList = await fetchVenues()
    setAcademies((currentAcademies) => {
      buildLocationMap(currentAcademies, venueList)
      return currentAcademies
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteVenue(deleteTarget.id)
      toast('Venue deleted!', 'success')
      setDeleteTarget(null)
      refreshVenuesAndLocations()
    } catch (err) {
      toast(err.message || 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Toggle Status ─────────────────────────────────────────────────────────
  const handleToggle = async (venue) => {
    const id = venue._id || venue.id
    setTogglingId(id)
    try {
      await toggleVenueStatus(id)
      toast(`Marked as ${venue.isActive ? 'Inactive' : 'Active'}`, 'success')
      refreshVenuesAndLocations()
    } catch {
      try {
        const fd = new FormData()
        fd.append('locationId',  venue.locationId  || '')
        fd.append('name',        venue.name)
        fd.append('description', venue.description || '')
        fd.append('isActive',    String(!venue.isActive))
        await updateVenue(id, fd)
        toast(`Marked as ${venue.isActive ? 'Inactive' : 'Active'}`, 'success')
        refreshVenuesAndLocations()
      } catch (err2) {
        toast(err2.message || 'Toggle failed', 'error')
      }
    } finally {
      setTogglingId(null)
    }
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = venues.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  )

  // ── Resolve locationId → label ────────────────────────────────────────────
  const getLocationDisplay = (locationId) => {
    if (!locationId) return '—'
    const loc = locationMap[locationId]
    return loc ? locationLabel(loc) : locationId
  }

  // ── Resolve academyId → academy name ─────────────────────────────────────
  // ✅ FIX: use a.academy.name (nested), not a.name (user's name)
  const getAcademyName = (academyId) => {
    if (!academyId) return '—'
    const a = academies.find((x) => x.academyId === academyId)
    return a ? (a.academy?.name || a.name || a.email || academyId) : academyId
  }

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <ToastContainer toasts={toasts} />

      <ConfirmModal
        show={!!deleteTarget}
        name={deleteTarget?.name}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ViewModal
        venue={viewVenue}
        locationMap={locationMap}
        academies={academies}
        onClose={() => setViewVenue(null)}
      />

      <VenueFormModal
        show={showForm}
        editVenue={editVenue}
        academies={academies}
        academiesLoading={academiesLoading}
        onClose={() => { setShowForm(false); setEditVenue(null) }}
        onSaved={refreshVenuesAndLocations}
        toast={toast}
      />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Venues</h1>
          <p className="text-neutral-500 text-sm mt-1">{venues.length} total venues</p>
        </div>
        <button
          onClick={() => { setEditVenue(null); setShowForm(true) }}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Venue
        </button>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-purple-400"
        />
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {['#',"Id", 'Image', 'Name', 'Academy', 'Location', 'Description', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-neutral-400 font-medium text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    <span className="text-sm">Loading venues...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-neutral-400 text-sm">
                  {search ? 'No venues match your search.' : 'No venues yet. Click "+ Add Venue" to create one!'}
                </td>
              </tr>
            ) : (
              filtered.map((v, i) => {
                const id = v._id || v.id
                return (
                  <tr key={id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">


                    {/* # */}
                    <td className="px-5 py-3 text-neutral-400 text-xs">{i + 1}</td>

                     <td className="px-5 py-3">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                       {v._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Image */}
                    <td className="px-5 py-3">
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-lg">
                          🏟️
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 font-medium text-black capitalize">{v.name}</td>

                    {/* Academy — ✅ resolved via a.academy.name */}
                   

                    {/* Location — ✅ resolved from locationMap */}
                    <td className="px-5 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {getLocationDisplay(v.locationId)}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3 text-neutral-500 text-xs max-w-[160px]">
                      <span className="line-clamp-1">{v.description || '—'}</span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggle(v)}
                        disabled={togglingId === id}
                        title="Click to toggle status"
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all disabled:opacity-60 cursor-pointer
                          ${v.isActive
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                      >
                        {togglingId === id ? '...' : v.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3 text-neutral-400 text-xs whitespace-nowrap">
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViewVenue(v)}
                          className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setEditVenue(v); setShowForm(true) }}
                          className="text-xs text-purple-400 hover:text-purple-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id, name: v.name })}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 text-xs text-neutral-400">
            Showing {filtered.length} of {venues.length} venues
          </div>
        )}
      </div>
    </div>
  )
}