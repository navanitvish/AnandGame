import { useState, useEffect } from 'react'
import {
  Shield, Plus, Edit, Trash2, Eye, X,
  FileText, AlertCircle, RefreshCw, Search,
  CheckCircle, XCircle, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { fetchAllPolicies, createPolicy, updatePolicy, deletePolicy } from '../../api/api'

// ── Helpers ───────────────────────────────────────────
const toArray = (res) => {
  if (Array.isArray(res))             return res
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data))       return res.data
  for (const k of ['policies', 'result', 'items']) {
    if (Array.isArray(res?.[k]))       return res[k]
    if (Array.isArray(res?.data?.[k])) return res.data[k]
  }
  return []
}

const emptyForm = { title: '', description: '', isActive: true }

const inputCls =
  'w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white ' +
  'placeholder:text-neutral-300 outline-none focus:border-purple-400 focus:ring-2 ' +
  'focus:ring-purple-100 transition-all disabled:opacity-50 disabled:bg-neutral-50'

const labelCls = 'block text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5'

// ─────────────────────────────────────────────────────
export default function PrivacyPolicy() {
  const [policies, setPolicies]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm]       = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [viewingPolicy, setViewingPolicy] = useState(null)
  const [formData, setFormData]           = useState(emptyForm)
  const [formError, setFormError]         = useState('')

  useEffect(() => { fetchData() }, [])

  // ── Fetch ─────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetchAllPolicies()
      setPolicies(toArray(res))
    } catch (err) {
      setError(err?.message || 'Failed to load policies.')
    } finally { setLoading(false) }
  }

  // ── Modal helpers ─────────────────────────────────
  const openAdd = () => {
    setFormData(emptyForm); setEditingPolicy(null)
    setFormError(''); setShowFormModal(true)
  }

  const openEdit = (policy) => {
    setFormData({ title: policy.title || '', description: policy.description || '', isActive: policy.isActive ?? true })
    setEditingPolicy(policy); setFormError('')
    setShowViewModal(false); setShowFormModal(true)
  }

  const openView       = (policy) => { setViewingPolicy(policy); setShowViewModal(true) }
  const closeFormModal = () => { setShowFormModal(false); setEditingPolicy(null); setFormData(emptyForm); setFormError('') }

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim())       return setFormError('Title is required.')
    if (!formData.description.trim()) return setFormError('Description is required.')
    setActionLoading(true)
    try {
      const payload = { title: formData.title.trim(), description: formData.description.trim(), isActive: formData.isActive }
      if (editingPolicy) {
        await updatePolicy(editingPolicy._id || editingPolicy.id, payload)
      } else {
        await createPolicy(payload)
      }
      closeFormModal()
      await fetchData()
    } catch (err) {
      setFormError(err?.message || 'Failed to save policy.')
    } finally { setActionLoading(false) }
  }

  // ── Delete ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy?')) return
    setActionLoading(true)
    try {
      await deletePolicy(id)
      setPolicies(prev => prev.filter(p => (p._id || p.id) !== id))
    } catch (err) {
      alert(err?.message || 'Failed to delete policy.')
    } finally { setActionLoading(false) }
  }

  // ── Toggle ────────────────────────────────────────
  const handleToggle = async (policy) => {
    setActionLoading(true)
    try {
      const id = policy._id || policy.id
      await updatePolicy(id, { title: policy.title, description: policy.description, isActive: !policy.isActive })
      setPolicies(prev => prev.map(p => (p._id || p.id) === id ? { ...p, isActive: !p.isActive } : p))
    } catch (err) {
      alert(err?.message || 'Failed to update status.')
    } finally { setActionLoading(false) }
  }

  const filtered    = policies.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const activeCount = policies.filter(p => p.isActive).length

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  // ── Render ────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header Card ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield size={17} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-black">Privacy &amp; Policies</h1>
            </div>
            <p className="text-neutral-500 text-sm mb-4">
              Manage your store's privacy policies and legal documents
            </p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <Shield size={13} className="text-purple-500" />
                <span className="text-sm font-semibold text-black">{policies.length}</span>
                <span className="text-xs text-neutral-400">Policies</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-500" />
                <span className="text-sm font-semibold text-black">{activeCount}</span>
                <span className="text-xs text-neutral-400">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={13} className="text-neutral-300" />
                <span className="text-sm font-semibold text-neutral-400">{policies.length - activeCount}</span>
                <span className="text-xs text-neutral-300">Inactive</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData}
              className="w-9 h-9 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center transition-colors">
              <RefreshCw size={14} className={`text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAdd} disabled={actionLoading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus size={15} /> Add Policy
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-black">All Policies</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
              <Search size={13} className="text-neutral-400 shrink-0" />
              <input type="text" placeholder="Search policies…"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-black outline-none w-44 placeholder:text-neutral-300" />
            </div>
            <span className="text-xs text-neutral-400">{filtered.length} items</span>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-9 h-9 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-neutral-400">Loading policies…</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <p className="text-sm font-semibold text-black mb-1">Failed to load policies</p>
            <p className="text-xs text-neutral-400 mb-5">{error}</p>
            <button onClick={fetchData}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-semibold rounded-xl transition-colors">
              <RefreshCw size={13} /> Try Again
            </button>
          </div>

        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['#', 'Title', 'Description', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((policy, i) => {
                    const pid = policy._id || policy.id
                    return (
                      <tr key={pid} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                        {/* # */}
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-mono text-neutral-400">{String(i + 1).padStart(2, '0')}</span>
                        </td>

                        {/* Title */}
                        <td className="px-5 py-4 max-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                              <Shield size={13} className="text-purple-600" />
                            </div>
                            <span className="text-xs font-semibold text-black truncate">{policy.title}</span>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4 max-w-[300px]">
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {policy.description || '—'}
                          </p>
                        </td>

                        {/* Status toggle */}
                        <td className="px-5 py-4">
                          <button onClick={() => handleToggle(policy)} disabled={actionLoading}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-all disabled:opacity-40 cursor-pointer ${
                              policy.isActive
                                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${policy.isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-neutral-400">{fmtDate(policy.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openView(policy)}
                              className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                              <Eye size={13} className="text-blue-500" />
                            </button>
                            <button onClick={() => openEdit(policy)} disabled={actionLoading}
                              className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 flex items-center justify-center transition-colors disabled:opacity-40">
                              <Edit size={13} className="text-purple-600" />
                            </button>
                            <button onClick={() => handleDelete(pid)} disabled={actionLoading}
                              className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-40">
                              <Trash2 size={13} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4">
                  <Shield size={22} className="text-neutral-300" />
                </div>
                <p className="text-sm font-semibold text-black">
                  {searchTerm ? 'No policies match your search' : 'No Policies Yet'}
                </p>
                <p className="text-xs text-neutral-400 mt-1 mb-5">
                  {searchTerm ? 'Try a different keyword.' : 'Add your first privacy policy to get started.'}
                </p>
                {!searchTerm && (
                  <button onClick={openAdd}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors">
                    <Plus size={14} /> Add First Policy
                  </button>
                )}
              </div>
            )}

            {/* Pagination info */}
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">
                  Showing {filtered.length} of {policies.length} policies
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ ADD / EDIT MODAL ══ */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeFormModal} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  editingPolicy ? 'bg-purple-100 border border-purple-200' : 'bg-purple-600'
                }`}>
                  {editingPolicy
                    ? <Edit size={15} className="text-purple-600" />
                    : <Plus size={15} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">{editingPolicy ? 'Edit Policy' : 'Add New Policy'}</h2>
                  <p className="text-[10px] text-neutral-400">{editingPolicy ? 'Update policy details' : 'Fill in the policy information'}</p>
                </div>
              </div>
              <button onClick={closeFormModal}
                className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors">
                <X size={14} className="text-neutral-500" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium">{formError}</p>
                </div>
              )}

              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" placeholder="e.g. Product Purchase Policy"
                  value={formData.title}
                  onChange={(e) => { setFormData(p => ({ ...p, title: e.target.value })); setFormError('') }}
                  disabled={actionLoading} className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea rows={5} placeholder="Enter the full policy description…"
                  value={formData.description}
                  onChange={(e) => { setFormData(p => ({ ...p, description: e.target.value })); setFormError('') }}
                  disabled={actionLoading} className={inputCls + ' resize-none'} required />
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-black">Status</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Whether this policy is publicly active</p>
                </div>
                <button type="button" onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                  className="flex items-center gap-2 transition-all">
                  {formData.isActive
                    ? <><ToggleRight size={26} className="text-purple-600" /><span className="text-xs font-semibold text-purple-600">Active</span></>
                    : <><ToggleLeft size={26} className="text-neutral-400" /><span className="text-xs font-semibold text-neutral-400">Inactive</span></>}
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button type="button" onClick={closeFormModal} disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-sm font-semibold text-neutral-600 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors">
                  {actionLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : editingPolicy ? <Edit size={14} /> : <Plus size={14} />}
                  {actionLoading ? 'Saving…' : editingPolicy ? 'Update Policy' : 'Add Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ VIEW MODAL ══ */}
      {showViewModal && viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200">

            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <Shield size={15} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black truncate max-w-xs">{viewingPolicy.title}</h2>
                  <p className="text-[10px] text-neutral-400">{fmtDate(viewingPolicy.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(viewingPolicy)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-100 transition-colors">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => setShowViewModal(false)}
                  className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors">
                  <X size={14} className="text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                  viewingPolicy.isActive
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${viewingPolicy.isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                  {viewingPolicy.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-medium text-purple-600">
                  <Shield size={10} /> Privacy Policy
                </span>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={13} className="text-neutral-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Policy Content</span>
                </div>
                <p className="text-sm text-neutral-700 leading-7 whitespace-pre-wrap">{viewingPolicy.description}</p>
              </div>

              {(viewingPolicy.updatedAt || viewingPolicy.createdAt) && (
                <div className="grid grid-cols-2 gap-2.5">
                  {viewingPolicy.createdAt && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Created</p>
                      <p className="text-sm font-semibold text-black">{fmtDate(viewingPolicy.createdAt)}</p>
                    </div>
                  )}
                  {viewingPolicy.updatedAt && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Last Updated</p>
                      <p className="text-sm font-semibold text-black">{fmtDate(viewingPolicy.updatedAt)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}