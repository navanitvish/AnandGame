import { useState } from "react";

// ─── Static data ─────────────────────────────────────────────────────────────
const SPORTS = ["Cricket", "Football", "Basketball", "Kabaddi", "Volleyball"];
const SPORT_ICONS = { Cricket:"🏏", Football:"⚽", Basketball:"🏀", Kabaddi:"🤼", Volleyball:"🏐" };
const SPORT_COLORS = {
  Cricket:    { bg:"bg-purple-50",  text:"text-purple-700",  border:"border-purple-200" },
  Football:   { bg:"bg-green-50",   text:"text-green-700",   border:"border-green-200"  },
  Basketball: { bg:"bg-amber-50",   text:"text-amber-700",   border:"border-amber-200"  },
  Kabaddi:    { bg:"bg-rose-50",    text:"text-rose-700",    border:"border-rose-200"   },
  Volleyball: { bg:"bg-teal-50",    text:"text-teal-700",    border:"border-teal-200"   },
};

const PLAYGROUNDS = [
  { id:1, name:"Green Valley Ground",  city:"Lucknow",   sports:["Cricket","Football"] },
  { id:2, name:"Sunrise Sports Arena", city:"Lucknow",   sports:["Football","Volleyball","Basketball"] },
  { id:3, name:"Taj Sports Ground",    city:"Agra",      sports:["Cricket","Basketball"] },
  { id:4, name:"Ganga View Arena",     city:"Varanasi",  sports:["Kabaddi","Cricket"] },
  { id:5, name:"City Sports Complex",  city:"Kanpur",    sports:["Football","Basketball","Volleyball"] },
];

const TIME_SLOTS = [
  "05:00 AM","06:00 AM","07:00 AM","08:00 AM",
  "04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM",
];

const EXPERTISE_LEVELS = ["Beginner","Intermediate","Advanced","Professional"];

const INITIAL_COACHES = [
  { id:1, name:"Rahul Dravid", phone:"9876543210", email:"rahul@gametheory.in",
    sport:"Cricket", playgroundId:1, timeSlots:["06:00 AM","07:00 AM"],
    expertise:"Professional", experience:12, fee:800, bio:"Former national player. Specialises in batting technique.",
    active:true, avatar:"RD" },
  { id:2, name:"Sunil Chhetri", phone:"9812345678", email:"sunil@gametheory.in",
    sport:"Football", playgroundId:2, timeSlots:["05:00 PM","06:00 PM"],
    expertise:"Professional", experience:15, fee:1000, bio:"Certified UEFA coach with 15 years of experience.",
    active:true, avatar:"SC" },
  { id:3, name:"Priya Sharma", phone:"9856781234", email:"priya@gametheory.in",
    sport:"Basketball", playgroundId:2, timeSlots:["07:00 AM","04:00 PM"],
    expertise:"Advanced", experience:6, fee:600, bio:"State-level player, focuses on footwork and defence.",
    active:true, avatar:"PS" },
  { id:4, name:"Ajay Verma", phone:"9823456789", email:"ajay@gametheory.in",
    sport:"Kabaddi", playgroundId:4, timeSlots:["05:00 AM","06:00 AM"],
    expertise:"Advanced", experience:8, fee:500, bio:"National Kabaddi circuit veteran.",
    active:false, avatar:"AV" },
  { id:5, name:"Neha Gupta", phone:"9867891234", email:"neha@gametheory.in",
    sport:"Volleyball", playgroundId:2, timeSlots:["06:00 PM","07:00 PM"],
    expertise:"Intermediate", experience:4, fee:400, bio:"Loves high-energy matches and team building drills.",
    active:true, avatar:"NG" },
];

const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700","bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700","bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700","bg-blue-100 text-blue-700",
];

const emptyForm = {
  name:"", phone:"", email:"", sport:"Cricket", playgroundId:"",
  timeSlots:[], expertise:"Intermediate", experience:"", fee:"", bio:"", active:true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
}
function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}
function getPlayground(id) {
  return PLAYGROUNDS.find(p => p.id === Number(id));
}

