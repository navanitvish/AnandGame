import { useState, useEffect } from 'react'
import {
  ScrollText, Plus, Edit, Trash2, Eye, X,
  FileText, AlertCircle, RefreshCw, Search,
  CheckCircle, XCircle, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { fetchAllTerms, createTerm, updateTerm, deleteTerm } from '../../api/api'

// ── Helpers ───────────────────────────────────────────
const toArray = (res) => {
  if (Array.isArray(res)) return res
  for (const k of ['data', 'terms', 'result', 'items']) {
    if (Array.isArray(res?.[k]))       return res[k]
    if (Array.isArray(res?.data?.[k])) return res.data[k]
  }
  return []
}

const emptyForm = { title: '', description: '', isActive: true }

const inputCls =
  'w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-black ' +
  'placeholder:text-neutral-300 outline-none focus:border-purple-400 focus:ring-2 ' +
  'focus:ring-purple-100 transition-all disabled:opacity-50 disabled:bg-neutral-50 bg-white'

const labelCls = 'block text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5'

// ─────────────────────────────────────────────────────
export default function TermsConditions() {
  const [terms, setTerms]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm]       = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingTerm, setEditingTerm]     = useState(null)
  const [viewingTerm, setViewingTerm]     = useState(null)
  const [formData, setFormData]           = useState(emptyForm)
  const [formError, setFormError]         = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetchAllTerms()
      setTerms(toArray(res))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load terms.')
    } finally { setLoading(false) }
  }

  const openAdd = () => {
    setFormData(emptyForm); setEditingTerm(null)
    setFormError(''); setShowFormModal(true)
  }

  const openEdit = (term) => {
    setFormData({ title: term.title || '', description: term.description || '', isActive: term.isActive ?? true })
    setEditingTerm(term); setFormError('')
    setShowViewModal(false); setShowFormModal(true)
  }

  const openView       = (term) => { setViewingTerm(term); setShowViewModal(true) }
  const closeFormModal = () => { setShowFormModal(false); setEditingTerm(null); setFormData(emptyForm); setFormError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim())       return setFormError('Title is required.')
    if (!formData.description.trim()) return setFormError('Description is required.')
    setActionLoading(true)
    try {
      const payload = { title: formData.title.trim(), description: formData.description.trim(), isActive: formData.isActive }
      if (editingTerm) {
        const res = await updateTerm(editingTerm._id || editingTerm.id, payload)
        const updated = res?.data || { ...payload, _id: editingTerm._id || editingTerm.id }
        setTerms(prev => prev.map(t => (t._id || t.id) === (editingTerm._id || editingTerm.id) ? { ...t, ...updated } : t))
      } else {
        const res = await createTerm(payload)
        const newT = res?.data || { ...payload, _id: Date.now().toString(), createdAt: new Date() }
        setTerms(prev => [...prev, newT])
      }
      closeFormModal()
      await fetchData()
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save term.')
    } finally { setActionLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this term?')) return
    setActionLoading(true)
    try {
      await deleteTerm(id)
      setTerms(prev => prev.filter(t => (t._id || t.id) !== id))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete term.')
    } finally { setActionLoading(false) }
  }

  const handleToggle = async (term) => {
    setActionLoading(true)
    try {
      const id = term._id || term.id
      await updateTerm(id, { title: term.title, description: term.description, isActive: !term.isActive })
      setTerms(prev => prev.map(t => (t._id || t.id) === id ? { ...t, isActive: !t.isActive } : t))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status.')
    } finally { setActionLoading(false) }
  }

  const filtered    = terms.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const activeCount = terms.filter(t => t.isActive).length

  return (
    <div className="space-y-6">

      {/* ── Page Header Card ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
                <ScrollText size={17} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-black">Terms & Conditions</h1>
            </div>
            <p className="text-neutral-500 text-sm mb-4">
              Manage your store's terms of service and legal agreements
            </p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <ScrollText size={13} className="text-purple-500" />
                <span className="text-sm font-semibold text-black">{terms.length}</span>
                <span className="text-xs text-neutral-400">Terms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-500" />
                <span className="text-sm font-semibold text-black">{activeCount}</span>
                <span className="text-xs text-neutral-400">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={13} className="text-neutral-300" />
                <span className="text-sm font-semibold text-neutral-400">{terms.length - activeCount}</span>
                <span className="text-xs text-neutral-300">Inactive</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData}
              className="w-9 h-9 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center transition-colors">
              <RefreshCw size={14} className="text-neutral-500" />
            </button>
            <button onClick={openAdd} disabled={actionLoading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus size={15} /> Add Term
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-black">All Terms</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
              <Search size={13} className="text-neutral-400 shrink-0" />
              <input type="text" placeholder="Search terms…"
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
            <p className="text-sm text-neutral-400">Loading terms…</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <p className="text-sm font-semibold text-black mb-1">Failed to load terms</p>
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
                  {filtered.map((term, i) => {
                    const tid = term._id || term.id
                    return (
                      <tr key={tid} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">

                        <td className="px-5 py-4">
                          <span className="text-[11px] font-mono text-neutral-400">{String(i + 1).padStart(2, '0')}</span>
                        </td>

                        <td className="px-5 py-4 max-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                              <ScrollText size={13} className="text-purple-600" />
                            </div>
                            <span className="text-xs font-semibold text-black truncate">{term.title}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 max-w-[300px]">
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {term.description || '—'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <button onClick={() => handleToggle(term)} disabled={actionLoading}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-all disabled:opacity-40 ${
                              term.isActive
                                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${term.isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                            {term.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-neutral-400">
                            {term.createdAt ? new Date(term.createdAt).toLocaleDateString() : '—'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openView(term)}
                              className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                              <Eye size={13} className="text-blue-500" />
                            </button>
                            <button onClick={() => openEdit(term)} disabled={actionLoading}
                              className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 flex items-center justify-center transition-colors disabled:opacity-40">
                              <Edit size={13} className="text-purple-600" />
                            </button>
                            <button onClick={() => handleDelete(tid)} disabled={actionLoading}
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

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4">
                  <ScrollText size={22} className="text-neutral-300" />
                </div>
                <p className="text-sm font-semibold text-black">
                  {searchTerm ? 'No terms match your search' : 'No Terms Yet'}
                </p>
                <p className="text-xs text-neutral-400 mt-1 mb-5">
                  {searchTerm ? 'Try a different keyword.' : 'Add your first term to get started.'}
                </p>
                {!searchTerm && (
                  <button onClick={openAdd}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors">
                    <Plus size={14} /> Add First Term
                  </button>
                )}
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

            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${editingTerm ? 'bg-purple-100 border border-purple-200' : 'bg-purple-600'}`}>
                  {editingTerm ? <Edit size={15} className="text-purple-600" /> : <Plus size={15} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">{editingTerm ? 'Edit Term' : 'Add New Term'}</h2>
                  <p className="text-[10px] text-neutral-400">{editingTerm ? 'Update term details' : 'Fill in the term information'}</p>
                </div>
              </div>
              <button onClick={closeFormModal} className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors">
                <X size={14} className="text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium">{formError}</p>
                </div>
              )}

              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" placeholder="e.g. Product Purchase Terms"
                  value={formData.title}
                  onChange={(e) => { setFormData(p => ({ ...p, title: e.target.value })); setFormError('') }}
                  disabled={actionLoading} className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Description *</label>
                <textarea rows={5} placeholder="Enter the full terms description…"
                  value={formData.description}
                  onChange={(e) => { setFormData(p => ({ ...p, description: e.target.value })); setFormError('') }}
                  disabled={actionLoading} className={inputCls + ' resize-none'} required />
              </div>

              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-black">Status</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Whether this term is publicly active</p>
                </div>
                <button type="button" onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))} className="flex items-center gap-2 transition-all">
                  {formData.isActive ? (
                    <><ToggleRight size={26} className="text-purple-600" /><span className="text-xs font-semibold text-purple-600">Active</span></>
                  ) : (
                    <><ToggleLeft size={26} className="text-neutral-400" /><span className="text-xs font-semibold text-neutral-400">Inactive</span></>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button type="button" onClick={closeFormModal} disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-sm font-semibold text-neutral-600 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors">
                  {actionLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : editingTerm ? <Edit size={14} /> : <Plus size={14} />}
                  {actionLoading ? 'Saving…' : editingTerm ? 'Update Term' : 'Add Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ VIEW MODAL ══ */}
      {showViewModal && viewingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200">

            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <ScrollText size={15} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black truncate max-w-xs">{viewingTerm.title}</h2>
                  <p className="text-[10px] text-neutral-400">
                    {viewingTerm.createdAt ? new Date(viewingTerm.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(viewingTerm)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-100 transition-colors">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => setShowViewModal(false)}
                  className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors">
                  <X size={14} className="text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                  viewingTerm.isActive
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${viewingTerm.isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                  {viewingTerm.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-medium text-purple-600">
                  <ScrollText size={10} /> Terms & Conditions
                </span>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={13} className="text-neutral-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Term Content</span>
                </div>
                <p className="text-sm text-neutral-700 leading-7 whitespace-pre-wrap">{viewingTerm.description}</p>
              </div>

              {(viewingTerm.updatedAt || viewingTerm.createdAt) && (
                <div className="grid grid-cols-2 gap-2.5">
                  {viewingTerm.createdAt && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Created</p>
                      <p className="text-sm font-semibold text-black">{new Date(viewingTerm.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingTerm.updatedAt && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Last Updated</p>
                      <p className="text-sm font-semibold text-black">{new Date(viewingTerm.updatedAt).toLocaleDateString()}</p>
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