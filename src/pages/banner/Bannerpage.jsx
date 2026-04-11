import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Edit, X, RefreshCw, Search,
  AlertCircle, Image, Video, Eye,
  ToggleLeft, ToggleRight, FileImage, Film,
  AlignLeft, Hash, CheckCircle2, Monitor
} from "lucide-react";
import {
  getBanners, createBanner, updateBanner, deleteBanner
} from "../../api/api";

// ── Shared styles ─────────────────────────────────────
const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-200";

const labelCls = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

const activeStyle = (val) =>
  val === true || val?.toString() === "true"
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-red-50 text-red-500 border border-red-200";

const emptyForm = { name: "", description: "", isActive: "true" };

// ── extractList helper ────────────────────────────────
const extractList = (res) => {
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data))       return res.data;
  if (Array.isArray(res))             return res;
  return [];
};

// ── File Upload Zone ──────────────────────────────────
const UploadZone = ({ label, accept, file, preview, onFileChange, onClear, icon: Icon, color = "purple", isVideo = false }) => {
  const inputRef = useRef(null);
  const colorMap = {
    purple: { border: "hover:border-purple-400 hover:bg-purple-50/50", icon: "bg-purple-50 border-purple-200 text-purple-600" },
    rose:   { border: "hover:border-rose-400 hover:bg-rose-50/50",     icon: "bg-rose-50 border-rose-200 text-rose-500"       },
  };
  const c = colorMap[color];

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex items-center gap-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer ${c.border} transition-all group`}
      >
        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${c.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors truncate">
            {file ? file.name : `Click to upload ${isVideo ? "video" : "image"}`}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isVideo ? "MP4, MOV, WEBM up to 50MB" : "PNG, JPG, WEBP up to 10MB"}
          </p>
        </div>
        {preview && !isVideo && (
          <img src={preview} alt="preview"
            className="h-14 w-20 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
        )}
        {preview && isVideo && (
          <div className="h-14 w-20 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Film className="h-5 w-5 text-rose-400" />
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept}
          onChange={onFileChange} className="hidden" />
      </div>
      {(file || preview) && (
        <button type="button" onClick={onClear}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors">
          <X className="h-3 w-3" /> Remove {isVideo ? "video" : "image"}
        </button>
      )}
    </div>
  );
};

// ── View Modal ────────────────────────────────────────
const ViewModal = ({ banner, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">

      <div className="relative h-52 bg-gray-100 border-b border-gray-100 overflow-hidden">
        {banner.image
          ? <img src={banner.image} alt={banner.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Monitor className="h-12 w-12 text-gray-300" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 drop-shadow">{banner.name}</h2>
            {banner.description && <p className="text-xs text-gray-500 mt-0.5">{banner.description}</p>}
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${activeStyle(banner.isActive)}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${banner.isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
            {banner.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <button onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 text-gray-500 hover:text-gray-900 hover:bg-white transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: Hash,      label: "Banner Name", value: banner.name        },
            { icon: AlignLeft, label: "Description", value: banner.description },
            { icon: FileImage, label: "Image",       value: banner.image ? "Uploaded" : null },
            { icon: Film,      label: "Video",       value: banner.video ? "Uploaded" : null },
          ].filter(i => i.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
                <div className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all">
            Close
          </button>
          <button onClick={() => { onEdit(banner); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-sm font-semibold text-white transition-all">
            <Edit className="h-4 w-4" /> Edit Banner
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────
export default function BannerPage() {
  const [banners, setBanners]             = useState([]);
  const [formData, setFormData]           = useState(emptyForm);
  const [editId, setEditId]               = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [viewBanner, setViewBanner]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError]       = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState("");
  const [videoFile, setVideoFile]         = useState(null);
  const [videoPreview, setVideoPreview]   = useState("");

  useEffect(() => { fetchData(); }, []);

  // ── Fetch ─────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getBanners();
      setBanners(extractList(res));
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const openAdd = () => {
    setFormData(emptyForm);
    setEditId(null);
    setImageFile(null); setImagePreview("");
    setVideoFile(null); setVideoPreview("");
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setFormData({
      name:        banner.name        || "",
      description: banner.description || "",
      isActive:    banner.isActive?.toString() || "true",
    });
    setImagePreview(banner.image || "");
    setVideoPreview(banner.video || "");
    setImageFile(null);
    setVideoFile(null);
    setEditId(banner._id || banner.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setEditId(null); setFormData(emptyForm);
    setImageFile(null); setImagePreview("");
    setVideoFile(null); setVideoPreview("");
  };

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",        formData.name.trim());
      fd.append("description", formData.description);
      fd.append("isActive",    formData.isActive);
      if (imageFile) fd.append("image", imageFile);
      if (videoFile) fd.append("video", videoFile);

      if (editId) {
        const res = await updateBanner(editId, fd);
        const updated = res?.data?.data || res?.data || res || {};
        setBanners(prev => prev.map(b =>
          (b._id || b.id) === editId
            ? { ...b, ...updated,
                image: imageFile ? imagePreview : b.image,
                video: videoFile ? videoPreview : b.video,
              }
            : b
        ));
      } else {
        const res = await createBanner(fd);
        const newB = res?.data?.data || res?.data || res;
        setBanners(prev => [
          ...prev,
          {
            ...newB,
            image: imageFile ? imagePreview : newB.image || null,
            video: videoFile ? videoPreview : newB.video || null,
          },
        ]);
      }
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save banner");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    setActionLoading(true);
    try {
      await deleteBanner(id);
      setBanners(prev => prev.filter(b => (b._id || b.id) !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete banner");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Toggle Active ─────────────────────────────────
  const handleToggleActive = async (banner) => {
    const id = banner._id || banner.id;
    try {
      const fd = new FormData();
      fd.append("name",        banner.name);
      fd.append("description", banner.description || "");
      fd.append("isActive",    String(!banner.isActive));
      await updateBanner(id, fd);
      setBanners(prev => prev.map(b =>
        (b._id || b.id) === id ? { ...b, isActive: !b.isActive } : b
      ));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = banners.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = banners.filter(b => b.isActive === true || b.isActive?.toString() === "true").length;

  // ── Render ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border border-purple-200">
            <Monitor className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{banners.length} banners configured</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition-all">
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Banners", value: banners.length,               icon: Monitor,      bg: "bg-purple-50 border-purple-200", iconCls: "text-purple-600", num: "text-purple-700" },
          { label: "Active",        value: activeCount,                  icon: CheckCircle2, bg: "bg-green-50 border-green-200",   iconCls: "text-green-600",  num: "text-green-700"  },
          { label: "Inactive",      value: banners.length - activeCount, icon: X,            bg: "bg-red-50 border-red-200",       iconCls: "text-red-500",    num: "text-red-600"    },
        ].map(({ label, value, icon: Icon, bg, iconCls, num }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white px-5 py-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${bg}`}>
              <Icon className={`h-5 w-5 ${iconCls}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${num}`}>{value}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Grid */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">All Banners</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text" placeholder="Search banners…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-52 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition-all"
              />
            </div>
            <span className="text-xs text-gray-400">{filtered.length} items</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-9 w-9 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-400">Loading banners…</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Failed to load banners</p>
            <p className="text-xs text-gray-400 mb-5">{fetchError}</p>
            <button onClick={fetchData}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-semibold transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
              <Monitor className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {searchTerm ? "No banners match your search" : "No Banners Yet"}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              {searchTerm ? "Try a different keyword." : "Add your first banner to get started."}
            </p>
            {!searchTerm && (
              <button onClick={openAdd}
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition-all">
                <Plus className="h-4 w-4" /> Add First Banner
              </button>
            )}
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((banner) => {
              const bid = banner._id || banner.id;
              const isActive = banner.isActive === true || banner.isActive?.toString() === "true";
              return (
                <div key={bid}
                  className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-purple-200 hover:shadow-sm transition-all duration-200">

                  {/* Thumbnail */}
                  <div className="relative h-36 bg-gray-100 overflow-hidden">
                    {banner.image
                      ? <img src={banner.image} alt={banner.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <FileImage className="h-8 w-8 text-gray-300" />
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">No Image</span>
                        </div>
                    }

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => setViewBanner(banner)}
                        className="p-2 rounded-xl bg-blue-500/90 hover:bg-blue-600 text-white transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(banner)}
                        className="p-2 rounded-xl bg-purple-500/90 hover:bg-purple-600 text-white transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(bid)} disabled={actionLoading}
                        className="p-2 rounded-xl bg-red-500/90 hover:bg-red-600 text-white transition-all disabled:opacity-40">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${activeStyle(isActive)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Video badge */}
                    {banner.video && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-500 border border-rose-200">
                          <Film className="h-3 w-3" /> Video
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-3.5 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 truncate">{banner.name}</h3>
                      {banner.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{banner.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <button onClick={() => handleToggleActive(banner)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          isActive ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"
                        }`}>
                        {isActive
                          ? <ToggleRight className="h-5 w-5" />
                          : <ToggleLeft className="h-5 w-5" />}
                        {isActive ? "Active" : "Inactive"}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(banner)}
                          className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-all">
                          <Edit className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleDelete(bid)} disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-all disabled:opacity-40">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                  editId ? "bg-amber-50 border border-amber-200" : "bg-purple-50 border border-purple-200"
                }`}>
                  {editId ? <Edit className="h-4 w-4 text-amber-500" /> : <Plus className="h-4 w-4 text-purple-600" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{editId ? "Edit Banner" : "Add New Banner"}</h2>
                  <p className="text-[10px] text-gray-400">{editId ? "Update banner details" : "Fill in the banner information"}</p>
                </div>
              </div>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-1.5"><Hash className="h-3 w-3" /> Banner Name *</span>
                </label>
                <input name="name" type="text" placeholder="e.g. Summer Sale"
                  value={formData.name} onChange={handleChange}
                  className={inputCls} required autoFocus />
              </div>

              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-1.5"><AlignLeft className="h-3 w-3" /> Description</span>
                </label>
                <textarea name="description" rows={2}
                  placeholder="Short description for this banner…"
                  value={formData.description} onChange={handleChange}
                  className={inputCls + " resize-none"} />
              </div>

              <UploadZone
                label="Banner Image"
                accept="image/*"
                file={imageFile}
                preview={imagePreview}
                onFileChange={handleImageChange}
                onClear={() => { setImageFile(null); setImagePreview(""); }}
                icon={Image}
                color="purple"
                isVideo={false}
              />

              <UploadZone
                label="Banner Video (optional)"
                accept="video/*"
                file={videoFile}
                preview={videoPreview}
                onFileChange={handleVideoChange}
                onClear={() => { setVideoFile(null); setVideoPreview(""); }}
                icon={Video}
                color="rose"
                isVideo={true}
              />

              <div>
                <label className={labelCls}>Status</label>
                <div className="flex gap-2">
                  {[
                    { val: "true",  label: "Active",   cls: "border-green-400 bg-green-50 text-green-700"  },
                    { val: "false", label: "Inactive", cls: "border-red-400 bg-red-50 text-red-600"        },
                  ].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: opt.val }))}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        formData.isActive === opt.val
                          ? opt.cls
                          : "border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={closeModal}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white transition-all">
                  {actionLoading
                    ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : editId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editId ? "Update Banner" : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewBanner && (
        <ViewModal
          banner={viewBanner}
          onClose={() => setViewBanner(null)}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}