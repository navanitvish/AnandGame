import { useState } from "react";

const SPORTS = ["Cricket", "Football", "Basketball", "Kabaddi", "Volleyball"];
const SPORT_ICONS = {
  Cricket: "🏏",
  Football: "⚽",
  Basketball: "🏀",
  Kabaddi: "🤼",
  Volleyball: "🏐",
};
const SPORT_COLORS = {
  Cricket:    { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-500"  },
  Football:   { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-500"   },
  Basketball: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  Kabaddi:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",     dot: "bg-rose-500"    },
  Volleyball: { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",     dot: "bg-teal-500"    },
};

const STATUS_STYLES = {
  open:    { bg: "bg-green-50",  text: "text-green-700",  label: "Open"    },
  booked:  { bg: "bg-purple-50", text: "text-purple-700", label: "Booked"  },
  blocked: { bg: "bg-gray-100",  text: "text-gray-500",   label: "Blocked" },
};

const initialSlots = [
  { id: 1,  time: "05:00 AM", sport: "Cricket",    ground: "Green Valley Ground",   groundLink: "https://maps.google.com",  status: "booked",  players: 11, maxPlayers: 11 },
  { id: 2,  time: "05:00 AM", sport: "Football",   ground: "Sunrise Sports Arena",  groundLink: "https://maps.google.com",  status: "open",    players: 6,  maxPlayers: 11 },
  { id: 3,  time: "06:00 AM", sport: "Cricket",    ground: "Green Valley Ground",   groundLink: "https://maps.google.com",  status: "open",    players: 4,  maxPlayers: 11 },
  { id: 4,  time: "06:00 AM", sport: "Kabaddi",    ground: "Ganga View Arena",      groundLink: "https://maps.google.com",  status: "open",    players: 7,  maxPlayers: 11 },
  { id: 5,  time: "07:00 AM", sport: "Football",   ground: "Sunrise Sports Arena",  groundLink: "https://maps.google.com",  status: "booked",  players: 11, maxPlayers: 11 },
  { id: 6,  time: "07:00 AM", sport: "Basketball", ground: "Taj Sports Ground",     groundLink: "https://maps.google.com",  status: "open",    players: 2,  maxPlayers: 11 },
  { id: 7,  time: "04:00 PM", sport: "Cricket",    ground: "Green Valley Ground",   groundLink: "https://maps.google.com",  status: "open",    players: 0,  maxPlayers: 11 },
  { id: 8,  time: "05:00 PM", sport: "Basketball", ground: "Taj Sports Ground",     groundLink: "https://maps.google.com",  status: "open",    players: 3,  maxPlayers: 11 },
  { id: 9,  time: "06:00 PM", sport: "Volleyball", ground: "Sunrise Sports Arena",  groundLink: "https://maps.google.com",  status: "blocked", players: 0,  maxPlayers: 11 },
  { id: 10, time: "06:00 PM", sport: "Cricket",    ground: "Ganga View Arena",      groundLink: "https://maps.google.com",  status: "open",    players: 5,  maxPlayers: 11 },
];

const TIMES = ["05:00 AM","06:00 AM","07:00 AM","08:00 AM","04:00 PM","05:00 PM","06:00 PM","07:00 PM"];

const emptyForm = {
  time: "", sport: "Cricket", ground: "", groundLink: "", maxPlayers: 11, status: "open",
};

function SlotCard({ slot, onToggleStatus, onDelete }) {
  const sc = SPORT_COLORS[slot.sport] || SPORT_COLORS.Cricket;
  const ss = STATUS_STYLES[slot.status];
  const fill = Math.round((slot.players / slot.maxPlayers) * 100);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg ${sc.bg} flex items-center justify-center text-base flex-shrink-0`}>
            {SPORT_ICONS[slot.sport]}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{slot.sport}</p>
            <p className="text-xs text-gray-400">{slot.time}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}>
          {ss.label}
        </span>
      </div>

      {/* Ground with link */}
      <a
        href={slot.groundLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium mb-3 group/link"
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span className="truncate group-hover/link:underline">{slot.ground}</span>
        <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
      </a>

      {/* Player fill bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Players</span>
          <span className="font-medium text-gray-700">{slot.players}/{slot.maxPlayers}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${fill === 100 ? "bg-purple-500" : "bg-purple-300"}`}
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onToggleStatus(slot.id)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
        >
          {slot.status === "blocked" ? "Unblock" : slot.status === "open" ? "Block" : "Unblock"}
        </button>
        <button
          onClick={() => onDelete(slot.id)}
          className="w-8 h-7 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function SlotManagement() {
  const [slots, setSlots] = useState(initialSlots);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [filterSport, setFilterSport] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("timeline"); // timeline | grid

  // Group slots by time
  const filtered = slots.filter(s =>
    (filterSport === "All" || s.sport === filterSport) &&
    (filterStatus === "All" || s.status === filterStatus)
  );

  const grouped = TIMES.reduce((acc, t) => {
    const group = filtered.filter(s => s.time === t);
    if (group.length) acc[t] = group;
    return acc;
  }, {});

  const validate = () => {
    const e = {};
    if (!form.time)       e.time = "Select a time";
    if (!form.ground.trim()) e.ground = "Enter ground name";
    if (!form.groundLink.trim()) e.groundLink = "Enter ground link";
    else if (!/^https?:\/\/.+/.test(form.groundLink)) e.groundLink = "Enter valid URL (https://...)";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newSlot = {
      id: Date.now(),
      time: form.time,
      sport: form.sport,
      ground: form.ground.trim(),
      groundLink: form.groundLink.trim(),
      status: form.status,
      players: 0,
      maxPlayers: Number(form.maxPlayers),
    };
    setSlots(prev => [...prev, newSlot]);
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setSlots(prev => prev.map(s =>
      s.id === id
        ? { ...s, status: s.status === "blocked" ? "open" : s.status === "open" ? "blocked" : "open" }
        : s
    ));
  };

  const deleteSlot = (id) => setSlots(prev => prev.filter(s => s.id !== id));

  const stats = {
    total: slots.length,
    open: slots.filter(s => s.status === "open").length,
    booked: slots.filter(s => s.status === "booked").length,
    blocked: slots.filter(s => s.status === "blocked").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Slot Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage time slots across all playgrounds</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setErrors({}); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Add Slot
        </button>
      </div>

      <div className="px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Slots", value: stats.total, color: "text-gray-900" },
            { label: "Open",   value: stats.open,   color: "text-green-600" },
            { label: "Booked", value: stats.booked, color: "text-purple-600" },
            { label: "Blocked",value: stats.blocked,color: "text-gray-400" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + view toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Sport filter */}
          <div className="flex gap-1.5 flex-wrap">
            {["All", ...SPORTS].map(sp => (
              <button
                key={sp}
                onClick={() => setFilterSport(sp)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  filterSport === sp
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                }`}
              >
                {sp !== "All" && <span className="mr-1">{SPORT_ICONS[sp]}</span>}
                {sp}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          {/* Status filter */}
          {["All","open","booked","blocked"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all capitalize ${
                filterStatus === st
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {st}
            </button>
          ))}

          <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-1">
            {["timeline","grid"].map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`text-xs px-3 py-1 rounded-md capitalize font-medium transition-all ${
                  viewMode === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline view */}
        {viewMode === "timeline" && (
          <div className="space-y-6">
            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">No slots found for selected filters.</div>
            )}
            {Object.entries(grouped).map(([time, timeSlots]) => (
              <div key={time}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-sm font-semibold text-gray-800">{time}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {timeSlots.length} slot{timeSlots.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {timeSlots.map(slot => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      onToggleStatus={toggleStatus}
                      onDelete={deleteSlot}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.length === 0 && (
              <div className="col-span-4 text-center py-16 text-gray-400 text-sm">No slots found.</div>
            )}
            {filtered.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onToggleStatus={toggleStatus}
                onDelete={deleteSlot}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add new slot</h2>
                <p className="text-xs text-gray-400 mt-0.5">Set time, sport and playground</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Form body */}
            <div className="px-6 py-5 space-y-4">

              {/* Time + Sport row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Time *</label>
                  <select
                    value={form.time}
                    onChange={e => { setForm(f => ({...f, time: e.target.value})); setErrors(er => ({...er, time: ""})); }}
                    className={`w-full text-sm border rounded-xl px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-purple-400 ${errors.time ? "border-red-300" : "border-gray-200"}`}
                  >
                    <option value="">Select time</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Sport *</label>
                  <select
                    value={form.sport}
                    onChange={e => setForm(f => ({...f, sport: e.target.value}))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-purple-400"
                  >
                    {SPORTS.map(s => (
                      <option key={s} value={s}>{SPORT_ICONS[s]} {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ground name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Playground name *</label>
                <input
                  type="text"
                  value={form.ground}
                  onChange={e => { setForm(f => ({...f, ground: e.target.value})); setErrors(er => ({...er, ground: ""})); }}
                  placeholder="e.g. Green Valley Ground, Lucknow"
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400 ${errors.ground ? "border-red-300" : "border-gray-200"}`}
                />
                {errors.ground && <p className="text-xs text-red-500 mt-1">{errors.ground}</p>}
              </div>

              {/* Ground link */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Playground link *
                  <span className="ml-1 text-gray-400 font-normal">(Google Maps / website)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                  </span>
                  <input
                    type="url"
                    value={form.groundLink}
                    onChange={e => { setForm(f => ({...f, groundLink: e.target.value})); setErrors(er => ({...er, groundLink: ""})); }}
                    placeholder="https://maps.google.com/..."
                    className={`w-full text-sm border rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-400 ${errors.groundLink ? "border-red-300" : "border-gray-200"}`}
                  />
                </div>
                {errors.groundLink && <p className="text-xs text-red-500 mt-1">{errors.groundLink}</p>}
              </div>

              {/* Max players + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Max players</label>
                  <input
                    type="number"
                    min={2} max={22}
                    value={form.maxPlayers}
                    onChange={e => setForm(f => ({...f, maxPlayers: e.target.value}))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({...f, status: e.target.value}))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-purple-400"
                  >
                    <option value="open">Open</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Preview chip */}
              {form.time && form.sport && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${SPORT_COLORS[form.sport].bg} ${SPORT_COLORS[form.sport].text} ${SPORT_COLORS[form.sport].border}`}>
                  <span>{SPORT_ICONS[form.sport]}</span>
                  <span>{form.sport}</span>
                  <span className="text-gray-400">·</span>
                  <span>{form.time}</span>
                  {form.ground && <><span className="text-gray-400">·</span><span className="truncate">{form.ground}</span></>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl py-2.5 transition-colors"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}