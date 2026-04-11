import { useState } from "react";

const ICONS = { Free: "🎁", Starter: "⚡", Pro: "🏆", Elite: "👑", Custom: "🔧" };
const ICON_BG = {
  Free: "bg-green-50", Starter: "bg-purple-50",
  Pro: "bg-amber-50", Elite: "bg-gray-100", Custom: "bg-teal-50",
};

const initialPlans = [
  {
    id: 1, name: "Free", type: "free", icon: "Free",
    desc: "Start exploring Game Theory at no cost",
    monthlyPrice: 0, annualPrice: 0, trialDays: 0,
    popular: false, active: true,
    features: ["Join 1 game per month", "Basic player profile", "City access: 1", "Community support"],
  },
  {
    id: 2, name: "Starter", type: "paid", icon: "Starter",
    desc: "For casual players who book occasionally",
    monthlyPrice: 199, annualPrice: 149, trialDays: 7,
    popular: false, active: true,
    features: ["Join 5 games per month", "Player profile + stats", "City access: 3", "Basic team view", "Email support"],
  },
  {
    id: 3, name: "Pro", type: "paid", icon: "Pro",
    desc: "Most popular — for regular sports enthusiasts",
    monthlyPrice: 499, annualPrice: 379, trialDays: 14,
    popular: true, active: true,
    features: ["Unlimited games", "Advanced stats & history", "All cities", "Full team management", "Priority support", "Custom team name"],
  },
  {
    id: 4, name: "Elite", type: "paid", icon: "Elite",
    desc: "For serious players and ground organizers",
    monthlyPrice: 999, annualPrice: 749, trialDays: 14,
    popular: false, active: true,
    features: ["Everything in Pro", "Organizer dashboard", "Revenue analytics", "Multiple playgrounds", "Dedicated manager", "API access"],
  },
];

const emptyForm = {
  name: "", type: "paid", icon: "Starter", desc: "",
  monthlyPrice: "", annualPrice: "", trialDays: "7",
  popular: false, active: true, features: [],
};

