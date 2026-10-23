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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        {activeTab === 'portfolio' && <PortfolioManager />}
        {activeTab === 'tracker' && <ProjectTracker />}
        {activeTab === 'settings' && <SiteSettings />}
        {activeTab === 'analytics' && <SiteAnalytics />}
        {activeTab === 'invoices' && <InvoiceManager />}
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
      .select('id, title, description, category, video_url, thumbnail_url')
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
          <span className="text-xs text-neutral-500">{projects.length} total</span>
        </div>

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
                  <th className="px-4 py-3 font-medium">Thumbnail</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Video URL</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {projects.map((project) => (
                  <tr key={project.id} className="bg-neutral-900/20 transition hover:bg-neutral-900/50">
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
          <span className="text-xs text-neutral-500">{items.length} total</span>
        </div>

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
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {items.map((item) => (
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