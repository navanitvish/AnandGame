// SlotManager.jsx
// White bg · purple accents · black text
// Features: view slot details, add multiple time slots, select/deselect, past slot disabling

import { useState, useEffect } from 'react'
import {
  Eye, Plus, X, Clock, Calendar, CheckCircle,
  XCircle, Ban, Layers, ChevronDown, Trash2,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const to12 = (time24) => {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

const isPast = (timeStr) => {
  const [start] = timeStr.split(' - ')
  const today = new Date().toISOString().split('T')[0]
  // handle both 12h "08:00 AM" and 24h "08:00"
  const dt = new Date(`${today} ${start}`)
  return dt < new Date()
}

// Generate slots between two times with given duration (minutes)
const generateSlots = (start24, end24, durationMins) => {
  const slots = []
  const base = '2024-01-01'
  let cur = new Date(`${base}T${start24}`)
  const end = new Date(`${base}T${end24}`)
  let i = 1
  while (cur < end) {
    const next = new Date(cur.getTime() + durationMins * 60000)
    if (next > end) break
    const startStr = to12(cur.toTimeString().slice(0, 5))
    const endStr   = to12(next.toTimeString().slice(0, 5))
    slots.push({
      id: `gen-${Date.now()}-${i++}`,
      label: `${durationMins} min`,
      time: `${startStr} - ${endStr}`,
      status: Math.random() > 0.65 ? 'booked' : 'available',
    })
    cur = next
  }
  return slots
}

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_SPORTS = [
  {
    id: 1,
    name: 'Cricket',
    color: 'purple',
    slots: [
      { id: 'c1', label: 'T20',      time: '08:00 AM - 12:00 PM', status: 'available' },
      { id: 'c2', label: 'One Day',  time: '12:30 PM - 06:00 PM', status: 'booked'    },
      { id: 'c3', label: 'Practice', time: '06:30 PM - 09:30 PM', status: 'available' },
    ],
  },
  {
    id: 2,
    name: 'Badminton',
    color: 'blue',
    slots: generateSlots('07:00', '11:00', 60),
  },
  {
    id: 3,
    name: 'Football',
    color: 'emerald',
    slots: generateSlots('06:00', '12:00', 90),
  },
]

// ─── Style maps ───────────────────────────────────────────────────────────────
const SLOT_STYLE = {
  available: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400 cursor-pointer',
  booked:    'bg-red-50 border-red-200 text-red-600 cursor-not-allowed',
  selected:  'bg-purple-600 border-purple-600 text-white cursor-pointer shadow-md shadow-purple-200',
  disabled:  'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60',
}

const SPORT_ACCENT = {
  purple:  { dot: 'bg-purple-500',  badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  blue:    { dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700 border-blue-200'       },
  emerald: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  amber:   { dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700 border-amber-200'    },
  rose:    { dot: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700 border-rose-200'       },
}
const COLORS = ['purple', 'blue', 'emerald', 'amber', 'rose']

const STATUS_ICON = {
  available: <CheckCircle className="h-3 w-3" />,
  booked:    <XCircle className="h-3 w-3" />,
  selected:  <CheckCircle className="h-3 w-3" />,
  disabled:  <Ban className="h-3 w-3" />,
}

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ slot, onClose }) => {
  if (!slot) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-bold text-black">Slot Details</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {[
            { icon: <Layers className="h-3.5 w-3.5 text-purple-600" />, label: 'Sport', value: slot.sport },
            { icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />, label: 'Type', value: slot.label },
            { icon: <Clock className="h-3.5 w-3.5 text-blue-600" />, label: 'Time', value: slot.time },
            {
              icon: <Calendar className="h-3.5 w-3.5 text-amber-600" />, label: 'Status',
              value: (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border capitalize ${
                  slot.status === 'booked'    ? 'bg-red-50 text-red-600 border-red-200'         :
                  slot.status === 'selected'  ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  slot.status === 'disabled'  ? 'bg-neutral-100 text-neutral-500 border-neutral-200' :
                                               'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>{slot.status}</span>
              ),
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                {icon} {label}
              </div>
              <div className="text-xs font-semibold text-black">{value}</div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────
// Strategy: user can add ONE manual slot OR auto-generate multiple slots
// by providing start, end, and duration → preview → confirm

const EMPTY_MANUAL = { label: '', startTime: '', endTime: '' }

const AddSlotModal = ({ sports, onClose, onSave }) => {
  const [sport,    setSport]    = useState('')
  const [mode,     setMode]     = useState('manual')   // 'manual' | 'generate'
  const [manuals,  setManuals]  = useState([{ ...EMPTY_MANUAL }])
  const [gen,      setGen]      = useState({ startTime: '', endTime: '', duration: '60' })
  const [preview,  setPreview]  = useState([])
  const [genError, setGenError] = useState('')

  // Add another manual row
  const addRow = () => setManuals((p) => [...p, { ...EMPTY_MANUAL }])
  const removeRow = (i) => setManuals((p) => p.filter((_, idx) => idx !== i))
  const updateRow = (i, field, val) =>
    setManuals((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  // Generate preview slots
  const handleGenerate = () => {
    setGenError('')
    if (!gen.startTime || !gen.endTime || !gen.duration) {
      setGenError('Fill in start time, end time, and duration.')
      return
    }
    const slots = generateSlots(gen.startTime, gen.endTime, parseInt(gen.duration))
    if (slots.length === 0) {
      setGenError('No slots fit in that range. Adjust times or duration.')
      return
    }
    setPreview(slots)
  }

  const handleSave = () => {
    if (!sport) return
    if (mode === 'manual') {
      const valid = manuals.filter((r) => r.startTime && r.endTime)
      if (!valid.length) return
      const slots = valid.map((r, i) => ({
        id: `manual-${Date.now()}-${i}`,
        label: r.label || 'Custom',
        time: `${to12(r.startTime)} - ${to12(r.endTime)}`,
        status: 'available',
      }))
      onSave(sport, slots)
    } else {
      if (!preview.length) return
      onSave(sport, preview.map((s) => ({ ...s, id: `gen-${Date.now()}-${s.id}`, status: 'available' })))
    }
  }

  const inputCls = 'w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all'
  const labelCls = 'block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Plus className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black">Add Time Slots</h2>
              <p className="text-[10px] text-neutral-400">Add single or bulk slots to a sport</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Sport selector */}
          <div>
            <label className={labelCls}>Sport *</label>
            <div className="relative">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className={inputCls + ' appearance-none pr-8'}
              >
                <option value="">Select sport…</option>
                {sports.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
            {[
              { value: 'manual',   label: 'Manual Slots' },
              { value: 'generate', label: 'Auto Generate' },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => { setMode(m.value); setPreview([]) }}
                className={`flex-1 py-2 text-xs font-semibold transition-all ${
                  mode === m.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* ── Manual mode ── */}
          {mode === 'manual' && (
            <div className="space-y-3">
              {manuals.map((row, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-neutral-500">Slot {i + 1}</span>
                    {manuals.length > 1 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Slot Label</label>
                    <input
                      type="text"
                      placeholder="e.g. T20, Practice, Custom"
                      value={row.label}
                      onChange={(e) => updateRow(i, 'label', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Start Time *</label>
                      <input type="time" value={row.startTime}
                        onChange={(e) => updateRow(i, 'startTime', e.target.value)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>End Time *</label>
                      <input type="time" value={row.endTime}
                        onChange={(e) => updateRow(i, 'endTime', e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addRow}
                className="w-full py-2.5 rounded-xl border border-dashed border-purple-300 text-purple-600 text-xs font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Another Slot
              </button>
            </div>
          )}

          {/* ── Generate mode ── */}
          {mode === 'generate' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Time *</label>
                    <input type="time" value={gen.startTime}
                      onChange={(e) => { setGen({ ...gen, startTime: e.target.value }); setPreview([]); setGenError('') }}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Time *</label>
                    <input type="time" value={gen.endTime}
                      onChange={(e) => { setGen({ ...gen, endTime: e.target.value }); setPreview([]); setGenError('') }}
                      className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Duration per Slot (minutes) *</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['30', '45', '60', '90', '120'].map((d) => (
                      <button
                        key={d}
                        onClick={() => { setGen({ ...gen, duration: d }); setPreview([]); setGenError('') }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          gen.duration === d
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                    <input
                      type="number"
                      placeholder="Custom"
                      value={['30','45','60','90','120'].includes(gen.duration) ? '' : gen.duration}
                      onChange={(e) => { setGen({ ...gen, duration: e.target.value }); setPreview([]); setGenError('') }}
                      className="w-20 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400"
                    />
                  </div>
                </div>

                {genError && (
                  <p className="text-xs text-red-500 font-medium">{genError}</p>
                )}

                <button
                  onClick={handleGenerate}
                  className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-all"
                >
                  Preview Slots
                </button>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      Preview — {preview.length} slots
                    </p>
                    <button onClick={() => setPreview([])} className="text-xs text-red-400 hover:text-red-600">Clear</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {preview.map((s, i) => (
                      <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="text-xs font-semibold text-emerald-700">{s.label}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">{s.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!sport || (mode === 'generate' && preview.length === 0)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-purple-200"
          >
            <Plus className="h-4 w-4" />
            {mode === 'generate' ? `Add ${preview.length} Slots` : 'Save Slots'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = () => (
  <div className="flex flex-wrap items-center gap-4">
    {[
      { status: 'available', label: 'Available',  color: 'bg-emerald-400' },
      { status: 'booked',    label: 'Booked',     color: 'bg-red-400'     },
      { status: 'selected',  label: 'Selected',   color: 'bg-purple-600'  },
      { status: 'disabled',  label: 'Past',       color: 'bg-neutral-300' },
    ].map(({ label, color }) => (
      <div key={label} className="flex items-center gap-1.5">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
    ))}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SlotManager() {
  const [sports,   setSports]   = useState([])
  const [selected, setSelected] = useState(null)
  const [showAdd,  setShowAdd]  = useState(false)

  useEffect(() => {
    const data = INITIAL_SPORTS.map((s) => ({
      ...s,
      slots: s.slots.map((slot) =>
        isPast(slot.time) ? { ...slot, status: 'disabled' } : slot
      ),
    }))
    setSports(data)
  }, [])

  // Toggle selection (available ↔ selected); booked/disabled are locked
  const handleSelect = (sportId, slotId) => {
    setSports((prev) =>
      prev.map((s) =>
        s.id !== sportId ? s : {
          ...s,
          slots: s.slots.map((slot) => {
            if (slot.id !== slotId) return slot
            if (slot.status === 'booked' || slot.status === 'disabled') return slot
            return { ...slot, status: slot.status === 'selected' ? 'available' : 'selected' }
          }),
        }
      )
    )
  }

  // Add slots (from modal) to the target sport
  const handleAddSlots = (sportName, newSlots) => {
    setSports((prev) =>
      prev.map((s) =>
        s.name === sportName
          ? { ...s, slots: [...s.slots, ...newSlots] }
          : s
      )
    )
    setShowAdd(false)
  }

  // Counts per sport
  const counts = (slots) => ({
    total:     slots.length,
    available: slots.filter((s) => s.status === 'available').length,
    booked:    slots.filter((s) => s.status === 'booked').length,
    selected:  slots.filter((s) => s.status === 'selected').length,
  })

  const totalSelected = sports.flatMap((s) => s.slots).filter((s) => s.status === 'selected').length

  return (
    <div className="min-h-screen bg-white p-6 space-y-5">

      {/* ── Header Banner ──────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-purple-50 p-7">
        <div className="pointer-events-none absolute -top-10 right-20 h-48 w-48 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-4  h-32 w-32 rounded-full bg-violet-400/20 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Slot Manager</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-1">Time Slot Manager</h1>
            <p className="text-sm text-neutral-500">Select, view, and manage sport ground time slots</p>

            <div className="flex flex-wrap items-center gap-5 mt-4 text-sm font-semibold">
              <span className="flex items-center gap-2 text-black">
                <Layers className="h-4 w-4 text-purple-600" />
                {sports.reduce((a, s) => a + s.slots.length, 0)} Total Slots
              </span>
              {totalSelected > 0 && (
                <span className="flex items-center gap-2 text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1 rounded-full text-xs">
                  <CheckCircle className="h-3.5 w-3.5" /> {totalSelected} Selected
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-300/30 self-start"
          >
            <Plus className="h-4 w-4" /> Add Slots
          </button>
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-3">
        <Legend />
      </div>

      {/* ── Sport Sections ─────────────────────────── */}
      {sports.map((sport, si) => {
        const ac = SPORT_ACCENT[sport.color] || SPORT_ACCENT.purple
        const c  = counts(sport.slots)

        return (
          <div key={sport.id} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:border-purple-200 hover:shadow-sm transition-all">

            {/* Section header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${ac.dot}`} />
                <h2 className="text-sm font-bold text-black">{sport.name}</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${ac.badge}`}>
                  {c.total} slots
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                  {c.available} free
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
                  {c.booked} booked
                </span>
                {c.selected > 0 && (
                  <span className="flex items-center gap-1 text-purple-600 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" />
                    {c.selected} selected
                  </span>
                )}
              </div>
            </div>

            {/* Slots grid */}
            <div className="p-5">
              {sport.slots.length === 0 ? (
                <div className="text-center py-8 text-neutral-300 text-sm">No slots yet</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sport.slots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSelect(sport.id, slot.id)}
                      className={`relative rounded-xl border p-3 transition-all duration-150 ${SLOT_STYLE[slot.status] || SLOT_STYLE.available}`}
                    >
                      {/* Status icon top-right */}
                      <div className="absolute top-2 right-2 opacity-70">
                        {STATUS_ICON[slot.status]}
                      </div>

                      <p className="text-xs font-bold pr-4 leading-snug">{slot.label}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="h-3 w-3 opacity-60 flex-shrink-0" />
                        <p className="text-[10px] leading-tight opacity-80">{slot.time}</p>
                      </div>

                      {/* View button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected({ ...slot, sport: sport.name })
                        }}
                        className={`mt-2 flex items-center gap-1 text-[10px] font-semibold transition-all ${
                          slot.status === 'selected'
                            ? 'text-white/80 hover:text-white'
                            : 'text-blue-500 hover:text-blue-700'
                        }`}
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* ── Confirm Bar (when slots selected) ─────── */}
      {totalSelected > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 bg-black text-white rounded-2xl px-6 py-3.5 shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              {totalSelected} slot{totalSelected > 1 ? 's' : ''} selected
            </div>
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={() =>
                setSports((prev) =>
                  prev.map((s) => ({
                    ...s,
                    slots: s.slots.map((sl) =>
                      sl.status === 'selected' ? { ...sl, status: 'available' } : sl
                    ),
                  }))
                )
              }
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-all">
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────── */}
      {selected && <ViewModal slot={selected} onClose={() => setSelected(null)} />}
      {showAdd && (
        <AddSlotModal
          sports={sports}
          onClose={() => setShowAdd(false)}
          onSave={handleAddSlots}
        />
      )}
    </div>
  )
}