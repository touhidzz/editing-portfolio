import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Trash2,
  Loader2,
  Plus,
  Film,
  Lock,
  LogOut,
  ClipboardList,
  LayoutGrid,
  Settings,
  BarChart3,
  Upload,
  FileText,
  Copy,
  Download,
} from 'lucide-react';

function formatMoney(n) {
  return '৳' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function invoiceLink(token) {
  return `${window.location.origin}/#invoice=${token}`;
}

const STATUS_OPTIONS = ['Pending', 'In Progress', 'In Review', 'Delivered', 'Cancelled'];
const PAYMENT_OPTIONS = ['Unpaid', 'Partial', 'Paid'];

const EMPTY_FORM = {
  title: '',
  description: '',
  video_url: '',
  thumbnail_url: '',
  category: '',
};

const EMPTY_TRACKER_FORM = {
  project_name: '',
  client_name: '',
  deadline: '',
  notes: '',
};

// Kinds of custom column you can add to the Project Tracker
const COLUMN_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'money', label: 'Money (৳)' },
  { value: 'date', label: 'Date (calendar)' },
  { value: 'duration', label: 'Video length (min / sec)' },
  { value: 'dropdown', label: 'Dropdown (your own options)' },
  { value: 'checkbox', label: 'Yes / No tick' },
  { value: 'link', label: 'Link' },
];

