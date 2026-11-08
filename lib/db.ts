import fs from "fs/promises";
import path from "path";
import postgres from "postgres";

// Types
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  order: number;
  status: "draft" | "published";
  coverImage: string;
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};
export type SiteData = {
  profile: {
    name: string;
    role: string;
    location: string;
    age: number | null;
    bio: string;
    heroTitle: string;
    heroSubtitle: string;
    email: string;
    whatsapp: string;
    mobile: string;
    accentColor: string;
    seoTitle: string;
    seoDescription: string;
    social: Record<string,string>;
    featuredProjectId: string | null;
    profilePhoto: string;
    resumeUrl: string;
  };
  projects: Project[];
  services: { id:string; title:string; description:string; icon:string; order:number }[];
  skills: { id:string; name:string; level:string; category:string; order:number }[];
  education: { id:string; title:string; institution:string; year:string; description:string; order:number }[];
  admin: { passwordHash: string | null; createdAt: string | null };
  branding: { accentColor: string };
  meta: { updatedAt: string };
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const DEFAULT_DATA: SiteData = {
  profile: {
    name: "Wahab Ahmad",
    role: "Graphic Designer & Web Builder",
    location: "Faisalabad, Punjab, Pakistan",
    age: null,
    bio: "",
    heroTitle: "Crafting visual identities that feel royal, refined, and unmistakably yours.",
    heroSubtitle: "Graphic Designer & Web Builder based in Faisalabad — blending thoughtful strategy with elegant design to help brands stand apart.",
    email: "rjvlog332@gmail.com",
    whatsapp: "+92 317-0643281",
    mobile: "03017013821",
    accentColor: "#C9A96A",
    seoTitle: "Wahab Ahmad — Graphic Designer & Web Builder | Faisalabad",
    seoDescription: "Portfolio of Wahab Ahmad, Graphic Designer & Web Builder based in Faisalabad, Punjab, Pakistan. Premium branding, textile, and web design.",
    social: { instagram: "", behance: "", dribbble: "", linkedin: "", website: "" },
    featuredProjectId: null,
    profilePhoto: "",
    resumeUrl: "",
  },
  projects: [
    {
      id: "city-edit-brooklyn",
      title: "The City Edit — Brooklyn Athletics Club",
      category: "Screen Printing",
      description: "Screen printing — apparel typography: The City Edit, Brooklyn Athletics Club est. 1999, New York, USA. Shown on off-white tee and black hoodie.",
      order: 0,
      status: "published",
      coverImage: "/portfolio/the-city-edit-offwhite.webp",
      images: ["/portfolio/the-city-edit-black-hoodie.webp"],
      featured: false,
      createdAt: "2026-11-08T08:06:27.722134Z",
      updatedAt: "2026-11-08T08:06:27.722307Z",
    },
    {
      id: "nyc-campus-club",
      title: "NYC Campus Club — Official Athletics Dept",
      category: "Screen Printing",
      description: "Screen printing — NYC Campus Club, Official Athletics Dept. Black and white tee variations.",
      order: 1,
      status: "published",
      coverImage: "/portfolio/nyc-campus-white-tee.webp",
      images: ["/portfolio/nyc-campus-black-female.webp"],
      featured: false,
      createdAt: "2026-11-08T08:06:27.722311Z",
      updatedAt: "2026-11-08T08:06:27.722312Z",
    },
    {
      id: "textile-embroidered-kurta",
      title: "Textile",
      category: "Textile",
      description: "",
      order: 2,
      status: "published",
      coverImage: "/portfolio/textile-embroidered-kurta.webp",
      images: [],
      featured: false,
      createdAt: "2026-11-08T08:06:27.722314Z",
      updatedAt: "2026-11-08T08:06:27.722315Z",
    },
  ],
  services: [],
  skills: [],
  education: [],
  admin: { passwordHash: null, createdAt: null },
  branding: { accentColor: "#C9A96A" },
  meta: { updatedAt: new Date().toISOString() }
};

let sql: ReturnType<typeof postgres> | null = null;
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (sql) return sql;
  try {
    sql = postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 10, ssl: process.env.PGSSLMODE === "disable" ? false : true });
    return sql;
  } catch { return null; }
}

export function isDatabaseConfigured(): boolean { return !!process.env.DATABASE_URL; }
export function isBlobConfigured(): boolean { return !!process.env.BLOB_READ_WRITE_TOKEN; }

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

async function readFileStore(): Promise<SiteData> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as SiteData;
    // merge defaults for missing keys
    return { ...DEFAULT_DATA, ...parsed, profile: { ...DEFAULT_DATA.profile, ...parsed.profile }, meta: parsed.meta || DEFAULT_DATA.meta };
  } catch {
    await writeFileStore(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
}

async function writeFileStore(data: SiteData): Promise<void> {
  await ensureDataDir();
  data.meta.updatedAt = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Postgres helpers - lazy table creation
async function ensurePgTables() {
  const s = getSql();
  if (!s) return;
  await s.unsafe(`
    create table if not exists site_store (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz default now()
    );
  `);
  // ensure row exists
  const existing = await s`select id from site_store where id='main'`;
  if (existing.length === 0) {
    await s`insert into site_store (id, data) values ('main', ${JSON.stringify(DEFAULT_DATA)}::jsonb)`;
  }
}

export async function getStore(): Promise<SiteData> {
  const s = getSql();
  if (s) {
    try {
      await ensurePgTables();
      const rows = await s`select data from site_store where id='main'`;
      if (rows.length > 0) {
        const d = rows[0].data as SiteData;
        // merge defaults
        return { ...DEFAULT_DATA, ...d, profile: { ...DEFAULT_DATA.profile, ...(d.profile||{}) }, admin: d.admin || DEFAULT_DATA.admin, meta: d.meta || DEFAULT_DATA.meta };
      }
    } catch (e) {
      console.error("PG read failed, falling back to file:", e);
    }
  }
  return readFileStore();
}

export async function saveStore(data: SiteData): Promise<void> {
  const s = getSql();
  if (s) {
    try {
      await ensurePgTables();
      await s`insert into site_store (id, data) values ('main', ${JSON.stringify(data)}::jsonb)
        on conflict (id) do update set data = excluded.data, updated_at = now()`;
      return;
    } catch (e) {
      console.error("PG write failed, falling back to file:", e);
    }
  }
  await writeFileStore(data);
}

// Atomic update helper
export async function updateStore(mutator: (data: SiteData) => SiteData | Promise<SiteData>): Promise<SiteData> {
  const data = await getStore();
  const next = await mutator(data);
  await saveStore(next);
  return next;
}

// Convenience getters
export async function getProfile() { return (await getStore()).profile; }
export async function getProjects(status?: "draft"|"published") {
  const s = await getStore();
  let list = [...s.projects].sort((a,b)=> (a.order - b.order) || (a.createdAt.localeCompare(b.createdAt)));
  if (status) list = list.filter(p => p.status === status);
  return list;
}
export async function getPublishedProjects() { return getProjects("published"); }

export async function isAdminConfigured(): Promise<boolean> {
  const s = await getStore();
  return !!s.admin.passwordHash;
}

export async function getPasswordHash(): Promise<string | null> {
  const s = await getStore();
  return s.admin.passwordHash;
}

export async function setPasswordHash(hash: string): Promise<void> {
  await updateStore(d => ({ ...d, admin: { passwordHash: hash, createdAt: new Date().toISOString() } }));
}

export const db = { getStore, saveStore, updateStore, getProfile, getProjects, getPublishedProjects, isAdminConfigured, getPasswordHash, setPasswordHash, isDatabaseConfigured, isBlobConfigured };