// ─── CoachCard ────────────────────────────────────────────────────────────────
function CoachCard({ coach, onEdit, onDelete, onToggle }) {
  const sc = SPORT_COLORS[coach.sport] || SPORT_COLORS.Cricket;
  const pg = getPlayground(coach.playgroundId);

  return (
    <div className={`bg-white rounded-2xl border transition-all hover:border-purple-200 flex flex-col ${coach.active ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
      <div className="p-5 flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor(coach.id)}`}>
              {getInitials(coach.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{coach.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{coach.expertise} · {coach.experience}y exp</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${coach.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {coach.active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Sport badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className="text-sm">{SPORT_ICONS[coach.sport]}</span>
            {coach.sport}
          </span>
          <span className="text-xs text-gray-400">₹{coach.fee.toLocaleString("en-IN")}/session</span>
        </div>

        {/* Playground */}
        {pg && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="truncate">{pg.name}, {pg.city}</span>
          </div>
        )}

        {/* Time slots */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {coach.timeSlots.map(t => (
            <span key={t} className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>

        {/* Bio */}
        {coach.bio && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{coach.bio}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-3 border-t border-gray-100 flex gap-2">
        <button onClick={() => onToggle(coach.id)}
          className={`flex-1 text-xs font-medium py-2 rounded-xl border transition-colors ${
            coach.active
              ? "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600"
              : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
          }`}>
          {coach.active ? "Deactivate" : "Activate"}
        </button>
        <button onClick={() => onEdit(coach)}
          className="flex-1 text-xs font-medium py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors">
          Edit
        </button>
        <button onClick={() => onDelete(coach.id)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── CoachModal ───────────────────────────────────────────────────────────────
function CoachModal({ coach, onSave, onClose }) {
  const [form, setForm] = useState(
    coach ? { ...coach, timeSlots: [...coach.timeSlots], playgroundId: String(coach.playgroundId) }
          : { ...emptyForm }
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Filter playgrounds that support selected sport
  const availableGrounds = PLAYGROUNDS.filter(pg =>
    pg.sports.includes(form.sport)
  );

  // When sport changes reset playground if incompatible
  const handleSportChange = (sport) => {
    const still = PLAYGROUNDS.find(pg => pg.id === Number(form.playgroundId) && pg.sports.includes(sport));
    set("sport", sport);
    if (!still) set("playgroundId", "");
  };

  const toggleSlot = (t) => {
    set("timeSlots", form.timeSlots.includes(t)
      ? form.timeSlots.filter(s => s !== t)
      : [...form.timeSlots, t]
    );
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name = "Coach name required";
    if (!form.phone.trim())      e.phone = "Phone required";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter valid 10-digit phone";
    if (!form.playgroundId)      e.playground = "Select a playground";
    if (form.timeSlots.length === 0) e.timeSlots = "Select at least one slot";
    if (!form.fee || isNaN(form.fee)) e.fee = "Enter valid fee";
    if (!form.experience || isNaN(form.experience)) e.experience = "Enter experience in years";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...form,
      playgroundId: Number(form.playgroundId),
      fee: Number(form.fee),
      experience: Number(form.experience),
      id: coach?.id || Date.now(),
      avatar: getInitials(form.name),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{coach ? "Edit coach" : "Add new coach"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Assign to playground & time slots</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Basic Info ── */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Basic info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name *</label>
                <input
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 ${errors.name ? "border-red-300" : "border-gray-200"}`}
                  value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Rahul Dravid"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone *</label>
                <input
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 ${errors.phone ? "border-red-300" : "border-gray-200"}`}
                  value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit number"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
                  value={form.email} onChange={e => set("email", e.target.value)} placeholder="coach@email.com"
                />
              </div>
            </div>
          </div>

          {/* ── Sport ── */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Sport</p>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map(sp => (
                <button
                  key={sp}
                  onClick={() => handleSportChange(sp)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
                    form.sport === sp
                      ? `${SPORT_COLORS[sp].bg} ${SPORT_COLORS[sp].text} ${SPORT_COLORS[sp].border}`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span>{SPORT_ICONS[sp]}</span> {sp}
                </button>
              ))}
            </div>
          </div>

          {/* ── Playground ── */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Playground *</p>
            {availableGrounds.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No playgrounds available for {form.sport}</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableGrounds.map(pg => (
                  <button
                    key={pg.id}
                    onClick={() => set("playgroundId", String(pg.id))}
                    className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-all ${
                      String(form.playgroundId) === String(pg.id)
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                      String(form.playgroundId) === String(pg.id) ? "bg-purple-100" : "bg-gray-100"
                    }`}>
                      🏟️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${String(form.playgroundId) === String(pg.id) ? "text-purple-700" : "text-gray-800"}`}>
                        {pg.name}
                      </p>
                      <p className="text-xs text-gray-400">{pg.city}</p>
                    </div>
                    {String(form.playgroundId) === String(pg.id) && (
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
            {errors.playground && <p className="text-xs text-red-500 mt-1">{errors.playground}</p>}
          </div>

          {/* ── Time Slots ── */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Time slots *</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleSlot(t)}
                  className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
                    form.timeSlots.includes(t)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.timeSlots && <p className="text-xs text-red-500 mt-1">{errors.timeSlots}</p>}
          </div>

          {/* ── Expertise & Fee ── */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Expertise & fees</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Level *</label>
                <select
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 bg-white"
                  value={form.expertise} onChange={e => set("expertise", e.target.value)}
                >
                  {EXPERTISE_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Experience (yrs) *</label>
                <input
                  type="number" min="0"
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 ${errors.experience ? "border-red-300" : "border-gray-200"}`}
                  value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="5"
                />
                {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fee/session (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  <input
                    type="number" min="0"
                    className={`w-full text-sm border rounded-xl pl-6 pr-3 py-2.5 outline-none focus:border-purple-400 ${errors.fee ? "border-red-300" : "border-gray-200"}`}
                    value={form.fee} onChange={e => set("fee", e.target.value)} placeholder="500"
                  />
                </div>
                {errors.fee && <p className="text-xs text-red-500 mt-1">{errors.fee}</p>}
              </div>
            </div>
          </div>

          {/* ── Bio ── */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio / Note</label>
            <textarea
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 resize-none"
              value={form.bio} onChange={e => set("bio", e.target.value)}
              placeholder="Short bio or coaching style..."
            />
          </div>

          {/* ── Status ── */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="accent-purple-600 w-4 h-4" />
            Active (visible to players)
          </label>

          {/* Preview */}
          {form.name && form.sport && (
            <div className={`flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl text-xs border ${SPORT_COLORS[form.sport].bg} ${SPORT_COLORS[form.sport].text} ${SPORT_COLORS[form.sport].border}`}>
              <span className="font-semibold">{form.name || "Coach name"}</span>
              <span className="opacity-50">·</span>
              <span>{SPORT_ICONS[form.sport]} {form.sport}</span>
              {form.playgroundId && <><span className="opacity-50">·</span><span>🏟️ {getPlayground(form.playgroundId)?.name}</span></>}
              {form.timeSlots.length > 0 && <><span className="opacity-50">·</span><span>🕐 {form.timeSlots.join(", ")}</span></>}
              {form.fee && <><span className="opacity-50">·</span><span>₹{Number(form.fee).toLocaleString("en-IN")}</span></>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl py-2.5 transition-colors">
            {coach ? "Save changes" : "Add coach"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoachManagement() {
  const [coaches, setCoaches]   = useState(INITIAL_COACHES);
  const [modal, setModal]       = useState(null); // null | "add" | coachObj
  const [filterSport, setFilterSport]     = useState("All");
  const [filterGround, setFilterGround]   = useState("All");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [filterSlot, setFilterSlot]       = useState("All");
  const [search, setSearch]     = useState("");

  const handleSave = (data) => {
    setCoaches(prev =>
      data.id && prev.find(c => c.id === data.id)
        ? prev.map(c => c.id === data.id ? data : c)
        : [...prev, data]
    );
    setModal(null);
  };

  const handleDelete = (id) => setCoaches(prev => prev.filter(c => c.id !== id));
  const handleToggle = (id) => setCoaches(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const filtered = coaches.filter(c => {
    if (filterSport !== "All" && c.sport !== filterSport) return false;
    if (filterGround !== "All" && String(c.playgroundId) !== filterGround) return false;
    if (filterStatus === "active" && !c.active) return false;
    if (filterStatus === "inactive" && c.active) return false;
    if (filterSlot !== "All" && !c.timeSlots.includes(filterSlot)) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.sport.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total:  coaches.length,
    active: coaches.filter(c => c.active).length,
    sports: [...new Set(coaches.map(c => c.sport))].length,
    grounds: [...new Set(coaches.map(c => c.playgroundId))].length,
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Coach Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Assign coaches to playgrounds & time slots</p>
          </div>
          <button
            onClick={() => setModal("add")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add coach
          </button>
        </div>
      </div>

      <div className="px-6 py-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:"Total coaches", value:stats.total,   color:"text-gray-900" },
            { label:"Active",        value:stats.active,  color:"text-green-600" },
            { label:"Sports covered",value:stats.sports,  color:"text-purple-600" },
            { label:"Playgrounds",   value:stats.grounds, color:"text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-5 space-y-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="w-full max-w-sm text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-purple-400"
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search coach name or sport..."
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Sport */}
            <div className="flex flex-wrap gap-1.5">
              {["All", ...SPORTS].map(sp => (
                <button
                  key={sp}
                  onClick={() => setFilterSport(sp)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    filterSport === sp ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {sp !== "All" && <span className="mr-1">{SPORT_ICONS[sp]}</span>}{sp}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Status */}
            {["All","active","inactive"].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all capitalize ${
                  filterStatus === st ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}>
                {st}
              </button>
            ))}

            <div className="w-px h-5 bg-gray-200" />

            {/* Time slot */}
            <select
              value={filterSlot} onChange={e => setFilterSlot(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white text-gray-600"
            >
              <option value="All">All time slots</option>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>

            {/* Playground */}
            <select
              value={filterGround} onChange={e => setFilterGround(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400 bg-white text-gray-600"
            >
              <option value="All">All playgrounds</option>
              {PLAYGROUNDS.map(pg => <option key={pg.id} value={String(pg.id)}>{pg.name}</option>)}
            </select>
          </div>
        </div>

        {/* ── Coach grid ── */}
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
          Coaches ({filtered.length})
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🧑‍🏫</div>
            <p className="text-sm font-medium">No coaches found</p>
            <p className="text-xs mt-1">Try changing filters or add a new coach</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(coach => (
              <CoachCard
                key={coach.id}
                coach={coach}
                onEdit={c => setModal(c)}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}

            {/* Add placeholder */}
            <button
              onClick={() => setModal("add")}
              className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 py-12 text-gray-400 hover:border-purple-300 hover:text-purple-400 transition-colors min-h-48"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              <span className="text-sm font-medium">Add coach</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <CoachModal
          coach={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}