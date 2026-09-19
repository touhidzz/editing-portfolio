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
} from 'lucide-react';

const CATEGORIES = ['YouTube', 'Cinematic', 'Shorts/Reels', 'Documentary', 'Motion Graphics'];
const STATUS_OPTIONS = ['Pending', 'In Progress', 'In Review', 'Delivered', 'Cancelled'];
const PAYMENT_OPTIONS = ['Unpaid', 'Partial', 'Paid'];

const EMPTY_FORM = {
  title: '',
  description: '',
  video_url: '',
  thumbnail_url: '',
  category: CATEGORIES[0],
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
        <div className="mx-auto flex max-w-6xl gap-2 px-6 pb-4 sm:px-10">
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        {activeTab === 'portfolio' && <PortfolioManager />}
        {activeTab === 'tracker' && <ProjectTracker />}
        {activeTab === 'settings' && <SiteSettings />}
        {activeTab === 'analytics' && <SiteAnalytics />}
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

  const [deletingId, setDeletingId] = useState(null);

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

    setSubmitting(true);

    const { error } = await supabase.from('projects').insert([
      {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
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
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-base appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-neutral-900">
                  {cat}
                </option>
              ))}
            </select>
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

          <Field label="Thumbnail URL" className="sm:col-span-2">
            <input
              type="url"
              name="thumbnail_url"
              value={form.thumbnail_url}
              onChange={handleChange}
              placeholder="https://.../thumbnail.jpg"
              className="input-base"
            />
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