import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Play,
  ArrowUpRight,
  Film,
  Clapperboard,
  Sparkles,
  Smartphone,
  Mail,
  MessageCircle,
  Sun,
  Moon,
} from 'lucide-react';

const FILTERS = [
  { label: 'All', value: 'All', icon: Sparkles },
  { label: 'YouTube', value: 'YouTube', icon: Film },
  { label: 'Cinematic', value: 'Cinematic', icon: Clapperboard },
  { label: 'Shorts/Reels', value: 'Shorts/Reels', icon: Smartphone },
  { label: 'Documentary', value: 'Documentary', icon: Play },
  { label: 'Motion Graphics', value: 'Motion Graphics', icon: Clapperboard },
];

const WHATSAPP_URL = 'https://wa.me/8801591190612';
const DEFAULT_BIO =
  'I craft high-end, high-retention talking head video, documentary, and dynamic motion graphics that bring scripts to life.';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, category, video_url, thumbnail_url')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    }

    async function fetchProfile() {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profile')
        .select('name, bio, image_url, projects_delivered, views_generated, client_retention')
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfileData(data);
      }
      setProfileLoading(false);
    }

    fetchProjects();
    fetchProfile();
  }, []);

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-white text-neutral-900 transition-colors duration-300 selection:bg-indigo-500/30 dark:bg-[#0a0a0b] dark:text-neutral-100">
      {/* Ambient background glow (dark mode only) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-0 transition-opacity duration-500 dark:opacity-100">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-fuchsia-600/5 blur-[100px]" />
      </div>

      <Nav theme={theme} setTheme={setTheme} />
      <Hero profileData={profileData} profileLoading={profileLoading} />
      <WorkSection
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        projects={filteredProjects}
        loading={loading}
        error={error}
      />
      <CTASection />
      <Footer />
    </div>
  );
}

/* ---------------------------------- Nav ---------------------------------- */

function Nav({ theme, setTheme }) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-lg transition-colors duration-300 dark:border-neutral-900 dark:bg-[#0a0a0b]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white">
            <Clapperboard className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-wide text-neutral-800 dark:text-neutral-200">
            PIXEL{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-500 bg-clip-text text-transparent">
              NARRATIVE
            </span>
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-neutral-500 dark:text-neutral-400 sm:flex">
          <a href="#work" className="transition hover:text-neutral-900 dark:hover:text-white">
            Work
          </a>
          <a href="#contact" className="transition hover:text-neutral-900 dark:hover:text-white">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-[#25D366] hover:text-[#25D366] dark:border-neutral-700 dark:text-neutral-300"
          >
            <MessageCircle className="h-4 w-4" />
          </a>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-indigo-500 hover:text-indigo-500 dark:border-neutral-700 dark:text-neutral-300"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <a
            href="#contact"
            className="hidden rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:border-indigo-500 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-white sm:inline-block sm:text-sm"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero({ profileData, profileLoading }) {
  const [imgFailed, setImgFailed] = useState(false);

  const name = profileData?.name || '';
  const bio = profileData?.bio || DEFAULT_BIO;
  const imageUrl = profileData?.image_url || '';
  const projectsDelivered = profileData?.projects_delivered || '150+';
  const viewsGenerated = profileData?.views_generated || '4.5M+';
  const clientRetention = profileData?.client_retention || '98%';

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'PN';

  return (
    <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-16 text-center sm:px-10 sm:pb-32 sm:pt-24">
      {/* Availability badge */}
      <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-medium text-neutral-500 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
        Currently booking Q3 projects
      </div>

      {/* Profile photo */}
      <div className="mx-auto mb-8 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500/30 via-transparent to-fuchsia-600/30 blur-2xl" />
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:h-36 sm:w-36">
            {imageUrl && !imgFailed ? (
              <img
                src={imageUrl}
                alt={name || 'Profile photo'}
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-neutral-200 text-2xl font-bold text-indigo-500 dark:to-neutral-900 dark:text-violet-400 sm:text-3xl">
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>

      {profileLoading ? (
        <div className="mx-auto space-y-4">
          <div className="mx-auto h-4 w-40 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
          <div className="mx-auto h-14 w-full max-w-lg animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900 sm:h-16" />
          <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
        </div>
      ) : (
        <>
          {name && (
            <h1 className="text-2xl font-bold tracking-tight text-violet-600 dark:text-violet-300 sm:text-4xl">
              {name}
            </h1>
          )}

          <p className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl">
            Crafting stories that{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              move people.
            </span>
          </p>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-lg">
            {bio}
          </p>
        </>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#work"
          className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white"
        >
          View My Work
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500"
        >
          Start a Project
        </a>
      </div>

      <div className="mx-auto mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <Stat value={projectsDelivered} label="Projects Delivered" />
        <Stat value={viewsGenerated} label="Views Generated" />
        <Stat value={clientRetention} label="Client Retention" />
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 sm:text-xs">
        {label}
      </div>
    </div>
  );
}

/* -------------------------------- WorkSection -------------------------------- */

function WorkSection({ activeFilter, setActiveFilter, projects, loading, error }) {
  return (
    <section id="work" className="relative z-10 border-t border-neutral-200 dark:border-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Portfolio
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Selected Work
            </h2>
          </div>

          <FilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>

        <ProjectGrid projects={projects} loading={loading} error={error} />
      </div>
    </section>
  );
}

/* -------------------------------- FilterBar -------------------------------- */

function FilterBar({ activeFilter, setActiveFilter }) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map(({ label, value, icon: Icon }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
              isActive
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- ProjectGrid -------------------------------- */

function ProjectGrid({ projects, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          Couldn't load projects: {error}
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/30">
        <p className="text-sm text-neutral-500">
          No projects found in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }) {
  const { title, description, category, video_url, thumbnail_url } = project;

  return (
    <a
      href={video_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-neutral-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-600">
            <Film className="h-8 w-8" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 group-hover:scale-100 group-hover:bg-indigo-500 group-hover:ring-indigo-500">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </div>
        </div>

        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-200 backdrop-blur">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 transition-colors group-hover:text-indigo-500 dark:text-white dark:group-hover:text-violet-400 sm:text-lg">
            {title}
          </h3>
          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors group-hover:text-indigo-500 dark:text-neutral-300 dark:group-hover:text-violet-400">
          Watch Full Edit
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
}

/* -------------------------------- CTASection -------------------------------- */

function CTASection() {
  return (
    <section id="contact" className="relative z-10 border-t border-neutral-200 dark:border-neutral-900">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:px-10 sm:py-32">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
          Let's work together
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Let's cut something great.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-neutral-500 dark:text-neutral-400 sm:text-lg">
          Available for freelance and long-term editing partnerships.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:itouhidul491@gmail.com"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-4 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:text-base"
          >
            <Mail className="h-4 w-4" />
            itouhidul491@gmail.com
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#1DA851] sm:text-base"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Footer --------------------------------- */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-neutral-200 dark:border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center sm:flex-row sm:px-10 sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white">
            <Clapperboard className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold tracking-wide text-neutral-500 dark:text-neutral-400">
            PIXEL{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-500 bg-clip-text text-transparent">
              NARRATIVE
            </span>
          </span>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-600">
          © {new Date().getFullYear()} Pixel Narrative. All rights reserved.
        </p>
      </div>
    </footer>
  );
}