function CheckIcon({ className = "" }) {
  return (
    <svg className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlanCard({ plan, annual, onEdit, onDelete }) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const origPrice = annual && plan.type === "paid" ? plan.monthlyPrice : null;

  return (
    <div className={`bg-white rounded-2xl flex flex-col transition-all ${plan.popular ? "border-2 border-purple-500" : "border border-gray-100 hover:border-purple-200"}`}>
      <div className="p-5 flex-1">
        {/* Badge */}
        {plan.type === "free" && (
          <span className="inline-block text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full mb-3">Free forever</span>
        )}
        {plan.popular && (
          <span className="inline-block text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full mb-3">Most popular</span>
        )}
        {!plan.popular && plan.type === "paid" && plan.trialDays > 0 && (
          <span className="inline-block text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full mb-3">{plan.trialDays}-day free trial</span>
        )}

        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl ${ICON_BG[plan.icon] || "bg-purple-50"} flex items-center justify-center text-lg mb-3`}>
          {ICONS[plan.icon] || "⭐"}
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">{plan.desc}</p>

        {/* Price */}
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-sm font-medium text-gray-400">₹</span>
          <span className="text-3xl font-semibold text-gray-900">
            {price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-400">/month</span>
        </div>
        {origPrice && (
          <p className="text-xs text-gray-400 line-through mb-1">₹{origPrice.toLocaleString("en-IN")}/month</p>
        )}
        {annual && plan.type === "paid" && (
          <p className="text-xs text-gray-400 mb-3">billed annually</p>
        )}
        {plan.type === "paid" && plan.trialDays > 0 && (
          <p className="text-xs text-green-600 font-medium mb-3">✓ {plan.trialDays}-day free trial included</p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* Features */}
        <ul className="space-y-2.5">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <CheckIcon className="text-green-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onEdit(plan)}
          className="flex-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-xl py-2 hover:border-purple-300 hover:text-purple-600 transition-colors"
        >
          Edit plan
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PlanModal({ plan, onSave, onClose }) {
  const [form, setForm] = useState(
    plan
      ? { ...plan, monthlyPrice: String(plan.monthlyPrice), annualPrice: String(plan.annualPrice), trialDays: String(plan.trialDays), features: [...plan.features] }
      : { ...emptyForm }
  );
  const [newFeat, setNewFeat] = useState("");
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addFeature = () => {
    if (!newFeat.trim()) return;
    set("features", [...form.features, newFeat.trim()]);
    setNewFeat("");
  };

  const removeFeature = (i) => set("features", form.features.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Plan name required";
    if (form.type === "paid") {
      if (!form.monthlyPrice || isNaN(form.monthlyPrice)) e.monthlyPrice = "Enter valid price";
      if (!form.annualPrice || isNaN(form.annualPrice)) e.annualPrice = "Enter valid price";
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...form,
      monthlyPrice: form.type === "free" ? 0 : Number(form.monthlyPrice),
      annualPrice: form.type === "free" ? 0 : Number(form.annualPrice),
      trialDays: Number(form.trialDays) || 0,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{plan ? "Edit plan" : "Add new plan"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure pricing and features</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Plan name *</label>
              <input
                className={`w-full text-sm border rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 ${errors.name ? "border-red-300" : "border-gray-200"}`}
                value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="e.g. Pro"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Plan type *</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 bg-white"
                value={form.type} onChange={e => set("type", e.target.value)}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <input
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
              value={form.desc} onChange={e => set("desc", e.target.value)}
              placeholder="Short plan description"
            />
          </div>

          {/* Paid-only fields */}
          {form.type === "paid" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Monthly price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                    <input
                      type="number" min="0"
                      className={`w-full text-sm border rounded-xl pl-7 pr-3 py-2.5 outline-none focus:border-purple-400 ${errors.monthlyPrice ? "border-red-300" : "border-gray-200"}`}
                      value={form.monthlyPrice} onChange={e => set("monthlyPrice", e.target.value)}
                      placeholder="499"
                    />
                  </div>
                  {errors.monthlyPrice && <p className="text-xs text-red-500 mt-1">{errors.monthlyPrice}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Annual price/mo (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                    <input
                      type="number" min="0"
                      className={`w-full text-sm border rounded-xl pl-7 pr-3 py-2.5 outline-none focus:border-purple-400 ${errors.annualPrice ? "border-red-300" : "border-gray-200"}`}
                      value={form.annualPrice} onChange={e => set("annualPrice", e.target.value)}
                      placeholder="379"
                    />
                  </div>
                  {errors.annualPrice && <p className="text-xs text-red-500 mt-1">{errors.annualPrice}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Free trial days</label>
                  <input
                    type="number" min="0" max="90"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
                    value={form.trialDays} onChange={e => set("trialDays", e.target.value)}
                    placeholder="0 = no trial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Icon</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 bg-white"
                    value={form.icon} onChange={e => set("icon", e.target.value)}
                  >
                    {Object.entries(ICONS).map(([k, v]) => (
                      <option key={k} value={k}>{v} {k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.popular} onChange={e => set("popular", e.target.checked)} className="accent-purple-600" />
                  Mark as most popular
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="accent-purple-600" />
                  Active / visible
                </label>
              </div>
            </>
          )}

          {/* Features */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Features</label>
            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-full">
                    {f}
                    <button onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-500 font-medium leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
                value={newFeat} onChange={e => setNewFeat(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="Add a feature, press Enter"
              />
              <button onClick={addFeature} className="text-sm font-medium bg-purple-50 text-purple-700 px-4 py-2.5 rounded-xl hover:bg-purple-100 transition-colors">
                + Add
              </button>
            </div>
          </div>

          {/* Live preview */}
          {form.name && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border ${form.type === "free" ? "bg-green-50 text-green-700 border-green-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
              <span>{ICONS[form.icon] || "⭐"}</span>
              <span>{form.name}</span>
              {form.type === "paid" && form.monthlyPrice && (
                <><span className="text-gray-400">·</span><span>₹{Number(form.monthlyPrice).toLocaleString("en-IN")}/mo</span></>
              )}
              {form.type === "free" && <><span className="text-gray-400">·</span><span>Free forever</span></>}
              {form.type === "paid" && form.trialDays > 0 && (
                <><span className="text-gray-400">·</span><span>{form.trialDays}-day trial</span></>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl py-2.5 transition-colors">
            {plan ? "Save changes" : "Add plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [annual, setAnnual] = useState(false);
  const [modal, setModal] = useState(null); // null | "add" | planObject

  const handleSave = (formData) => {
    if (formData.id) {
      setPlans(prev => prev.map(p => p.id === formData.id ? formData : p));
    } else {
      setPlans(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    setModal(null);
  };

  const handleDelete = (id) => setPlans(prev => prev.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Plans & Pricing</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage subscription plans — Game Theory app</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Annual toggle */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
              <span className="text-xs text-gray-500">Monthly</span>
              <button
                onClick={() => setAnnual(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${annual ? "bg-purple-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${annual ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-xs text-gray-500">Annual</span>
              {annual && <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 25%</span>}
            </div>

            <button
              onClick={() => setModal("add")}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add plan
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total plans", value: plans.length, color: "text-gray-900" },
            { label: "Free plans", value: plans.filter(p => p.type === "free").length, color: "text-green-600" },
            { label: "Paid plans", value: plans.filter(p => p.type === "paid").length, color: "text-purple-600" },
            { label: "With free trial", value: plans.filter(p => p.trialDays > 0).length, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Plans grid */}
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">All plans ({plans.length})</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              annual={annual}
              onEdit={p => setModal(p)}
              onDelete={handleDelete}
            />
          ))}

          {/* Add plan placeholder */}
          <button
            onClick={() => setModal("add")}
            className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 py-12 text-gray-400 hover:border-purple-300 hover:text-purple-400 transition-colors min-h-48"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Add new plan</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <PlanModal
          plan={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}