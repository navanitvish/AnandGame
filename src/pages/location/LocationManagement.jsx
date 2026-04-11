import { useState, useEffect } from 'react'
import {
  Plus, Edit, Trash2, MapPin, Navigation,
  Map, CheckCircle2, AlertCircle, X, Crosshair,
} from 'lucide-react'
import { locationsAPI } from '../../api/api'

// ── Location Form ─────────────────────────────────────
const LocationForm = ({ location, onSave, onCancel, title = 'Add New Location' }) => {
  const [formData, setFormData] = useState({
    coordinates: location?.coordinates || ['', ''],
  })

  const handleCoordinateChange = (index, value) => {
    const newCoords = [...formData.coordinates]
    newCoords[index] = value
    setFormData((prev) => ({ ...prev, coordinates: newCoords }))
  }

  const handleSubmit = () => {
    const lat = formData.coordinates[0]
    const lng = formData.coordinates[1]

    if (!lat || !lng || lat === '' || lng === '') {
      alert('Please enter both latitude & longitude')
      return
    }
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Please enter valid numbers for latitude and longitude')
      return
    }
    if (latNum < -90 || latNum > 90) {
      alert('Latitude must be between -90 and 90')
      return
    }
    if (lngNum < -180 || lngNum > 180) {
      alert('Longitude must be between -180 and 180')
      return
    }
    onSave({ coordinates: [latNum, lngNum] }, location?._id)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setFormData((prev) => ({
            ...prev,
            coordinates: [
              pos.coords.latitude.toString(),
              pos.coords.longitude.toString(),
            ],
          })),
        (err) => alert('Unable to get location: ' + err.message)
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  const hasPreview = formData.coordinates[0] && formData.coordinates[1]

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
            <MapPin size={16} className="text-white" />
          </div>
          <h2 className="text-base font-bold text-black">{title}</h2>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
        >
          <X size={15} className="text-neutral-500" />
        </button>
      </div>

      {/* Info strip */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-5">
        <p className="text-[11px] text-purple-700 font-medium">
          Format: <code className="bg-purple-100 px-1 rounded">[latitude, longitude]</code>
          &nbsp;— Example: <code className="bg-purple-100 px-1 rounded">44.4644, 65.9218</code>
        </p>
        <p className="text-[10px] text-purple-500 mt-0.5">
          Lat: −90 to 90 &nbsp;·&nbsp; Lng: −180 to 180
        </p>
      </div>

      {/* Coordinate inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
            Latitude <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            value={formData.coordinates[0]}
            onChange={(e) => handleCoordinateChange(0, e.target.value)}
            placeholder="44.4644"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-purple-400 transition-colors"
          />
          <p className="text-[10px] text-neutral-400 mt-1">Range: −90 to 90</p>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
            Longitude <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            value={formData.coordinates[1]}
            onChange={(e) => handleCoordinateChange(1, e.target.value)}
            placeholder="65.9218"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-purple-400 transition-colors"
          />
          <p className="text-[10px] text-neutral-400 mt-1">Range: −180 to 180</p>
        </div>
      </div>

      {/* GPS button */}
      <button
        onClick={getCurrentLocation}
        className="w-full flex items-center justify-center gap-2 border border-neutral-200 hover:border-purple-300 hover:bg-purple-50 text-neutral-600 hover:text-purple-700 text-xs font-semibold py-2.5 rounded-xl transition-all mb-4"
      >
        <Crosshair size={14} />
        Use Current GPS Location
      </button>

      {/* Preview */}
      {hasPreview && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 mb-5">
          <p className="text-[10px] text-neutral-400 font-medium mb-0.5">Preview</p>
          <code className="text-xs text-purple-600 font-bold">
            [{formData.coordinates[0]}, {formData.coordinates[1]}]
          </code>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
        >
          {location ? 'Update Location' : 'Save Location'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-black text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────
const LocationManagement = () => {
  const [locations, setLocations]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [mode, setMode]                 = useState('view')
  const [editingLocation, setEditingLocation] = useState(null)
  const [search, setSearch]             = useState('')

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await locationsAPI.getAllLocations()
      let data =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data ||
        []
      if (!Array.isArray(data)) data = []
      setLocations(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch locations')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(payload) {
    try {
      setLoading(true)
      await locationsAPI.createLocation(payload)
      await fetchAllData()
      setMode('view')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create location')
    } finally { setLoading(false) }
  }

  function handleEdit(loc) {
    setEditingLocation(loc)
    setMode('edit')
  }

  async function handleUpdate(payload, id) {
    try {
      setLoading(true)
      await locationsAPI.updateLocation(id, payload)
      await fetchAllData()
      setMode('view')
      setEditingLocation(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update location')
    } finally { setLoading(false) }
  }

  async function handleDelete(loc) {
    if (!window.confirm(`Delete "${loc.name || 'this location'}"?`)) return
    try {
      setLoading(true)
      await locationsAPI.deleteLocation(loc._id)
      await fetchAllData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete location')
    } finally { setLoading(false) }
  }

  function handleCancel() {
    setMode('view')
    setEditingLocation(null)
    setError(null)
  }

  const list = Array.isArray(locations) ? locations : []
  const coordCount = list.filter((l) => l.coordinates?.length === 2).length

  const filtered = list.filter((l) => {
    const q = search.toLowerCase()
    return (
      l.name?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.area?.toLowerCase().includes(q) ||
      l.state?.toLowerCase().includes(q)
    )
  })

  // ── Loading screen ────────────────────────────────
  if (loading && list.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <MapPin size={17} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-black">Locations</h1>
          </div>
          <p className="text-neutral-500 text-sm">Manage business locations with GPS coordinates</p>
        </div>
        <button
          onClick={() => setMode('add')}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Add Location
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">Error</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <MapPin size={17} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-black leading-none">{list.length}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Total Locations</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
            <Map size={17} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-black leading-none">{coordCount}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">With Coordinates</p>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2 max-w-sm">
        <MapPin size={13} className="text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, city, area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-black outline-none w-full placeholder:text-neutral-400"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-black">
            All Locations
            <span className="ml-2 text-[11px] text-neutral-400 font-normal">
              ({filtered.length})
            </span>
          </h2>
          {loading && list.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin size={32} className="mx-auto mb-3 text-neutral-200" />
            <p className="text-neutral-400 text-sm">No locations found</p>
            <p className="text-neutral-300 text-xs mt-1">Add your first location to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['ID', 'Location Name', 'Coordinates', 'Address', 'Area', 'City', 'State', 'ZIP', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-neutral-400 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((loc, i) => (
                  <tr
                    key={loc._id || i}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                        #{loc._id?.slice(-6) || 'N/A'}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                          <MapPin size={11} className="text-purple-600" />
                        </div>
                        <span className="text-xs font-semibold text-black whitespace-nowrap">
                          {loc.name || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Coordinates */}
                    <td className="px-4 py-3">
                      {loc.coordinates?.length === 2 ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                          <span className="text-[11px] font-mono text-purple-600 whitespace-nowrap">
                            {loc.coordinates[0].toFixed(4)}, {loc.coordinates[1].toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-300">N/A</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3 text-xs text-neutral-500 max-w-[160px] truncate">
                      {loc.formattedAddress || 'N/A'}
                    </td>

                    {/* Area */}
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {loc.area || 'N/A'}
                    </td>

                    {/* City */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-black whitespace-nowrap">
                        {loc.city || 'N/A'}
                      </span>
                    </td>

                    {/* State */}
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {loc.state || 'N/A'}
                    </td>

                    {/* ZIP */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                        {loc.zipcode || 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(loc)}
                          className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Edit size={13} className="text-purple-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(loc)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal overlay ── */}
      {(mode === 'add' || mode === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <LocationForm
            location={mode === 'edit' ? editingLocation : undefined}
            onSave={mode === 'edit' ? handleUpdate : handleAdd}
            onCancel={handleCancel}
            title={mode === 'edit' ? 'Edit Location' : 'Add New Location'}
          />
        </div>
      )}

    </div>
  )
}

export default LocationManagement