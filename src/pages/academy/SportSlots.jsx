// SlotManager.jsx
// Date-based time slot manager — no sports, just dates + time slots
// White bg · purple accents · black text

import { useState, useEffect } from 'react'
import {
  Plus, X, Clock, Calendar, CheckCircle,
  XCircle, Ban, ChevronDown, Trash2,
  ChevronLeft, ChevronRight, Eye,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const to12 = (time24) => {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

const todayStr = () => new Date().toISOString().split('T')[0]

const isPastSlot = (dateStr, startTime12) => {
  try {
    const dt = new Date(`${dateStr} ${startTime12}`)
    return dt < new Date()
  } catch { return false }
}

const formatDateFull = (ds) =>
  new Date(ds + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })

const formatDateShort = (ds) => {
  const d = new Date(ds + 'T00:00:00')
  if (ds === todayStr()) return 'Today'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

const generateSlots = (start24, end24, durationMins) => {
  const slots = []
  const base = '2024-01-01'
  let cur = new Date(`${base}T${start24}`)
  const end = new Date(`${base}T${end24}`)
  let i = 1
  while (cur < end) {
    const next = new Date(cur.getTime() + durationMins * 60000)
    if (next > end) break
    slots.push({
      id: `gen-${Date.now()}-${i++}`,
      label: `${durationMins} min`,
      startTime: to12(cur.toTimeString().slice(0, 5)),
      endTime:   to12(next.toTimeString().slice(0, 5)),
      status: 'available',
    })
    cur = next
  }
  return slots
}

// ─── Style maps ───────────────────────────────────────────────────────────────
const SLOT_STYLE = {
  available: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 cursor-pointer',
  booked:    'bg-red-50 border-red-200 text-red-600 cursor-not-allowed',
  selected:  'bg-purple-600 border-purple-600 text-white cursor-pointer shadow-md shadow-purple-200',
  disabled:  'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed opacity-60',
}

const STATUS_ICON = {
  available: <CheckCircle className="h-3 w-3" />,
  booked:    <XCircle className="h-3 w-3" />,
  selected:  <CheckCircle className="h-3 w-3" />,
  disabled:  <Ban className="h-3 w-3" />,
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDates, onToggleDate, onClose }) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear,  setViewYear]  = useState(today.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const monthName   = new Date(viewYear, viewMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const toDs = (day) => {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${viewYear}-${m}-${d}`
  }

  const isPastDay = (day) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return d < t
  }

  return (
    <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl border border-neutral-200 shadow-2xl p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-black">{monthName}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-neutral-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const ds   = toDs(day)
          const past = isPastDay(day)
          const sel  = selectedDates.includes(ds)
          return (
            <button
              key={day}
              disabled={past}
              onClick={() => onToggleDate(ds)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all mx-auto flex items-center justify-center
                ${past ? 'text-neutral-300 cursor-not-allowed' :
                  sel  ? 'bg-purple-600 text-white shadow-md shadow-purple-200' :
                         'text-black hover:bg-purple-50 hover:text-purple-700'}`}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <span className="text-[10px] text-neutral-400">
          {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
        </span>
        <button onClick={onClose} className="text-xs font-semibold text-purple-600 hover:text-purple-800">
          Done
        </button>
      </div>
    </div>
  )
}

// ─── View Slot Modal ──────────────────────────────────────────────────────────
function ViewModal({ slot, dateStr, onClose }) {
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
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { icon: <Calendar className="h-3.5 w-3.5 text-amber-500" />,  label: 'Date',  value: formatDateFull(dateStr) },
            { icon: <Clock className="h-3.5 w-3.5 text-blue-500" />,     label: 'Start', value: slot.startTime },
            { icon: <Clock className="h-3.5 w-3.5 text-purple-500" />,   label: 'End',   value: slot.endTime   },
            { icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />, label: 'Label', value: slot.label || '—' },
            {
              icon: <Ban className="h-3.5 w-3.5 text-neutral-400" />, label: 'Status',
              value: (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border capitalize
                  ${slot.status === 'booked'   ? 'bg-red-50 text-red-600 border-red-200' :
                    slot.status === 'selected' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    slot.status === 'disabled' ? 'bg-neutral-100 text-neutral-500 border-neutral-200' :
                                                 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {slot.status}
                </span>
              ),
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-2 text-xs text-neutral-400">{icon}{label}</div>
              <div className="text-xs font-semibold text-black">{value}</div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Slots Modal ──────────────────────────────────────────────────────────
const EMPTY_ROW = { label: '', startTime: '', endTime: '' }

function AddSlotModal({ onClose, onSave }) {
  const [selectedDates, setSelectedDates] = useState([])
  const [showCal,       setShowCal]       = useState(false)
  const [mode,          setMode]          = useState('manual')   // 'manual' | 'generate'
  const [rows,          setRows]          = useState([{ ...EMPTY_ROW }])
  const [gen,           setGen]           = useState({ startTime: '', endTime: '', duration: '60' })
  const [preview,       setPreview]       = useState([])
  const [genError,      setGenError]      = useState('')

  const toggleDate = (ds) =>
    setSelectedDates(p => p.includes(ds) ? p.filter(d => d !== ds) : [...p, ds].sort())

  const addRow    = () => setRows(p => [...p, { ...EMPTY_ROW }])
  const removeRow = (i) => setRows(p => p.filter((_, idx) => idx !== i))
  const updateRow = (i, f, v) => setRows(p => p.map((r, idx) => idx === i ? { ...r, [f]: v } : r))

  const handleGenerate = () => {
    setGenError('')
    if (!gen.startTime || !gen.endTime || !gen.duration) {
      setGenError('Fill all fields.'); return
    }
    const slots = generateSlots(gen.startTime, gen.endTime, parseInt(gen.duration))
    if (!slots.length) { setGenError('No slots fit. Adjust range or duration.'); return }
    setPreview(slots)
  }

  const handleSave = () => {
    if (!selectedDates.length) return
    let baseSlots = []
    if (mode === 'manual') {
      const valid = rows.filter(r => r.startTime && r.endTime)
      if (!valid.length) return
      baseSlots = valid.map((r, i) => ({
        id: `m-${Date.now()}-${i}`,
        label:     r.label || 'Custom',
        startTime: to12(r.startTime),
        endTime:   to12(r.endTime),
        status:    'available',
      }))
    } else {
      if (!preview.length) return
      baseSlots = preview.map(s => ({ ...s, status: 'available' }))
    }
    onSave(selectedDates, baseSlots)
  }

  const canSave = selectedDates.length > 0 &&
    (mode === 'manual'
      ? rows.some(r => r.startTime && r.endTime)
      : preview.length > 0)

  const totalToAdd = canSave
    ? (mode === 'manual'
        ? rows.filter(r => r.startTime && r.endTime).length
        : preview.length) * selectedDates.length
    : 0

  const inp = 'w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all'
  const lbl = 'block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Plus className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black">Add Time Slots</h2>
              <p className="text-[10px] text-neutral-400">Pick dates · configure time slots</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* ── Date Picker ── */}
          <div>
            <label className={lbl}>
              Dates * <span className="normal-case font-normal text-neutral-300">(tap multiple)</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCal(v => !v)}
                className={`w-full flex items-center justify-between border rounded-xl px-3 py-2.5 text-sm transition-all
                  ${showCal ? 'border-purple-400 ring-2 ring-purple-400/30' : 'border-neutral-200 hover:border-purple-300'}
                  ${selectedDates.length ? 'text-black' : 'text-neutral-400'}`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  {selectedDates.length === 0
                    ? 'Select one or more dates…'
                    : selectedDates.length === 1
                      ? formatDateFull(selectedDates[0])
                      : `${selectedDates.length} dates selected`}
                </span>
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showCal ? 'rotate-180' : ''}`} />
              </button>

              {showCal && (
                <MiniCalendar
                  selectedDates={selectedDates}
                  onToggleDate={toggleDate}
                  onClose={() => setShowCal(false)}
                />
              )}
            </div>

            {/* Date chips */}
            {selectedDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedDates.map(ds => (
                  <span key={ds} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDateFull(ds)}
                    <button onClick={() => toggleDate(ds)} className="ml-0.5 text-purple-400 hover:text-purple-700">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Mode Toggle ── */}
          <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
            {[{ value: 'manual', label: 'Manual Slots' }, { value: 'generate', label: 'Auto Generate' }].map(m => (
              <button
                key={m.value}
                onClick={() => { setMode(m.value); setPreview([]) }}
                className={`flex-1 py-2 text-xs font-semibold transition-all
                  ${mode === m.value ? 'bg-purple-600 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* ── Manual mode ── */}
          {mode === 'manual' && (
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500">Slot {i + 1}</span>
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(i)} className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className={lbl}>Label <span className="normal-case font-normal text-neutral-300">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Morning, Practice, T20"
                      value={row.label}
                      onChange={e => updateRow(i, 'label', e.target.value)}
                      className={inp}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Start Time *</label>
                      <input type="time" value={row.startTime}
                        onChange={e => updateRow(i, 'startTime', e.target.value)}
                        className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>End Time *</label>
                      <input type="time" value={row.endTime}
                        onChange={e => updateRow(i, 'endTime', e.target.value)}
                        className={inp} />
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

          {/* ── Auto Generate mode ── */}
          {mode === 'generate' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Start Time *</label>
                    <input type="time" value={gen.startTime}
                      onChange={e => { setGen(g => ({ ...g, startTime: e.target.value })); setPreview([]); setGenError('') }}
                      className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>End Time *</label>
                    <input type="time" value={gen.endTime}
                      onChange={e => { setGen(g => ({ ...g, endTime: e.target.value })); setPreview([]); setGenError('') }}
                      className={inp} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Duration per Slot (minutes) *</label>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {['30','45','60','90','120'].map(d => (
                      <button
                        key={d}
                        onClick={() => { setGen(g => ({ ...g, duration: d })); setPreview([]); setGenError('') }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                          ${gen.duration === d
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'}`}
                      >
                        {d} min
                      </button>
                    ))}
                    <input
                      type="number"
                      placeholder="Custom"
                      value={['30','45','60','90','120'].includes(gen.duration) ? '' : gen.duration}
                      onChange={e => { setGen(g => ({ ...g, duration: e.target.value })); setPreview([]); setGenError('') }}
                      className="w-20 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400"
                    />
                  </div>
                </div>

                {genError && <p className="text-xs text-red-500 font-medium">{genError}</p>}

                <button
                  onClick={handleGenerate}
                  className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-all"
                >
                  Preview Slots
                </button>
              </div>

              {preview.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      {preview.length} slots × {selectedDates.length || '?'} date{selectedDates.length !== 1 ? 's' : ''}
                      {selectedDates.length > 0 && (
                        <span className="text-purple-600 ml-1 normal-case font-semibold">
                          = {preview.length * selectedDates.length} total
                        </span>
                      )}
                    </p>
                    <button onClick={() => setPreview([])} className="text-xs text-red-400 hover:text-red-600">Clear</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {preview.map((s, i) => (
                      <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="text-xs font-semibold text-emerald-700">{s.label}</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">{s.startTime} – {s.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100 flex-shrink-0">
          <p className="text-[11px] text-neutral-400">
            {totalToAdd > 0
              ? `Adding ${totalToAdd} slot${totalToAdd > 1 ? 's' : ''} across ${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''}`
              : 'Select dates and configure slots'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-purple-200"
            >
              <Plus className="h-4 w-4" />
              {totalToAdd > 0 ? `Add ${totalToAdd} Slots` : 'Save Slots'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = () => (
  <div className="flex flex-wrap items-center gap-4">
    {[
      { label: 'Available', color: 'bg-emerald-400' },
      { label: 'Booked',    color: 'bg-red-400'     },
      { label: 'Selected',  color: 'bg-purple-600'  },
      { label: 'Past',      color: 'bg-neutral-300' },
    ].map(({ label, color }) => (
      <div key={label} className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
    ))}
  </div>
)

// ─── Seed initial data ────────────────────────────────────────────────────────
const seedDateSlots = () => {
  const today    = todayStr()
  const tom      = new Date(); tom.setDate(tom.getDate() + 1)
  const tomStr   = tom.toISOString().split('T')[0]
  const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2)
  const dayStr   = dayAfter.toISOString().split('T')[0]

  const applyPast = (ds, slots) =>
    slots.map(s => ({
      ...s,
      status: isPastSlot(ds, s.startTime) ? 'disabled' : s.status,
    }))

  return {
    [today]:  applyPast(today,  generateSlots('07:00', '13:00', 60)),
    [tomStr]: generateSlots('08:00', '20:00', 90),
    [dayStr]: generateSlots('06:00', '12:00', 60),
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function SlotManager() {
  const [dateSlots,   setDateSlots]   = useState({})      // { [dateStr]: Slot[] }
  const [activeDate,  setActiveDate]  = useState(todayStr())
  const [viewSlot,    setViewSlot]    = useState(null)    // { slot, dateStr }
  const [showAdd,     setShowAdd]     = useState(false)

  useEffect(() => {
    setDateSlots(seedDateSlots())
  }, [])

  // All dates sorted
  const allDates = Object.keys(dateSlots).sort()
  const slots    = dateSlots[activeDate] || []

  // Ensure activeDate is valid
  useEffect(() => {
    if (allDates.length && !dateSlots[activeDate]) {
      setActiveDate(allDates[0])
    }
  }, [allDates.join()])

  // Toggle slot selection
  const handleSelect = (slotId) => {
    setDateSlots(prev => ({
      ...prev,
      [activeDate]: (prev[activeDate] || []).map(s => {
        if (s.id !== slotId) return s
        if (s.status === 'booked' || s.status === 'disabled') return s
        return { ...s, status: s.status === 'selected' ? 'available' : 'selected' }
      }),
    }))
  }

  // Add slots from modal
  const handleAddSlots = (dates, baseSlots) => {
    setDateSlots(prev => {
      const updated = { ...prev }
      dates.forEach(ds => {
        const newSlots = baseSlots.map((sl, i) => ({
          ...sl,
          id: `${sl.id}-${ds}-${i}`,
          status: isPastSlot(ds, sl.startTime) ? 'disabled' : 'available',
        }))
        updated[ds] = [...(updated[ds] || []), ...newSlots]
      })
      return updated
    })
    // Switch to first newly added date
    if (dates.length) setActiveDate(dates[0])
    setShowAdd(false)
  }

  const totalSelected = Object.values(dateSlots).flat().filter(s => s.status === 'selected').length
  const totalSlots    = Object.values(dateSlots).flat().length

  const c = {
    available: slots.filter(s => s.status === 'available').length,
    booked:    slots.filter(s => s.status === 'booked').length,
    selected:  slots.filter(s => s.status === 'selected').length,
    disabled:  slots.filter(s => s.status === 'disabled').length,
  }

  return (
    <div className="min-h-screen bg-white p-6 space-y-5">

      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-purple-50 p-7">
        <div className="pointer-events-none absolute -top-10 right-20 h-48 w-48 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-4  h-32 w-32 rounded-full bg-violet-400/20 blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Slot Manager</span>
            </div>
            <h1 className="text-2xl font-bold text-black mb-1">Time Slot Manager</h1>
            <p className="text-sm text-neutral-500">Manage time slots by date</p>

            <div className="flex flex-wrap items-center gap-5 mt-4 text-sm font-semibold">
              <span className="flex items-center gap-2 text-black">
                <Clock className="h-4 w-4 text-purple-600" />
                {totalSlots} Total Slots
              </span>
              <span className="flex items-center gap-2 text-black">
                <Calendar className="h-4 w-4 text-purple-600" />
                {allDates.length} Date{allDates.length !== 1 ? 's' : ''}
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

      {/* ── Legend ── */}
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-3">
        <Legend />
      </div>

      {/* ── Main Card ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">

        {/* Date tabs */}
        {allDates.length > 0 ? (
          <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {allDates.map(ds => {
                const cnt    = (dateSlots[ds] || []).length
                const selCnt = (dateSlots[ds] || []).filter(s => s.status === 'selected').length
                const active = ds === activeDate
                return (
                  <button
                    key={ds}
                    onClick={() => setActiveDate(ds)}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all
                      ${active
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-purple-300 hover:text-purple-700'}`}
                  >
                    <span className="font-bold">{formatDateShort(ds)}</span>
                    <span className={`text-[10px] mt-0.5 ${active ? 'text-white/70' : 'text-neutral-400'}`}>
                      {cnt} slot{cnt !== 1 ? 's' : ''}{selCnt > 0 ? ` · ${selCnt} sel` : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Active date header */}
        {activeDate && allDates.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-white">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-bold text-black">{formatDateFull(activeDate)}</span>
              <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                {slots.length} slots
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              {c.available > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />{c.available} free
                </span>
              )}
              {c.booked > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />{c.booked} booked
                </span>
              )}
              {c.selected > 0 && (
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />{c.selected} selected
                </span>
              )}
              {c.disabled > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-neutral-300" />{c.disabled} past
                </span>
              )}
            </div>
          </div>
        )}

        {/* Slots grid */}
        <div className="p-5">
          {allDates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm font-semibold text-neutral-500 mb-1">No slots yet</p>
              <p className="text-xs text-neutral-400 mb-4">Click "Add Slots" to create your first time slots</p>
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Add Slots
              </button>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-sm">
              No slots for this date. Click "Add Slots" to add some.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {slots.map(slot => (
                <div
                  key={slot.id}
                  onClick={() => handleSelect(slot.id)}
                  className={`relative rounded-xl border p-3 transition-all duration-150 ${SLOT_STYLE[slot.status] || SLOT_STYLE.available}`}
                >
                  {/* Status icon */}
                  <div className="absolute top-2 right-2 opacity-70">
                    {STATUS_ICON[slot.status]}
                  </div>

                  {slot.label && (
                    <p className="text-xs font-bold pr-5 leading-snug mb-1">{slot.label}</p>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 opacity-60 flex-shrink-0" />
                    <p className="text-[11px] font-semibold leading-tight">{slot.startTime}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="h-3 w-3 flex-shrink-0" />
                    <p className="text-[10px] opacity-70">– {slot.endTime}</p>
                  </div>

                  {/* View button */}
                  <button
                    onClick={e => { e.stopPropagation(); setViewSlot({ slot, dateStr: activeDate }) }}
                    className={`mt-2 flex items-center gap-1 text-[10px] font-semibold transition-all
                      ${slot.status === 'selected' ? 'text-white/80 hover:text-white' : 'text-blue-500 hover:text-blue-700'}`}
                  >
                    <Eye className="h-3 w-3" /> View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Bar ── */}
      {totalSelected > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 bg-black text-white rounded-2xl px-6 py-3.5 shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              {totalSelected} slot{totalSelected > 1 ? 's' : ''} selected
            </div>
            <div className="h-4 w-px bg-white/20" />
            <button
              onClick={() => setDateSlots(prev => {
                const next = {}
                Object.entries(prev).forEach(([ds, slts]) => {
                  next[ds] = slts.map(s => s.status === 'selected' ? { ...s, status: 'available' } : s)
                })
                return next
              })}
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

      {/* ── Modals ── */}
      {viewSlot && (
        <ViewModal
          slot={viewSlot.slot}
          dateStr={viewSlot.dateStr}
          onClose={() => setViewSlot(null)}
        />
      )}
      {showAdd && (
        <AddSlotModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddSlots}
        />
      )}
    </div>
  )
}