// Video length is stored as total seconds. 125 -> "2m 05s"
function formatDuration(totalSeconds) {
  const t = Number(totalSeconds);
  if (!t || t < 0) return '';
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('portfolio');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginError(error.message);
    }
    setLoggingIn(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-6 text-neutral-100">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/30">
              <Lock className="h-5 w-5 text-indigo-500" />
            </div>
            <h1 className="text-lg font-semibold text-white">Admin Login</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to manage your projects
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              className="input-base"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-base"
            />

            {loginError && (
              <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-[#0b0f19]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-600 font-black text-sm">
              P
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Admin Dashboard
              </h1>
              <p className="text-xs text-neutral-500">
                Signed in as {session.user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-300 transition hover:border-red-500 hover:text-red-400 sm:text-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4 sm:px-10">
          <TabButton
            active={activeTab === 'portfolio'}
            onClick={() => setActiveTab('portfolio')}
            icon={LayoutGrid}
            label="Portfolio Projects"
          />
          <TabButton
            active={activeTab === 'tracker'}
            onClick={() => setActiveTab('tracker')}
            icon={ClipboardList}
            label="Project Tracker"
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={Settings}
            label="Site Settings"
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={BarChart3}
            label="Analytics"
          />
          <TabButton
            active={activeTab === 'invoices'}
            onClick={() => setActiveTab('invoices')}
            icon={FileText}
            label="Invoices"
          />
          <TabButton
            active={activeTab === 'unpaid'}
            onClick={() => setActiveTab('unpaid')}
            icon={Download}
            label="Unpaid List"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        {activeTab === 'portfolio' && <PortfolioManager />}
        {activeTab === 'tracker' && <ProjectTracker />}
        {activeTab === 'settings' && <SiteSettings />}
        {activeTab === 'analytics' && <SiteAnalytics />}
        {activeTab === 'invoices' && <InvoiceManager />}
        {activeTab === 'unpaid' && <UnpaidList />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition sm:text-sm ${
        active
          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
          : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ============================================================
   TAB 1: Portfolio Projects (public-facing)
   ============================================================ */

function PortfolioManager() {
  const [projects, setProjects] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // Reordering
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [orderMsg, setOrderMsg] = useState(null);

  async function handleThumbnailUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets you pick the same file again later
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image is too large. Please keep it under 5 MB.');
      return;
    }

    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${Date.now()}-${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from('thumbnails')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      setUploadError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
    setForm((prev) => ({ ...prev, thumbnail_url: data.publicUrl }));
    setUploading(false);
  }

  async function fetchProjects() {
    setLoadingList(true);
    setListError(null);
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, description, category, video_url, thumbnail_url, sort_order')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('id', { ascending: false });

    if (error) {
      setListError(error.message);
    } else {
      setProjects(data || []);
    }
    setLoadingList(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const existingCategories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  ).sort();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    if (!form.category.trim()) {
      setFormError('Category is required.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('projects').insert([
      {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        video_url: form.video_url.trim(),
        thumbnail_url: form.thumbnail_url.trim(),
        sort_order: projects.reduce(
          (min, p) => (p.sort_order != null ? Math.min(min, p.sort_order) : min),
          0
        ) - 1,
      },
    ]);

    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setFormSuccess(true);
    setForm(EMPTY_FORM);
    fetchProjects();

    setTimeout(() => setFormSuccess(false), 3000);
  }

  async function saveOrder(newList) {
    setOrderMsg(null);
    // Which rows actually changed position?
    const changed = newList
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => p.sort_order !== i);

    // Show the new order immediately
    setProjects(newList.map((p, i) => ({ ...p, sort_order: i })));

    const results = await Promise.all(
      changed.map(({ p, i }) =>
        supabase.from('projects').update({ sort_order: i }).eq('id', p.id).select('id')
      )
    );

    const failed = results.find((r) => r.error || !r.data || r.data.length === 0);
    if (failed) {
      setOrderMsg({
        type: 'error',
        text: failed.error
          ? `Couldn't save the new order: ${failed.error.message}`
          : "Couldn't save the new order. Please run the SQL setup for this feature in Supabase first.",
      });
      fetchProjects();
      return;
    }

    setOrderMsg({ type: 'ok', text: 'Order saved. Your website now shows the videos in this order.' });
    setTimeout(() => setOrderMsg(null), 3000);
  }

  function moveProject(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const list = [...projects];
    const [moved] = list.splice(index, 1);
    list.splice(target, 0, moved);
    saveOrder(list);
  }

  function handleDrop(targetId) {
    const from = projects.findIndex((p) => p.id === dragId);
    const to = projects.findIndex((p) => p.id === targetId);
    setDragId(null);
    setOverId(null);
    if (from < 0 || to < 0 || from === to) return;
    const list = [...projects];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    saveOrder(list);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this project? This cannot be undone.');
    if (!confirmed) return;

    setDeletingId(id);
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  return (
    <>
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-500" />
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Add New Project
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Title">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Summer Campaign Edit"
              className="input-base"
            />
          </Field>

          <Field label="Category">
            <input
              type="text"
              name="category"
              list="category-suggestions"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Talking Head, YouTube, Documentary..."
              className="input-base"
            />
            <datalist id="category-suggestions">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </Field>

          <Field label="Video URL" className="sm:col-span-2">
            <input
              type="url"
              name="video_url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className="input-base"
            />
          </Field>

          <Field label="Thumbnail" className="sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label
                className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:border-indigo-500 hover:text-white ${
                  uploading ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                name="thumbnail_url"
                value={form.thumbnail_url}
                onChange={handleChange}
                placeholder="...or paste an image link"
                className="input-base"
              />
            </div>

            {uploadError && (
              <p className="mt-2 text-xs text-red-400">{uploadError}</p>
            )}

            {form.thumbnail_url && (
              <img
                src={form.thumbnail_url}
                alt="Thumbnail preview"
                className="mt-3 h-24 w-auto rounded-lg border border-neutral-800 object-cover"
              />
            )}
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Short summary of the project..."
              className="input-base resize-none"
            />
          </Field>

          {formError && (
            <p className="sm:col-span-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-400">
              {formError}
            </p>
          )}

          {formSuccess && (
            <p className="sm:col-span-2 rounded-lg border border-green-900/50 bg-green-950/40 px-4 py-2 text-sm text-green-400">
              Project added successfully.
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Project
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Existing Projects
          </h2>
          <span className="text-xs text-neutral-500">
            {projects.length} total · drag ⋮⋮ or use ↑ ↓ to reorder
          </span>
        </div>

        {orderMsg && (
          <p
            className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
              orderMsg.type === 'ok'
                ? 'border-green-900/50 bg-green-950/40 text-green-400'
                : 'border-red-900/50 bg-red-950/40 text-red-400'
            }`}
          >
            {orderMsg.text}
          </p>
        )}

        {loadingList ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-900/60" />
            ))}
          </div>
        ) : listError ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            Couldn't load projects: {listError}
          </p>
        ) : projects.length === 0 ? (
          <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-8 text-center text-sm text-neutral-500">
            No projects yet. Add your first one above.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-3 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Thumbnail</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Video URL</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {projects.map((project, index) => (
                  <tr
                    key={project.id}
                    onDragOver={(e) => {
                      if (dragId !== null) {
                        e.preventDefault();
                        setOverId(project.id);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(project.id);
                    }}
                    className={`transition hover:bg-neutral-900/50 ${
                      dragId === project.id ? 'opacity-40' : ''
                    } ${
                      overId === project.id && dragId !== project.id
                        ? 'bg-indigo-500/20'
                        : 'bg-neutral-900/20'
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <span
                          draggable
                          onDragStart={(e) => {
                            setDragId(project.id);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(project.id));
                            const row = e.currentTarget.closest('tr');
                            if (row) e.dataTransfer.setDragImage(row, 20, 20);
                          }}
                          onDragEnd={() => {
                            setDragId(null);
                            setOverId(null);
                          }}
                          title="Drag to reorder"
                          className="cursor-grab select-none px-1 text-xl leading-none text-neutral-500 hover:text-indigo-400 active:cursor-grabbing"
                        >
                          ⋮⋮
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => moveProject(index, -1)}
                            disabled={index === 0}
                            className="px-1 text-xs leading-4 text-neutral-400 transition hover:text-indigo-400 disabled:opacity-20"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveProject(index, 1)}
                            disabled={index === projects.length - 1}
                            className="px-1 text-xs leading-4 text-neutral-400 transition hover:text-indigo-400 disabled:opacity-20"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="h-10 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded-md bg-neutral-800 text-neutral-600">
                          <Film className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{project.title}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300">
                        {project.category}
                      </span>
                    </td>
                    <td className="hidden max-w-[240px] truncate px-4 py-3 text-neutral-500 md:table-cell">
                      {project.video_url}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* ============================================================
   TAB 2: Project Tracker (private)
   ============================================================ */

function ProjectTracker() {
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState(EMPTY_TRACKER_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // Custom columns
  const [columns, setColumns] = useState([]);
  const [columnsError, setColumnsError] = useState(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [colForm, setColForm] = useState({ name: '', type: 'text', options: '' });
  const [colSaving, setColSaving] = useState(false);
  const [colFormError, setColFormError] = useState(null);

  // Filters
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  async function fetchColumns() {
    const { data, error } = await supabase
      .from('tracker_columns')
      .select('*')
      .order('position', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      setColumnsError(error.message);
    } else {
      setColumnsError(null);
      setColumns(data || []);
    }
  }

  async function fetchItems() {
    setLoadingList(true);
    setListError(null);
    const { data, error } = await supabase
      .from('project_tracker')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setListError(error.message);
    } else {
      setItems(data || []);
    }
    setLoadingList(false);
  }

  useEffect(() => {
    fetchItems();
    fetchColumns();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!form.project_name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('project_tracker').insert([
      {
        project_name: form.project_name.trim(),
        client_name: form.client_name.trim(),
        deadline: form.deadline || null,
        notes: form.notes.trim(),
        status: 'Pending',
        payment_status: 'Unpaid',
      },
    ]);

    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setForm(EMPTY_TRACKER_FORM);
    fetchItems();
  }

  async function updateField(id, field, value) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    const { error } = await supabase
      .from('project_tracker')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      alert(`Failed to update: ${error.message}`);
      fetchItems();
    }
  }

  async function handleAddColumn(e) {
    e.preventDefault();
    setColFormError(null);

    const name = colForm.name.trim();
    if (!name) {
      setColFormError('Please give the column a name.');
      return;
    }

    let options = [];
    if (colForm.type === 'dropdown') {
      options = colForm.options
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      if (options.length < 2) {
        setColFormError('Add at least two options, separated by commas.');
        return;
      }
    }

    setColSaving(true);
    const { error } = await supabase.from('tracker_columns').insert([
      { name, type: colForm.type, options, position: columns.length },
    ]);
    setColSaving(false);

    if (error) {
      setColFormError(error.message);
      return;
    }

    setColForm({ name: '', type: 'text', options: '' });
    setShowColumnForm(false);
    fetchColumns();
  }

  async function handleRenameColumn(col) {
    const name = window.prompt('Column name:', col.name);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const patch = { name: trimmed };

    if (col.type === 'dropdown') {
      const opts = window.prompt(
        'Dropdown options (separate with commas):',
        (col.options || []).join(', ')
      );
      if (opts !== null) {
        const list = opts.split(',').map((o) => o.trim()).filter(Boolean);
        if (list.length >= 2) patch.options = list;
      }
    }

    const { error } = await supabase.from('tracker_columns').update(patch).eq('id', col.id);
    if (error) {
      alert(`Failed to update column: ${error.message}`);
      return;
    }
    fetchColumns();
  }

  async function handleDeleteColumn(col) {
    const confirmed = window.confirm(
      `Delete the "${col.name}" column? The values in it will be lost. This cannot be undone.`
    );
    if (!confirmed) return;

    const { error } = await supabase.from('tracker_columns').delete().eq('id', col.id);
    if (error) {
      alert(`Failed to delete column: ${error.message}`);
      return;
    }
    setColumns((prev) => prev.filter((c) => c.id !== col.id));
  }

  async function updateCustom(item, colId, value) {
    const next = { ...(item.custom_data || {}), [colId]: value };

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, custom_data: next } : i))
    );

    const { error } = await supabase
      .from('project_tracker')
      .update({ custom_data: next })
      .eq('id', item.id);

    if (error) {
      alert(`Failed to update: ${error.message}`);
      fetchItems();
    }
  }

  const visibleItems = items.filter((item) => {
    if (deliveryFilter === 'delivered' && item.status !== 'Delivered') return false;
    if (deliveryFilter === 'not_delivered' && item.status === 'Delivered') return false;
    if (paymentFilter !== 'all' && item.payment_status !== paymentFilter) return false;
    return true;
  });

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this tracker entry? This cannot be undone.');
    if (!confirmed) return;

    setDeletingId(id);
    const { error } = await supabase.from('project_tracker').delete().eq('id', id);

    if (error) {
      alert(`Failed to delete: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  return (
    <>
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-500" />
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Add Project to Tracker
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Project Name">
            <input
              type="text"
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              placeholder="Wedding highlight reel"
              className="input-base"
            />
          </Field>

          <Field label="Client Name">
            <input
              type="text"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              placeholder="Rahim Uddin"
              className="input-base"
            />
          </Field>

          <Field label="Deadline">
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="input-base"
            />
          </Field>

          <Field label="Notes">
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any extra detail..."
              className="input-base"
            />
          </Field>

          {formError && (
            <p className="sm:col-span-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-400">
              {formError}
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Tracker
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            All Tracked Projects
          </h2>
          <span className="text-xs text-neutral-500">
            Showing {visibleItems.length} of {items.length}
          </span>
        </div>

        {/* Filters + custom columns */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-200 outline-none focus:border-indigo-500"
          >
            <option value="all">Delivery: All</option>
            <option value="delivered">Delivered</option>
            <option value="not_delivered">Not delivered</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-200 outline-none focus:border-indigo-500"
          >
            <option value="all">Payment: All</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          {(deliveryFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setDeliveryFilter('all');
                setPaymentFilter('all');
              }}
              className="text-xs text-neutral-400 underline transition hover:text-white"
            >
              Clear filters
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowColumnForm((v) => !v)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-indigo-500/50 px-4 py-2 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Add column
          </button>
        </div>

        {showColumnForm && (
          <form
            onSubmit={handleAddColumn}
            className="mb-4 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:grid-cols-3"
          >
            <Field label="Column name">
              <input
                type="text"
                value={colForm.name}
                onChange={(e) => setColForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Video length"
                className="input-base"
              />
            </Field>

            <Field label="Type">
              <select
                value={colForm.type}
                onChange={(e) => setColForm((f) => ({ ...f, type: e.target.value }))}
                className="input-base"
              >
                {COLUMN_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-neutral-900">
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            {colForm.type === 'dropdown' && (
              <Field label="Options (comma separated)">
                <input
                  type="text"
                  value={colForm.options}
                  onChange={(e) => setColForm((f) => ({ ...f, options: e.target.value }))}
                  placeholder="e.g. Reel, YouTube, Ad"
                  className="input-base"
                />
              </Field>
            )}

            {colFormError && (
              <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-400 sm:col-span-3">
                {colFormError}
              </p>
            )}

            <div className="flex gap-3 sm:col-span-3">
              <button
                type="submit"
                disabled={colSaving}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >
                {colSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create column
              </button>
              <button
                type="button"
                onClick={() => setShowColumnForm(false)}
                className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-neutral-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {columnsError && (
          <p className="mb-4 rounded-lg border border-yellow-900/50 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-400">
            Custom columns aren't set up yet. Run the SQL for this feature in Supabase ({columnsError}).
          </p>
        )}

        {loadingList ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-900/60" />
            ))}
          </div>
        ) : listError ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            Couldn't load tracker: {listError}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-8 text-center text-sm text-neutral-500">
            Nothing tracked yet. Add your first project above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  {columns.map((col) => (
                    <th key={col.id} className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{col.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRenameColumn(col)}
                          title="Rename column"
                          className="text-neutral-600 transition hover:text-indigo-400"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(col)}
                          title="Delete column"
                          className="text-neutral-600 transition hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {visibleItems.map((item) => (
                  <tr key={item.id} className="bg-neutral-900/20 transition hover:bg-neutral-900/50">
                    <td className="px-4 py-3 font-medium text-white">
                      <input
                        type="text"
                        defaultValue={item.project_name}
                        onBlur={(e) => {
                          if (e.target.value !== item.project_name) {
                            updateField(item.id, 'project_name', e.target.value);
                          }
                        }}
                        className="w-full bg-transparent text-white outline-none focus:border-b focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      <input
                        type="text"
                        defaultValue={item.client_name || ''}
                        onBlur={(e) => {
                          if (e.target.value !== item.client_name) {
                            updateField(item.id, 'client_name', e.target.value);
                          }
                        }}
                        className="w-full bg-transparent text-neutral-300 outline-none focus:border-b focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        value={item.status}
                        options={STATUS_OPTIONS}
                        onChange={(value) => updateField(item.id, 'status', value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        value={item.payment_status}
                        options={PAYMENT_OPTIONS}
                        onChange={(value) => updateField(item.id, 'payment_status', value)}
                        variant="payment"
                      />
                      {Number(item.paid_amount) > 0 && (
                        <div className="mt-1.5 text-[11px] leading-tight text-neutral-500">
                          <div>
                            {formatMoney(item.paid_amount)} received
                            {item.last_paid_at ? ` · ${formatDate(item.last_paid_at)}` : ''}
                          </div>
                          {item.last_trx_id && <div>TrxID: {item.last_trx_id}</div>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        defaultValue={item.deadline || ''}
                        onChange={(e) => updateField(item.id, 'deadline', e.target.value || null)}
                        className="bg-transparent text-neutral-400 outline-none [color-scheme:dark]"
                      />
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <input
                        type="text"
                        defaultValue={item.notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== item.notes) {
                            updateField(item.id, 'notes', e.target.value);
                          }
                        }}
                        placeholder="—"
                        className="w-full bg-transparent text-neutral-400 outline-none placeholder-neutral-700 focus:border-b focus:border-indigo-500"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-3">
                        <CustomCell
                          col={col}
                          value={(item.custom_data || {})[col.id]}
                          onChange={(value) => updateCustom(item, col.id, value)}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7 + columns.length}
                      className="px-4 py-8 text-center text-sm text-neutral-500"
                    >
                      No projects match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs text-neutral-600">
          Click any text to edit it — changes save automatically when you click away.
        </p>
      </section>
    </>
  );
}

function StatusSelect({ value, options, onChange, variant = 'status' }) {
  const colorMap =
    variant === 'payment'
      ? {
          Unpaid: 'border-red-900/50 bg-red-950/40 text-red-400',
          Partial: 'border-yellow-900/50 bg-yellow-950/40 text-yellow-400',
          Paid: 'border-green-900/50 bg-green-950/40 text-green-400',
        }
      : {
          Pending: 'border-neutral-700 bg-neutral-800/60 text-neutral-300',
          'In Progress': 'border-indigo-900/50 bg-indigo-950/40 text-indigo-400',
          'In Review': 'border-yellow-900/50 bg-yellow-950/40 text-yellow-400',
          Delivered: 'border-green-900/50 bg-green-950/40 text-green-400',
          Cancelled: 'border-red-900/50 bg-red-950/40 text-red-400',
        };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium outline-none ${
        colorMap[value] || 'border-neutral-700 bg-neutral-800/60 text-neutral-300'
      }`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-neutral-900 text-white">
          {opt}
        </option>
      ))}
    </select>
  );
}

/* ============================================================
   TAB 3: Site Settings (profile + homepage stats)
   ============================================================ */

function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [rowId, setRowId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    image_url: '',
    availability_text: '',
    projects_delivered: '',
    views_generated: '',
    client_retention: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase.from('profile').select('*').single();

      if (error) {
        setLoadError(error.message);
      } else if (data) {
        setRowId(data.id);
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          image_url: data.image_url || '',
          availability_text: data.availability_text || 'Currently booking Q3 projects',
          projects_delivered: data.projects_delivered || '150+',
          views_generated: data.views_generated || '4.5M+',
          client_retention: data.client_retention || '98%',
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const { error } = await supabase
      .from('profile')
      .update({
        name: form.name.trim(),
        bio: form.bio.trim(),
        image_url: form.image_url.trim(),
        availability_text: form.availability_text.trim(),
        projects_delivered: form.projects_delivered.trim(),
        views_generated: form.views_generated.trim(),
        client_retention: form.client_retention.trim(),
      })
      .eq('id', rowId);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-900/60" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
        Couldn't load site settings: {loadError}
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-4 w-4 text-indigo-500" />
        <h2 className="text-base font-semibold text-white sm:text-lg">
          Homepage Content
        </h2>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-base"
          />
        </Field>

        <Field label="Photo URL">
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="input-base"
          />
        </Field>

        <Field label="Bio" className="sm:col-span-2">
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="input-base resize-none"
          />
        </Field>

        <Field label="Availability Badge Text" className="sm:col-span-2">
          <input
            type="text"
            name="availability_text"
            value={form.availability_text}
            onChange={handleChange}
            placeholder="Currently booking Q3 projects"
            className="input-base"
          />
        </Field>

        <div className="sm:col-span-2 mt-2 border-t border-neutral-800 pt-5">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Homepage Stats
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Projects Delivered">
              <input
                type="text"
                name="projects_delivered"
                value={form.projects_delivered}
                onChange={handleChange}
                placeholder="150+"
                className="input-base"
              />
            </Field>
            <Field label="Views Generated">
              <input
                type="text"
                name="views_generated"
                value={form.views_generated}
                onChange={handleChange}
                placeholder="4.5M+"
                className="input-base"
              />
            </Field>
            <Field label="Client Retention">
              <input
                type="text"
                name="client_retention"
                value={form.client_retention}
                onChange={handleChange}
                placeholder="98%"
                className="input-base"
              />
            </Field>
          </div>
        </div>

        {saveError && (
          <p className="sm:col-span-2 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-400">
            {saveError}
          </p>
        )}

        {saveSuccess && (
          <p className="sm:col-span-2 rounded-lg border border-green-900/50 bg-green-950/40 px-4 py-2 text-sm text-green-400">
            Saved successfully.
          </p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ============================================================
   TAB 4: Analytics (simple visit tracker)
   ============================================================ */

function SiteAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [views, setViews] = useState([]);

  useEffect(() => {
    async function fetchViews() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('page_views')
        .select('viewed_at')
        .order('viewed_at', { ascending: false })
        .limit(5000);

      if (error) {
        setError(error.message);
      } else {
        setViews(data || []);
      }
      setLoading(false);
    }

    fetchViews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-900/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
        Couldn't load analytics: {error}
      </p>
    );
  }

  const total = views.length;

  const todayKey = new Date().toDateString();
  const todayCount = views.filter((v) => new Date(v.viewed_at).toDateString() === todayKey).length;

  // Build the last 7 days (oldest to newest), each with its visit count
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const count = views.filter((v) => new Date(v.viewed_at).toDateString() === key).length;
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    days.push({ key, label, count });
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard label="Total Visits" value={total} />
        <StatCard label="Today" value={todayCount} />
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <h2 className="mb-6 text-base font-semibold text-white sm:text-lg">
          Last 7 Days
        </h2>

        <div className="flex items-end justify-between gap-3" style={{ height: 160 }}>
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[36px] rounded-t-md bg-indigo-500 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  title={`${d.count} visits`}
                />
              </div>
              <span className="text-[11px] text-neutral-500">{d.label}</span>
              <span className="text-xs font-medium text-neutral-300">{d.count}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-neutral-600">
        Counts every load of your public homepage. Doesn't track individual visitors or personal
        data — just timestamps.
      </p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}

/* ============================================================
   TAB: Invoices (create invoices, confirm client payments)
   ============================================================ */

const INVOICE_EMPTY = {
  tracker_id: '',
  client_name: '',
  project_name: '',
  description: '',
  amount: '',
  due_date: '',
  notes: '',
};

const SETTINGS_EMPTY = {
  bkash_number: '',
  rocket_number: '',
  nagad_number: '',
  other_details: '',
  instructions: '',
};

const INVOICE_STATUS_STYLES = {
  Unpaid: 'border-red-900/50 bg-red-950/40 text-red-400',
  Partial: 'border-yellow-900/50 bg-yellow-950/40 text-yellow-400',
  Paid: 'border-green-900/50 bg-green-950/40 text-green-400',
  Cancelled: 'border-neutral-700 bg-neutral-800/60 text-neutral-400',
};

function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [trackerRows, setTrackerRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [settings, setSettings] = useState(SETTINGS_EMPTY);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(null);

  const [form, setForm] = useState(INVOICE_EMPTY);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);

  const [busyId, setBusyId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  async function loadAll(silent = false) {
    if (!silent) setLoading(true);
    setLoadError(null);

    const [inv, pay, trk, set] = await Promise.all([
      supabase.from('invoices').select('*').order('id', { ascending: false }),
      supabase.from('payments').select('*').order('submitted_at', { ascending: false }),
      supabase
        .from('project_tracker')
        .select('id, project_name, client_name')
        .order('created_at', { ascending: false }),
      supabase.from('payment_settings').select('*').eq('id', 1).maybeSingle(),
    ]);

    const err = inv.error || pay.error || trk.error || set.error;
    if (err) {
      setLoadError(err.message);
      setLoading(false);
      return;
    }

    setInvoices(inv.data || []);
    setPayments(pay.data || []);
    setTrackerRows(trk.data || []);
    if (set.data) {
      setSettings({
        bkash_number: set.data.bkash_number || '',
        rocket_number: set.data.rocket_number || '',
        nagad_number: set.data.nagad_number || '',
        other_details: set.data.other_details || '',
        instructions: set.data.instructions || '',
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function copyText(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      window.prompt('Copy this link:', text);
    }
  }

  function handleSettingsChange(e) {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);

    const clean = (v) => (v.trim() === '' ? null : v.trim());

    const { error } = await supabase.from('payment_settings').upsert(
      [
        {
          id: 1,
          bkash_number: clean(settings.bkash_number),
          rocket_number: clean(settings.rocket_number),
          nagad_number: clean(settings.nagad_number),
          other_details: clean(settings.other_details),
          instructions: clean(settings.instructions),
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );

    setSavingSettings(false);

    if (error) {
      setSettingsMsg({ type: 'error', text: error.message });
      return;
    }
    setSettingsMsg({ type: 'ok', text: 'Saved.' });
    setTimeout(() => setSettingsMsg(null), 3000);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTrackerSelect(e) {
    const value = e.target.value;
    const row = trackerRows.find((r) => String(r.id) === value);
    setForm((prev) => ({
      ...prev,
      tracker_id: value,
      client_name: row && row.client_name ? row.client_name : prev.client_name,
      project_name: row && row.project_name ? row.project_name : prev.project_name,
    }));
  }

  async function createInvoice(e) {
    e.preventDefault();
    setFormError(null);
    setCreatedInvoice(null);

    const amount = Number(form.amount);

    if (!form.client_name.trim()) {
      setFormError('Client name is required.');
      return;
    }
    if (!form.project_name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    if (!amount || amount <= 0) {
      setFormError('Enter an amount greater than 0.');
      return;
    }

    setCreating(true);

    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          tracker_id: form.tracker_id ? Number(form.tracker_id) : null,
          client_name: form.client_name.trim(),
          project_name: form.project_name.trim(),
          description: form.description.trim() || null,
          amount,
          due_date: form.due_date || null,
          notes: form.notes.trim() || null,
        },
      ])
      .select()
      .single();

    setCreating(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setCreatedInvoice({ token: data.token, invoice_no: data.invoice_no });
    setForm(INVOICE_EMPTY);
    loadAll(true);
  }

  async function confirmPayment(p) {
    const ok = window.confirm(
      `Confirm that you received ${formatMoney(p.amount)} via ${p.method} (TrxID ${p.trx_id})?\n\n` +
        `Check your ${p.method} app or SMS first. This will mark the invoice and the linked project as paid.`
    );
    if (!ok) return;

    setBusyId(`pay-${p.id}`);
    const { error } = await supabase.rpc('confirm_payment', { p_payment_id: p.id });
    if (error) window.alert(error.message);
    await loadAll(true);
    setBusyId(null);
  }

  async function rejectPayment(p) {
    const ok = window.confirm(
      `Reject this payment (TrxID ${p.trx_id})? Use this if you did not receive the money.`
    );
    if (!ok) return;

    setBusyId(`pay-${p.id}`);
    const { error } = await supabase
      .from('payments')
      .update({ status: 'Rejected' })
      .eq('id', p.id)
      .eq('status', 'Pending');
    if (error) window.alert(error.message);
    await loadAll(true);
    setBusyId(null);
  }

  async function cancelInvoice(inv) {
    const ok = window.confirm(`Cancel invoice ${inv.invoice_no}? The client will no longer be able to pay it.`);
    if (!ok) return;

    setBusyId(`inv-${inv.id}`);
    const { error } = await supabase.from('invoices').update({ status: 'Cancelled' }).eq('id', inv.id);
    if (error) window.alert(error.message);
    await loadAll(true);
    setBusyId(null);
  }

  async function deleteInvoice(inv) {
    const ok = window.confirm(`Delete invoice ${inv.invoice_no}? This cannot be undone.`);
    if (!ok) return;

    setBusyId(`inv-${inv.id}`);
    const { error } = await supabase.from('invoices').delete().eq('id', inv.id);
    if (error) window.alert(error.message);
    await loadAll(true);
    setBusyId(null);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-900/60" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
        Couldn't load invoices: {loadError}
        <br />
        <span className="text-red-300/80">
          If this is the first time, make sure you ran invoice-system.sql in Supabase.
        </span>
      </p>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === 'Pending');
  const hasPaymentNumbers = settings.bkash_number || settings.rocket_number || settings.nagad_number;

  return (
    <div className="space-y-10">
      {/* Waiting for your confirmation */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white sm:text-lg">Waiting for your confirmation</h2>
          <span className="text-xs text-neutral-500">{pendingPayments.length} pending</span>
        </div>

        {pendingPayments.length === 0 ? (
          <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-6 text-center text-sm text-neutral-500">
            No payments waiting. When a client submits a TrxID, it will show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((p) => {
              const inv = invoices.find((i) => i.id === p.invoice_id);
              const busy = busyId === `pay-${p.id}`;
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-900/40 bg-blue-950/20 px-4 py-3"
                >
                  <div className="text-sm">
                    <div className="font-medium text-white">
                      {formatMoney(p.amount)} · {p.method}
                      {inv ? ` — ${inv.client_name}` : ''}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-400">
                      {inv ? `${inv.invoice_no} · ` : ''}
                      TrxID <span className="font-mono text-neutral-200">{p.trx_id}</span>
                      {p.sender_number ? ` · from ${p.sender_number}` : ''} · {formatDate(p.submitted_at)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmPayment(p)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Confirm received
                    </button>
                    <button
                      onClick={() => rejectPayment(p)}
                      disabled={busy}
                      className="rounded-full border border-red-900/50 px-4 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create invoice */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-500" />
          <h2 className="text-base font-semibold text-white sm:text-lg">Create Invoice</h2>
        </div>

        <form onSubmit={createInvoice} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Link to tracker project (optional)" className="sm:col-span-2">
            <select
              name="tracker_id"
              value={form.tracker_id}
              onChange={handleTrackerSelect}
              className="input-base appearance-none"
            >
              <option value="" className="bg-neutral-900">
                Not linked to a tracker project
              </option>
              {trackerRows.map((r) => (
                <option key={r.id} value={r.id} className="bg-neutral-900">
                  {r.project_name}
                  {r.client_name ? ` — ${r.client_name}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Client Name">
            <input
              type="text"
              name="client_name"
              value={form.client_name}
              onChange={handleFormChange}
              className="input-base"
            />
          </Field>

          <Field label="Project Name">
            <input
              type="text"
              name="project_name"
              value={form.project_name}
              onChange={handleFormChange}
              className="input-base"
            />
          </Field>

          <Field label="Amount (৳)">
            <input
              type="number"
              name="amount"
              min="1"
              step="any"
              value={form.amount}
              onChange={handleFormChange}
              placeholder="5000"
              className="input-base"
            />
          </Field>

          <Field label="Due Date">
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleFormChange}
              className="input-base [color-scheme:dark]"
            />
          </Field>

          <Field label="Description (what the invoice is for)" className="sm:col-span-2">
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          <Field label="Notes (shown to the client)" className="sm:col-span-2">
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              className="input-base"
            />
          </Field>

          {formError && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-400 sm:col-span-2">
              {formError}
            </p>
          )}

          {createdInvoice && (
            <div className="rounded-lg border border-green-900/50 bg-green-950/40 px-4 py-3 text-sm text-green-300 sm:col-span-2">
              <div className="font-medium">
                {createdInvoice.invoice_no} created. Send this link to your client:
              </div>
              <div className="mt-2 break-all rounded-md bg-black/30 px-3 py-2 font-mono text-xs text-green-200">
                {invoiceLink(createdInvoice.token)}
              </div>
              <button
                type="button"
                onClick={() => copyText(invoiceLink(createdInvoice.token), 'created')}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-700 px-3 py-1 text-xs font-medium text-green-200 transition hover:bg-green-900/40"
              >
                <Copy className="h-3 w-3" />
                {copiedKey === 'created' ? 'Copied' : 'Copy link'}
              </button>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* All invoices */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white sm:text-lg">All Invoices</h2>
          <span className="text-xs text-neutral-500">{invoices.length} total</span>
        </div>

        {invoices.length === 0 ? (
          <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-8 text-center text-sm text-neutral-500">
            No invoices yet. Create your first one above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Client / Project</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {invoices.map((inv) => {
                  const hasPending = payments.some(
                    (p) => p.invoice_id === inv.id && p.status === 'Pending'
                  );
                  const busy = busyId === `inv-${inv.id}`;
                  const untouched = Number(inv.amount_paid) === 0;
                  return (
                    <tr key={inv.id} className="bg-neutral-900/20 transition hover:bg-neutral-900/50">
                      <td className="px-4 py-3 font-mono text-xs text-neutral-300">{inv.invoice_no}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{inv.client_name}</div>
                        <div className="text-xs text-neutral-500">{inv.project_name}</div>
                      </td>
                      <td className="px-4 py-3 text-neutral-200">{formatMoney(inv.amount)}</td>
                      <td className="px-4 py-3 text-neutral-200">{formatMoney(inv.amount_paid)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            INVOICE_STATUS_STYLES[inv.status] || INVOICE_STATUS_STYLES.Unpaid
                          }`}
                        >
                          {inv.status}
                        </span>
                        {hasPending && (
                          <div className="mt-1 text-[11px] text-blue-400">Payment to verify</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">{formatDate(inv.due_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => copyText(invoiceLink(inv.token), `inv-${inv.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-indigo-500 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedKey === `inv-${inv.id}` ? 'Copied' : 'Copy link'}
                          </button>
                          <a
                            href={invoiceLink(inv.token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-indigo-500 hover:text-white"
                          >
                            Open
                          </a>
                          {untouched && inv.status === 'Unpaid' && (
                            <button
                              onClick={() => cancelInvoice(inv)}
                              disabled={busy}
                              className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-yellow-600 hover:text-yellow-400 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                          {untouched && (
                            <button
                              onClick={() => deleteInvoice(inv)}
                              disabled={busy}
                              className="inline-flex items-center rounded-full border border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-950/40 disabled:opacity-50"
                              aria-label="Delete invoice"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Payment details shown to clients */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-white sm:text-lg">Where clients should pay</h2>
        <p className="mt-1 text-sm text-neutral-500">
          These numbers appear on every invoice page.
          {!hasPaymentNumbers && (
            <span className="text-yellow-400"> Add at least one so clients know where to send money.</span>
          )}
        </p>

        <form onSubmit={saveSettings} className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="bKash number">
            <input
              type="text"
              name="bkash_number"
              value={settings.bkash_number}
              onChange={handleSettingsChange}
              placeholder="01XXXXXXXXX"
              className="input-base"
            />
          </Field>
          <Field label="Rocket number">
            <input
              type="text"
              name="rocket_number"
              value={settings.rocket_number}
              onChange={handleSettingsChange}
              placeholder="01XXXXXXXXX"
              className="input-base"
            />
          </Field>
          <Field label="Nagad number">
            <input
              type="text"
              name="nagad_number"
              value={settings.nagad_number}
              onChange={handleSettingsChange}
              placeholder="01XXXXXXXXX"
              className="input-base"
            />
          </Field>

          <Field label="Other details (bank account, etc.)" className="sm:col-span-3">
            <textarea
              name="other_details"
              value={settings.other_details}
              onChange={handleSettingsChange}
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          <Field label="Instructions for clients" className="sm:col-span-3">
            <textarea
              name="instructions"
              value={settings.instructions}
              onChange={handleSettingsChange}
              rows={2}
              placeholder="e.g. Use Send Money, and write the invoice number as the reference."
              className="input-base resize-none"
            />
          </Field>

          {settingsMsg && (
            <p
              className={`rounded-lg border px-4 py-2 text-sm sm:col-span-3 ${
                settingsMsg.type === 'ok'
                  ? 'border-green-900/50 bg-green-950/40 text-green-400'
                  : 'border-red-900/50 bg-red-950/40 text-red-400'
              }`}
            >
              {settingsMsg.text}
            </p>
          )}

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save payment details'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ============================================================
   Custom tracker column cells
   ============================================================ */

function CustomCell({ col, value, onChange }) {
  const base =
    'w-full bg-transparent text-neutral-300 outline-none placeholder-neutral-700 focus:border-b focus:border-indigo-500';

  if (col.type === 'date') {
    return (
      <input
        type="date"
        defaultValue={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-transparent text-neutral-400 outline-none [color-scheme:dark]"
      />
    );
  }

  if (col.type === 'duration') {
    return <DurationInput value={value} onChange={onChange} />;
  }

  if (col.type === 'money' || col.type === 'number') {
    return (
      <div className="flex items-center gap-1 text-neutral-300">
        {col.type === 'money' && <span className="text-neutral-500">৳</span>}
        <input
          type="number"
          min="0"
          step="any"
          defaultValue={value ?? ''}
          onBlur={(e) => {
            const next = e.target.value === '' ? null : Number(e.target.value);
            if (next !== (value ?? null)) onChange(next);
          }}
          placeholder="0"
          className={`${base} min-w-[80px]`}
        />
      </div>
    );
  }

  if (col.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-indigo-500"
      />
    );
  }

  if (col.type === 'dropdown') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1.5 text-xs text-neutral-200 outline-none"
      >
        <option value="" className="bg-neutral-900">
          —
        </option>
        {(col.options || []).map((opt) => (
          <option key={opt} value={opt} className="bg-neutral-900 text-white">
            {opt}
          </option>
        ))}
      </select>
    );
  }

  // text and link
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        defaultValue={value || ''}
        onBlur={(e) => {
          if (e.target.value !== (value || '')) onChange(e.target.value || null);
        }}
        placeholder="—"
        className={base}
      />
      {col.type === 'link' && value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-indigo-400 hover:underline"
        >
          Open
        </a>
      )}
    </div>
  );
}

function DurationInput({ value, onChange }) {
  const total = Number(value) || 0;
  const [mins, setMins] = useState(total ? String(Math.floor(total / 60)) : '');
  const [secs, setSecs] = useState(total ? String(total % 60) : '');

  function commit() {
    const m = parseInt(mins, 10) || 0;
    const s = parseInt(secs, 10) || 0;
    const t = m * 60 + s; // e.g. 0 min 90 sec becomes 1 min 30 sec
    setMins(t ? String(Math.floor(t / 60)) : '');
    setSecs(t ? String(t % 60) : '');
    const next = t || null;
    if (next !== (total || null)) onChange(next);
  }

  const boxClass =
    'w-12 rounded-md border border-neutral-700 bg-neutral-900 px-1.5 py-1 text-right text-sm text-neutral-200 outline-none focus:border-indigo-500';

  return (
    <div className="flex items-center gap-1 whitespace-nowrap text-neutral-500">
      <input
        type="number"
        min="0"
        value={mins}
        onChange={(e) => setMins(e.target.value)}
        onBlur={commit}
        placeholder="0"
        className={boxClass}
      />
      <span className="text-xs">min</span>
      <input
        type="number"
        min="0"
        value={secs}
        onChange={(e) => setSecs(e.target.value)}
        onBlur={commit}
        placeholder="0"
        className={boxClass}
      />
      <span className="text-xs">sec</span>
    </div>
  );
}

/* ============================================================
   TAB 6: Unpaid List (admin only, linked to the Project Tracker)
   Shows only: project name, video length, payment status.
   Client names, notes, deadlines and amounts are never shown.
   ============================================================ */

const IMAGE_FONT =
  "'Inter', 'Noto Sans Bengali', 'Hind Siliguri', system-ui, -apple-system, 'Segoe UI', sans-serif";

function UnpaidList() {
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [clientFilter, setClientFilter] = useState('all');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);

    const [trk, cols] = await Promise.all([
      supabase
        .from('project_tracker')
        .select('id, project_name, client_name, status, payment_status, custom_data')
        .order('created_at', { ascending: true }),
      supabase.from('tracker_columns').select('*').order('position', { ascending: true }),
    ]);

    if (trk.error) {
      setLoadError(trk.error.message);
    } else {
      setItems(trk.data || []);
    }
    // If columns can't load, we still show the list (just without lengths)
    setColumns(cols.error ? [] : cols.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const durationCol = columns.find((c) => c.type === 'duration') || null;

  const unpaid = items.filter(
    (i) => i.payment_status !== 'Paid' && i.status !== 'Cancelled'
  );

  const clients = Array.from(
    new Set(unpaid.map((i) => (i.client_name || '').trim()).filter(Boolean))
  ).sort();

  const shown = unpaid.filter(
    (i) => clientFilter === 'all' || (i.client_name || '').trim() === clientFilter
  );

  const rows = shown.map((i) => ({
    name: i.project_name,
    length: durationCol ? formatDuration((i.custom_data || {})[durationCol.id]) : '',
    payment: i.payment_status || 'Unpaid',
  }));

  function handleDownload() {
    if (rows.length === 0) return;
    setBusy(true);
    try {
      const canvas = drawUnpaidImage({
        rows,
        client: clientFilter === 'all' ? '' : clientFilter,
        showLength: !!durationCol,
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Could not create the image. Please try again.');
          setBusy(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const who = clientFilter === 'all' ? 'all' : clientFilter.replace(/[^\w\u0980-\u09FF-]+/g, '-');
        a.href = url;
        a.download = `unpaid-projects-${who}-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setBusy(false);
      }, 'image/png');
    } catch (err) {
      alert(`Could not create the image: ${err.message}`);
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-neutral-900/60" />;
  }

  if (loadError) {
    return (
      <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
        Couldn't load the list: {loadError}
      </p>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-base font-semibold text-white sm:text-lg">
          Unpaid Projects
          <span className="ml-3 text-xs font-normal text-neutral-500">
            {rows.length} pending
          </span>
        </h2>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-200 outline-none focus:border-indigo-500"
        >
          <option value="all">All clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleDownload}
          disabled={busy || rows.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download as image
        </button>
      </div>

      {!durationCol && (
        <p className="mb-4 rounded-lg border border-yellow-900/50 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-400">
          Video length isn't showing yet. In Project Tracker, add a column of type "Video length"
          and fill it in. It will appear here automatically.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-10 text-center text-sm text-neutral-500">
          Nothing unpaid. 🎉
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Length</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map((row, idx) => (
                <tr key={idx} className="bg-neutral-900/20">
                  <td className="px-4 py-3 text-neutral-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-3 text-neutral-300">{row.length || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        row.payment === 'Partial'
                          ? 'border-yellow-900/50 bg-yellow-950/40 text-yellow-400'
                          : 'border-red-900/50 bg-red-950/40 text-red-400'
                      }`}
                    >
                      {row.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-neutral-600">
        This list updates itself from the Project Tracker. Mark a project Paid there and it
        disappears from here. The downloaded image shows only the project name, length and
        payment status.
      </p>
    </section>
  );
}

// Splits text into at most maxLines lines that fit maxWidth (adds … if cut)
function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (let w of words) {
    while (ctx.measureText(w).width > maxWidth) {
      let cut = w.length;
      while (cut > 1 && ctx.measureText(w.slice(0, cut)).width > maxWidth) cut--;
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(w.slice(0, cut));
      w = w.slice(cut);
    }
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    let last = lines[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines.length = maxLines;
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draws the styled "pending payments" picture and returns the canvas
function drawUnpaidImage({ rows, client, showLength }) {
  const W = 1080;
  const PAD = 56;
  const ROW_H = 124;
  const HEADER_H = client ? 340 : 290;
  const TABLE_HEAD_H = 84;
  const CARD_TOP = HEADER_H - 40;
  const CARD_H = TABLE_HEAD_H + rows.length * ROW_H + 24;
  const FOOTER_H = 150;
  const H = CARD_TOP + CARD_H + FOOTER_H;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'middle';

  // Page background
  ctx.fillStyle = '#eef2ff';
  ctx.fillRect(0, 0, W, H);

  // Header gradient
  const grad = ctx.createLinearGradient(0, 0, W, HEADER_H);
  grad.addColorStop(0, '#4338ca');
  grad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, HEADER_H);

  // Soft decorative circles
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.arc(W - 90, 40, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 260, HEADER_H - 20, 110, 0, Math.PI * 2);
  ctx.fill();

  // Brand
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `700 28px ${IMAGE_FONT}`;
  ctx.fillText('P I X E L   N A R R A T I V E', PAD, 70);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 68px ${IMAGE_FONT}`;
  ctx.fillText('Pending Payments', PAD, 152);

  // Subtitle (client + date)
  ctx.font = `500 30px ${IMAGE_FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  let subY = 214;
  if (client) {
    const clientLines = wrapText(ctx, `For: ${client}`, W - PAD * 2, 1);
    ctx.fillText(clientLines[0], PAD, subY);
    subY += 46;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `400 26px ${IMAGE_FONT}`;
  ctx.fillText(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    PAD,
    subY
  );

  // Card
  const cardX = PAD - 16;
  const cardW = W - (PAD - 16) * 2;
  ctx.save();
  ctx.shadowColor = 'rgba(67, 56, 202, 0.18)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, cardX, CARD_TOP, cardW, CARD_H, 32);
  ctx.fill();
  ctx.restore();

  const innerL = cardX + 40;
  const innerR = cardX + cardW - 40;
  const pillW = 160;
  const pillX = innerR - pillW;
  const lengthRight = pillX - 36;
  const nameX = innerL + 64;
  const nameMax = (showLength ? lengthRight - 150 : pillX - 30) - nameX;

  // Column headings
  const headY = CARD_TOP + TABLE_HEAD_H / 2 + 4;
  ctx.fillStyle = '#94a3b8';
  ctx.font = `700 22px ${IMAGE_FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('PROJECT', nameX, headY);
  if (showLength) {
    ctx.textAlign = 'right';
    ctx.fillText('LENGTH', lengthRight, headY);
  }
  ctx.textAlign = 'center';
  ctx.fillText('STATUS', pillX + pillW / 2, headY);

  // Rows
  rows.forEach((row, i) => {
    const top = CARD_TOP + TABLE_HEAD_H + i * ROW_H;
    const midY = top + ROW_H / 2;

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(innerL, top);
    ctx.lineTo(innerR, top);
    ctx.stroke();

    // Number badge
    ctx.fillStyle = '#e0e7ff';
    ctx.beginPath();
    ctx.arc(innerL + 24, midY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4338ca';
    ctx.font = `700 24px ${IMAGE_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), innerL + 24, midY + 1);

    // Project name (up to 2 lines)
    ctx.fillStyle = '#0f172a';
    ctx.font = `600 32px ${IMAGE_FONT}`;
    ctx.textAlign = 'left';
    const lines = wrapText(ctx, row.name, nameMax, 2);
    const lineH = 42;
    const startY = midY - ((lines.length - 1) * lineH) / 2;
    lines.forEach((ln, li) => ctx.fillText(ln, nameX, startY + li * lineH));

    // Length
    if (showLength) {
      ctx.textAlign = 'right';
      ctx.fillStyle = row.length ? '#334155' : '#cbd5e1';
      ctx.font = `500 30px ${IMAGE_FONT}`;
      ctx.fillText(row.length || '—', lengthRight, midY);
    }

    // Status pill
    const partial = row.payment === 'Partial';
    ctx.fillStyle = partial ? '#fef3c7' : '#fee2e2';
    roundedRect(ctx, pillX, midY - 26, pillW, 52, 26);
    ctx.fill();
    ctx.fillStyle = partial ? '#b45309' : '#dc2626';
    ctx.font = `700 24px ${IMAGE_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(row.payment, pillX + pillW / 2, midY + 1);
  });

  // Footer summary
  const footY = CARD_TOP + CARD_H + 70;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#312e81';
  ctx.font = `700 34px ${IMAGE_FONT}`;
  ctx.fillText(
    `${rows.length} ${rows.length === 1 ? 'project' : 'projects'} pending`,
    W / 2,
    footY
  );
  ctx.fillStyle = '#94a3b8';
  ctx.font = `400 24px ${IMAGE_FONT}`;
  ctx.fillText('Thank you for your support', W / 2, footY + 52);

  return canvas;
}