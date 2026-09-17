import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, Loader2, Plus, Film, Lock, LogOut } from 'lucide-react';

const CATEGORIES = ['YouTube', 'Cinematic', 'Shorts/Reels', 'Motion Graphics'];

const EMPTY_FORM = {
  title: '',
  description: '',
  video_url: '',
  thumbnail_url: '',
  category: CATEGORIES[0],
};

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [projects, setProjects] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  // Check if already logged in, and keep session in sync
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
    if (session) {
      fetchProjects();
    }
  }, [session]);

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

  // Still checking if a session already exists (avoids a login-box flash)
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  // Not logged in — show the real login form
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-6 text-neutral-100">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/30">
              <Lock className="h-5 w-5 text-indigo-500" />
            </div>
            <h1 className="text-lg font-semibold text-white">
              Admin Login
            </h1>
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

  // Logged in — show the dashboard
  return (
    <div className="min-h-screen bg-[#0b0f19] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-[#0b0f19]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 font-black text-sm">
              E
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
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        {/* Add Project Form */}
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

        {/* Project List */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Existing Projects
            </h2>
            <span className="text-xs text-neutral-500">
              {projects.length} total
            </span>
          </div>

          {loadingList ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-neutral-900/60"
                />
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
                    <th className="px-4 py-3 font-medium hidden md:table-cell">
                      Video URL
                    </th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="bg-neutral-900/20 transition hover:bg-neutral-900/50"
                    >
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
                      <td className="px-4 py-3 font-medium text-white">
                        {project.title}
                      </td>
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
      </main>
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
