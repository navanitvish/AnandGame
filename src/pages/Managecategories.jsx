// ManageCategories.jsx
// Single-file component — CategoryModal is defined inline at the top.
// Theme: white background · purple accents · black text

import { useState, useEffect } from 'react'
import {
  X, Upload, Image, Edit, Plus, AlertCircle,
  Search, Trash2, Tag, Download, CheckCircle,
  XCircle, LayoutGrid, RefreshCw,
} from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/api'

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-black placeholder-neutral-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-200'

const labelCls = 'block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5'

const ACCENTS = [
  { text: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200',  dot: 'bg-purple-400'  },
  { text: 'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-400'    },
  { text: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  { text: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  { text: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
]
const accent = (i) => ACCENTS[i % ACCENTS.length]

// ─── CategoryModal ────────────────────────────────────────────────────────────
const CategoryModal = ({ isOpen, onClose, onSave, category, loading }) => {
  const [formData, setFormData]               = useState({ name: '', description: '' })
  const [imageFile, setImageFile]             = useState(null)
  const [imagePreview, setImagePreview]       = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (category) {
      setFormData({ name: category.name || '', description: category.description || '' })
      setImagePreview(category.image || '')
      setImageFile(null)
    } else {
      setFormData({ name: '', description: '' })
      setImagePreview('')
      setImageFile(null)
    }
    setValidationError('')
  }, [category, isOpen])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setValidationError('')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/'))  { setValidationError('Please upload a valid image file.'); return }
    if (file.size > 5 * 1024 * 1024)     { setValidationError('Image must be under 5MB.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setValidationError('')
  }

  const handleSubmit = () => {
    if (!formData.name.trim())        return setValidationError('Category name is required.')
    if (!formData.description.trim()) return setValidationError('Description is required.')
    if (!imagePreview && !category)   return setValidationError('Please upload an image.')
    const fd = new FormData()
    fd.append('name',        formData.name.trim())
    fd.append('description', formData.description.trim())
    if (imageFile) fd.append('image', imageFile)
    onSave(fd)
  }

  if (!isOpen) return null
  const isEditing = !!category

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
              isEditing
                ? 'bg-amber-100 border border-amber-200'
                : 'bg-purple-100 border border-purple-200'
            }`}>
              {isEditing
                ? <Edit className="h-4 w-4 text-amber-600" />
                : <Plus className="h-4 w-4 text-purple-600" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-black">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="text-[10px] text-neutral-400">
                {isEditing ? 'Update category details' : 'Fill in the category information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600 font-medium">{validationError}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className={labelCls}>Category Name *</label>
            <input
              type="text" name="name"
              placeholder="e.g. games,coaching"
              value={formData.name} onChange={handleChange}
              disabled={loading}
              className={inputCls + ' disabled:opacity-50'}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              name="description" rows={3}
              placeholder="Enter category description…"
              value={formData.description} onChange={handleChange}
              disabled={loading}
              className={inputCls + ' resize-none disabled:opacity-50'}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelCls}>
              Image {isEditing ? '(optional — leave empty to keep current)' : '*'}
            </label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 flex-shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center">
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  : <Image className="h-7 w-7 text-neutral-300" />}
              </div>

              <label className="flex-1 flex items-center gap-3 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl px-4 py-3.5 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
                <div className="h-9 w-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-all">
                  <Upload className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-500 group-hover:text-black transition-colors truncate">
                    {imageFile ? imageFile.name : imagePreview ? 'Click to change image' : 'Click to upload image'}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">PNG, JPG, WEBP · max 5MB</p>
                </div>
                <input
                  type="file" accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/20"
          >
            {loading
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isEditing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {loading ? 'Saving…' : isEditing ? 'Update Category' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ManageCategories (main page) ─────────────────────────────────────────────
const ManageCategories = () => {
  const [categories,       setCategories]       = useState([])
  const [searchTerm,       setSearchTerm]       = useState('')
  const [statusFilter,     setStatusFilter]     = useState('all')
  const [isModalOpen,      setIsModalOpen]      = useState(false)
  const [editingCategory,  setEditingCategory]  = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [actionLoading,    setActionLoading]    = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getCategories()
      let data = []
      if (Array.isArray(res))                        data = res
      else if (Array.isArray(res?.data))             data = res.data
      else if (Array.isArray(res?.categories))       data = res.categories
      else if (Array.isArray(res?.data?.data))       data = res.data.data
      else if (Array.isArray(res?.data?.categories)) data = res.data.categories
      setCategories(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = categories.filter((cat) => {
    const matchSearch =
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus =
      statusFilter === 'all' ? true
      : statusFilter === 'active' ? cat.isActive
      : !cat.isActive
    return matchSearch && matchStatus
  })

  const handleSaveCategory = async (formData) => {
    try {
      setActionLoading(true)
      if (editingCategory) {
        const res = await updateCategory(editingCategory._id || editingCategory.id, formData)
        const updated = res?.data || res
        setCategories((prev) =>
          prev.map((c) =>
            (c._id || c.id) === (editingCategory._id || editingCategory.id)
              ? { ...c, ...updated }
              : c
          )
        )
      } else {
        const res = await createCategory(formData)
        const newCat = res?.data || res
        if (newCat) setCategories((prev) => [...prev, newCat])
      }
      setIsModalOpen(false); setEditingCategory(null)
      await fetchCategories()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save category')
    } finally { setActionLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      setActionLoading(true)
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete category')
    } finally { setActionLoading(false) }
  }

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(true)
      const cat = categories.find((c) => (c._id || c.id) === id)
      const fd = new FormData()
      fd.append('name',        cat.name)
      fd.append('description', cat.description || '')
      fd.append('isActive',    String(!cat.isActive))
      await updateCategory(id, fd)
      setCategories((prev) =>
        prev.map((c) => (c._id || c.id) === id ? { ...c, isActive: !c.isActive } : c)
      )
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status')
    } finally { setActionLoading(false) }
  }

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(categories, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `categories-${new Date().toISOString().split('T')[0]}.json`
      a.click(); URL.revokeObjectURL(url)
    } catch { alert('Failed to export') }
  }

  const activeCount   = categories.filter((c) => c.isActive).length
  const inactiveCount = categories.filter((c) => !c.isActive).length

  return (
    <div className="min-h-screen bg-white p-6 space-y-5">

      {/* ── Hero Banner ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-purple-50 p-7">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-10 right-20 h-48 w-48 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-4  h-32 w-32 rounded-full bg-violet-400/20 blur-2xl"  />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Data</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-1">Manage Categories</h1>
            <p className="text-sm text-neutral-500">Organise your furniture store</p>

            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-black">{categories.length} Total</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-black">{activeCount} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-400">{inactiveCount} Inactive</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCategories}
              className="p-2.5 rounded-xl border border-purple-200 bg-white text-purple-600 hover:bg-purple-100 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-purple-50 transition-all"
            >
              <Download className="h-4 w-4 text-purple-600" /> Export
            </button>
            <button
              onClick={() => { setEditingCategory(null); setIsModalOpen(true) }}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/25"
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-5">

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-9 w-9 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-neutral-400">Loading categories…</p>
          </div>

        /* Error */
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
              <AlertCircle className="h-5 w-5 text-rose-500" />
            </div>
            <p className="text-sm font-semibold text-black mb-1">Failed to load categories</p>
            <p className="text-xs text-neutral-400 mb-5">{error}</p>
            <button
              onClick={fetchCategories}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-semibold transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>

        ) : (
          <>
            {/* Filters + Search */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                {[
                  { value: 'all',      label: 'All',      count: categories.length },
                  { value: 'active',   label: 'Active',   count: activeCount       },
                  { value: 'inactive', label: 'Inactive', count: inactiveCount     },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      statusFilter === f.value
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-200'
                    }`}
                  >
                    {f.label} <span className="opacity-60 ml-1">({f.count})</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-72 pl-9 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-black placeholder-neutral-400
                             focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((cat, i) => {
                  const ac = accent(i)
                  const id = cat._id || cat.id
                  return (
                    <div
                      key={id}
                      className="group relative rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-purple-200 hover:shadow-md hover:shadow-purple-100"
                    >
                      {/* top accent line */}
                      <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${ac.dot} opacity-70`} />

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${ac.bg} border ${ac.border}`}>
                            {cat.image
                              ? <img src={cat.image} alt={cat.name} className="h-full w-full object-cover rounded-xl" />
                              : <span className={`text-lg font-bold ${ac.text}`}>{cat.name?.charAt(0)}</span>}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-black capitalize">{cat.name}</h3>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : '—'}
                            </p>
                          </div>
                        </div>

                        <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        }`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-xs capitalize text-neutral-500 leading-relaxed line-clamp-2 mb-4 min-h-[32px]">
                        {cat.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-neutral-100">
                        {/* Toggle status */}
                        <button
                          onClick={() => handleToggleStatus(id)}
                          disabled={actionLoading}
                          title={cat.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition-all disabled:opacity-40 ${
                            cat.isActive
                              ? 'bg-neutral-100 border border-neutral-200 text-neutral-500 hover:bg-neutral-200'
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {cat.isActive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => { setEditingCategory(cat); setIsModalOpen(true) }}
                          disabled={actionLoading}
                          className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-all disabled:opacity-40"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={actionLoading}
                          className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 transition-all disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
                  <LayoutGrid className="h-6 w-6 text-neutral-300" />
                </div>
                <p className="text-sm font-semibold text-black">No categories found</p>
                <p className="text-xs text-neutral-400 mt-1 mb-5">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter.'
                    : 'Get started by creating your first category.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true) }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> Add New Category
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null) }}
        onSave={handleSaveCategory}
        category={editingCategory}
        loading={actionLoading}
      />
    </div>
  )
}

export default ManageCategories