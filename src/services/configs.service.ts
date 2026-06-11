// src/services/configs.service.ts
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp, Timestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ConfigDoc, CategoryItem, Category } from '../types'

const COLLECTION = 'configs'

function docToConfig(id: string, data: Record<string, unknown>): ConfigDoc {
  return {
    id,
    category: data.category as string,
    subcategory: data.subcategory as string | undefined,
    title: data.title as string,
    slug: data.slug as string,
    description: data.description as string,
    preview: data.preview as string | undefined,
    tags: (data.tags as string[]) || [],
    configs: (data.configs as ConfigDoc['configs']) || [],
    dependencies: (data.dependencies as ConfigDoc['dependencies']) || [],
    changelog: (data.changelog as ConfigDoc['changelog']) || [],
    controls: (data.controls as ConfigDoc['controls']) || [],
    variants: (data.variants as ConfigDoc['variants']) || [],
    playgroundDefault: (data.playgroundDefault as Record<string, unknown>) || {},
    status: (data.status as ConfigDoc['status']) || 'stable',
    version: data.version as string | undefined,
    author: data.author as string | undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  }
}

export const configsService = {
  async getAll(): Promise<ConfigDoc[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('category'))
      const snap = await getDocs(q)
      return snap.docs.map(d => docToConfig(d.id, d.data()))
    } catch {
      return getMockData()
    }
  },

  async getById(id: string): Promise<ConfigDoc | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id))
      if (!snap.exists()) return null
      return docToConfig(snap.id, snap.data())
    } catch {
      return getMockData().find(d => d.id === id) || null
    }
  },

  async getBySlug(slug: string): Promise<ConfigDoc | null> {
    try {
      const q = query(collection(db, COLLECTION), where('slug', '==', slug))
      const snap = await getDocs(q)
      if (snap.empty) return null
      const d = snap.docs[0]
      return docToConfig(d.id, d.data())
    } catch {
      return getMockData().find(d => d.slug === slug) || null
    }
  },

  async createCategory(category: {
    name: string;
    slug: string;
  }) {
      await addDoc(
        collection(db, "categories"),
        {
          ...category,
          createdAt: new Date(),
        }
      );
  },

  async getCategories(): Promise<string[]> {
    const snapshot = await getDocs(
      collection(db, "categories")
    );

    return snapshot.docs.map(
      (doc) => doc.data().name
    );
  },

  async create(data: Omit<ConfigDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log("Creating document:", data);

    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  },

  async update(id: string, data: Partial<ConfigDoc>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id))
  },

  subscribeToAll(callback: (docs: ConfigDoc[]) => void) {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
    if (!projectId || projectId === 'demo-project') {
      callback(getMockData())
      return () => {}
    }
    try {
      const unsubscribe = onSnapshot(
        collection(db, COLLECTION),
        (snap) => {
          const docs = snap.docs.map(d => docToConfig(d.id, d.data()))
          callback(docs)
        },
        (_error) => { callback(getMockData()) }
      )
      return unsubscribe
    } catch {
      callback(getMockData())
      return () => {}
    }
  },
}

export function buildCategories(docs: ConfigDoc[]): Category[] {
  const map = new Map<string, CategoryItem[]>()
  docs.forEach(d => {
    const cat = d.category
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push({ id: d.id, title: d.title, slug: d.slug, category: d.category, status: d.status })
  })
  const categoryIcons: Record<string, string> = {
    Modal: '◻', Footer: '▬', Header: '▭', Theme: '◈', Banner: '▤', Home: '⌂', Typography: 'T', Loyalty: '★',
  }
  return Array.from(map.entries()).map(([name, items]) => ({
    id: name.toLowerCase(),
    name,
    icon: categoryIcons[name] || '◆',
    items: items.sort((a, b) => a.title.localeCompare(b.title)),
  }))
}

function getMockData(): ConfigDoc[] {
  return [
    // ─── LOYALTY PROGRAM ──────────────────────────────────────────────────────
    {
      id: 'loyalty-type',
      category: 'Loyalty',
      title: 'Loyalty Type',
      slug: 'loyalty-type',
      description: 'Controls the visual and behavioral variant of the loyalty program widget. Each type renders a completely different UI with its own reward mechanic, colors, and interaction model.',
      tags: ['loyalty', 'rewards', 'widget', 'versioning'],
      status: 'stable',
      version: '2.3.0',
      author: 'Product Team',
      playgroundDefault: { loyalty_type: 1, loyalty_show_points: true, loyalty_animated: true, loyalty_theme: 'gold' },
      controls: [
        {
          key: 'loyalty_type',
          label: 'Loyalty Type',
          type: 'select',
          defaultValue: 1,
          options: [
            { label: 'Type 1 — Classic Points', value: 1 },
            { label: 'Type 2 — Tier Badges', value: 2 },
            { label: 'Type 3 — Scratch Card', value: 3 },
          ],
        },
        {
          key: 'loyalty_show_points',
          label: 'Show Points Counter',
          type: 'toggle',
          defaultValue: true,
        },
        {
          key: 'loyalty_animated',
          label: 'Enable Animations',
          type: 'toggle',
          defaultValue: true,
        },
        {
          key: 'loyalty_theme',
          label: 'Color Theme',
          type: 'select',
          defaultValue: 'gold',
          options: [
            { label: 'Gold', value: 'gold' },
            { label: 'Platinum', value: 'platinum' },
            { label: 'Emerald', value: 'emerald' },
          ],
        },
      ],
      variants: [
        {
          id: 'loyalty-v1',
          label: 'Type 1 — Classic Points',
          description: 'Traditional points accumulation bar. Shows a progress bar toward the next reward tier with a star counter.',
          values: { loyalty_type: 1, loyalty_show_points: true, loyalty_animated: true, loyalty_theme: 'gold' },
          previewComponent: 'LoyaltyClassic',
          tags: ['default', 'points', 'progress-bar'],
        },
        {
          id: 'loyalty-v2',
          label: 'Type 2 — Tier Badges',
          description: 'Visual badge system showing current tier (Bronze/Silver/Gold/Platinum) with unlockable perks displayed as cards.',
          values: { loyalty_type: 2, loyalty_show_points: true, loyalty_animated: true, loyalty_theme: 'platinum' },
          previewComponent: 'LoyaltyTiers',
          tags: ['tiers', 'badges', 'gamification'],
        },
        {
          id: 'loyalty-v3',
          label: 'Type 3 — Scratch Card',
          description: 'Gamified scratch-card mechanic. Users earn scratch attempts and reveal random rewards from a prize pool.',
          values: { loyalty_type: 3, loyalty_show_points: false, loyalty_animated: true, loyalty_theme: 'emerald' },
          previewComponent: 'LoyaltyScratch',
          tags: ['scratch', 'gamification', 'random'],
        },
      ],
      configs: [
        {
          title: 'Base Config',
          description: 'Minimum required config. loyalty_type is the main switch.',
          code: { loyalty_type: 1 },
        },
        {
          title: 'Full Config',
          description: 'All available options for the loyalty widget.',
          code: {
            loyalty_type: 1,
            loyalty_show_points: true,
            loyalty_animated: true,
            loyalty_theme: 'gold',
            loyalty_max_points: 1000,
          },
        },
      ],
      dependencies: [
        {
          type: 'required',
          label: 'User Auth',
          description: 'User must be authenticated to see loyalty state.',
          code: { user_authenticated: true },
        },
        {
          type: 'optional',
          label: 'Loyalty API',
          description: 'If not set, shows demo points (0).',
          code: { loyalty_api_enabled: true, loyalty_api_endpoint: '/api/v2/loyalty' },
        },
        {
          type: 'deprecated',
          label: 'Legacy Coins',
          description: 'Old coin system removed in v2. Migrate to loyalty_type.',
          code: { coins_enabled: true },
        },
      ],
      changelog: [
        { version: '2.3.0', date: '2024-04-01', author: 'Maria L.', changes: ['Added Type 3 scratch mechanic', 'New emerald theme'] },
        { version: '2.0.0', date: '2024-01-15', author: 'Carlos M.', changes: ['Complete rewrite', 'Added Type 2 tier badges', 'Removed legacy coin system'] },
        { version: '1.0.0', date: '2023-06-01', author: 'Ana G.', changes: ['Initial loyalty widget — classic points only'] },
      ],
    },

    // ─── MODAL LOGIN ──────────────────────────────────────────────────────────
    {
      id: 'modal-login',
      category: 'Modal',
      title: 'Login',
      slug: 'modal-login',
      description: 'Controls the visual version of the login modal and enables different authentication flow variants.',
      tags: ['modal', 'login', 'auth'],
      status: 'stable',
      version: '1.2.0',
      author: 'Frontend Team',
      playgroundDefault: { modalLoginVersion: 1, modalLoginShowSocial: false, modalLoginShowBiometric: false },
      controls: [
        {
          key: 'modalLoginVersion',
          label: 'Modal Version',
          type: 'select',
          defaultValue: 1,
          options: [
            { label: 'Version 1 — Simple', value: 1 },
            { label: 'Version 2 — Two-column', value: 2 },
            { label: 'Version 3 — Full-screen', value: 3 },
          ],
        },
        { key: 'modalLoginShowSocial', label: 'Show Social Login', type: 'toggle', defaultValue: false },
        { key: 'modalLoginShowBiometric', label: 'Show Biometric Button', type: 'toggle', defaultValue: false },
      ],
      variants: [
        {
          id: 'login-v1',
          label: 'Version 1 — Simple',
          description: 'Compact single-column modal. Email + password only. No extras.',
          values: { modalLoginVersion: 1, modalLoginShowSocial: false, modalLoginShowBiometric: false },
          previewComponent: 'ModalLoginV1',
        },
        {
          id: 'login-v2',
          label: 'Version 2 — Two-column',
          description: 'Split layout with brand illustration on the left and form on the right.',
          values: { modalLoginVersion: 2, modalLoginShowSocial: true, modalLoginShowBiometric: false },
          previewComponent: 'ModalLoginV2',
        },
        {
          id: 'login-v3',
          label: 'Version 3 — Full-screen',
          description: 'Full viewport takeover with animated background. Requires modalLoginV3: true dependency.',
          values: { modalLoginVersion: 3, modalLoginShowSocial: true, modalLoginShowBiometric: true },
          previewComponent: 'ModalLoginV3',
        },
      ],
      configs: [
        { title: 'Minimal', code: { modalLoginVersion: 1 } },
        { title: 'Full', code: { modalLoginVersion: 1, modalLoginShowSocial: true, modalLoginShowBiometric: false } },
      ],
      dependencies: [
        { type: 'required', label: 'V3 Flag', description: 'Needed only for version 3.', code: { modalLoginV3: true } },
        { type: 'optional', label: 'Auth Provider', code: { authProviderGoogle: true, authProviderGithub: false } },
      ],
      changelog: [
        { version: '1.2.0', date: '2024-03-15', author: 'Carlos M.', changes: ['Added biometric toggle', 'Updated social icons'] },
        { version: '1.1.0', date: '2024-02-01', author: 'Ana G.', changes: ['V3 migration', 'Dark mode support'] },
      ],
    },

    // ─── MODAL REGISTER ───────────────────────────────────────────────────────
    {
      id: 'modal-register',
      category: 'Modal',
      title: 'Register',
      slug: 'modal-register',
      description: 'Registration modal. Controls form fields, step count, and validation flow.',
      tags: ['modal', 'register', 'form'],
      status: 'stable',
      version: '1.0.0',
      playgroundDefault: { modalRegisterVersion: 2, modalRegisterSteps: 3, modalRegisterShowPhone: false },
      controls: [
        {
          key: 'modalRegisterVersion',
          label: 'Register Version',
          type: 'select',
          defaultValue: 2,
          options: [{ label: 'V1 — Single step', value: 1 }, { label: 'V2 — Multi step', value: 2 }],
        },
        { key: 'modalRegisterSteps', label: 'Number of Steps', type: 'range', defaultValue: 3, min: 2, max: 5, step: 1 },
        { key: 'modalRegisterShowPhone', label: 'Show Phone Field', type: 'toggle', defaultValue: false },
      ],
      variants: [
        {
          id: 'register-v1',
          label: 'V1 — Single Step',
          description: 'All fields in one screen. Minimal friction.',
          values: { modalRegisterVersion: 1, modalRegisterSteps: 1, modalRegisterShowPhone: false },
          previewComponent: 'ModalRegisterV1',
        },
        {
          id: 'register-v2',
          label: 'V2 — Multi Step',
          description: 'Split into multiple steps with a progress indicator.',
          values: { modalRegisterVersion: 2, modalRegisterSteps: 3, modalRegisterShowPhone: true },
          previewComponent: 'ModalRegisterV2',
        },
      ],
      configs: [
        { title: 'Register Config', code: { modalRegisterVersion: 2, modalRegisterSteps: 3, modalRegisterShowPhone: false } },
      ],
      dependencies: [
        { type: 'compatible', label: 'Login Modal', description: 'Often used together.', code: { modalLoginVersion: 1 } },
      ],
    },

    // ─── FOOTER ───────────────────────────────────────────────────────────────
    {
      id: 'footer-main',
      category: 'Footer',
      title: 'MainFooter',
      slug: 'footer-main',
      description: 'Main footer background configuration with responsive image support.',
      tags: ['footer', 'background', 'responsive'],
      status: 'stable',
      version: '2.1.0',
      playgroundDefault: { bgFooter: { ImgD: '', ImgM: '' }, footerDark: true, footerColumns: 4 },
      controls: [
        { key: 'footerDark', label: 'Dark Mode', type: 'toggle', defaultValue: true },
        { key: 'footerColumns', label: 'Link Columns', type: 'range', defaultValue: 4, min: 2, max: 6, step: 1 },
      ],
      variants: [
        {
          id: 'footer-light',
          label: 'Light Theme',
          description: 'Footer with light background and dark text.',
          values: { bgFooter: { ImgD: '', ImgM: '' }, footerDark: false, footerColumns: 4 },
          previewComponent: 'FooterLight',
        },
        {
          id: 'footer-dark',
          label: 'Dark Theme',
          description: 'Footer with dark background for landing pages.',
          values: { bgFooter: { ImgD: '', ImgM: '' }, footerDark: true, footerColumns: 4 },
          previewComponent: 'FooterDark',
        },
      ],
      configs: [
        {
          title: 'Background Images',
          code: { bgFooter: { ImgD: 'https://cdn.example.com/footer-desktop.webp', ImgM: 'https://cdn.example.com/footer-mobile.webp' } },
        },
      ],
      dependencies: [
        { type: 'optional', label: 'Theme Override', code: { themeFooterOverride: false } },
      ],
    },

    // ─── HEADER ───────────────────────────────────────────────────────────────
    {
      id: 'header-main',
      category: 'Header',
      title: 'MainHeader',
      slug: 'header-main',
      description: 'Global header configuration including sticky behavior and transparency mode.',
      tags: ['header', 'navigation', 'sticky'],
      status: 'stable',
      version: '3.0.0',
      playgroundDefault: { headerSticky: true, headerTransparent: false, headerShowSearch: true, headerVersion: 3 },
      controls: [
        { key: 'headerSticky', label: 'Sticky Header', type: 'toggle', defaultValue: true },
        { key: 'headerTransparent', label: 'Transparent on Top', type: 'toggle', defaultValue: false },
        { key: 'headerShowSearch', label: 'Show Search Icon', type: 'toggle', defaultValue: true },
        {
          key: 'headerVersion',
          label: 'Header Version',
          type: 'select',
          defaultValue: 3,
          options: [{ label: 'V1 — Minimal', value: 1 }, { label: 'V2 — Standard', value: 2 }, { label: 'V3 — Extended', value: 3 }],
        },
      ],
      variants: [
        {
          id: 'header-v1',
          label: 'V1 — Minimal',
          description: 'Logo + hamburger only. Mobile-first.',
          values: { headerSticky: false, headerTransparent: false, headerShowSearch: false, headerVersion: 1 },
          previewComponent: 'HeaderV1',
        },
        {
          id: 'header-v2',
          label: 'V2 — Standard',
          description: 'Logo + navigation links + search.',
          values: { headerSticky: true, headerTransparent: false, headerShowSearch: true, headerVersion: 2 },
          previewComponent: 'HeaderV2',
        },
        {
          id: 'header-v3',
          label: 'V3 — Extended',
          description: 'Full mega-menu with dropdowns, search, and CTA button.',
          values: { headerSticky: true, headerTransparent: true, headerShowSearch: true, headerVersion: 3 },
          previewComponent: 'HeaderV3',
        },
      ],
      configs: [
        { title: 'Header Config', code: { headerSticky: true, headerTransparent: false, headerShowSearch: true, headerVersion: 3 } },
      ],
      dependencies: [],
    },

    // ─── THEME ────────────────────────────────────────────────────────────────
    {
      id: 'theme-colors',
      category: 'Theme',
      title: 'Color Tokens',
      slug: 'theme-colors',
      description: 'Global color token overrides for brand customization.',
      tags: ['theme', 'colors', 'tokens', 'design-system'],
      status: 'stable',
      playgroundDefault: { themePrimary: '#3b82f6', themeSecondary: '#8b5cf6', themeSurface: '#0f172a' },
      controls: [
        { key: 'themePrimary', label: 'Primary Color', type: 'color', defaultValue: '#3b82f6' },
        { key: 'themeSecondary', label: 'Secondary Color', type: 'color', defaultValue: '#8b5cf6' },
        { key: 'themeSurface', label: 'Surface Color', type: 'color', defaultValue: '#0f172a' },
      ],
      variants: [
        {
          id: 'theme-blue',
          label: 'Blue Brand',
          description: 'Default blue theme for standard brand identity.',
          values: { themePrimary: '#3b82f6', themeSecondary: '#8b5cf6', themeSurface: '#0f172a' },
          previewComponent: 'ThemePreview',
        },
        {
          id: 'theme-green',
          label: 'Emerald Brand',
          description: 'Green theme for eco or wellness verticals.',
          values: { themePrimary: '#10b981', themeSecondary: '#06b6d4', themeSurface: '#0f1f1a' },
          previewComponent: 'ThemePreview',
        },
        {
          id: 'theme-orange',
          label: 'Amber Brand',
          description: 'Warm amber theme for retail or food verticals.',
          values: { themePrimary: '#f59e0b', themeSecondary: '#ef4444', themeSurface: '#1c1508' },
          previewComponent: 'ThemePreview',
        },
      ],
      configs: [
        { title: 'Brand Colors', code: { themePrimary: '#3b82f6', themeSecondary: '#8b5cf6', themeSurface: '#0f172a' } },
      ],
      dependencies: [
        { type: 'deprecated', label: 'Legacy Colors', code: { legacyColors: true } },
      ],
    },

    // ─── BANNER ───────────────────────────────────────────────────────────────
    {
      id: 'banner-promo',
      category: 'Banner',
      title: 'Promo Banner',
      slug: 'banner-promo',
      description: 'Top promotional banner. Controls visibility, CTA text, and dismissibility.',
      tags: ['banner', 'promo', 'cta'],
      status: 'experimental',
      playgroundDefault: { bannerPromoEnabled: true, bannerPromoText: 'Limited offer!', bannerPromoDismissible: true, bannerPromoVariant: 'info' },
      controls: [
        { key: 'bannerPromoEnabled', label: 'Enabled', type: 'toggle', defaultValue: true },
        { key: 'bannerPromoText', label: 'Banner Text', type: 'text', defaultValue: 'Limited offer!' },
        { key: 'bannerPromoDismissible', label: 'Dismissible', type: 'toggle', defaultValue: true },
        {
          key: 'bannerPromoVariant',
          label: 'Variant',
          type: 'select',
          defaultValue: 'info',
          options: [
            { label: 'Info (Blue)', value: 'info' },
            { label: 'Warning (Amber)', value: 'warning' },
            { label: 'Success (Green)', value: 'success' },
            { label: 'Promo (Gradient)', value: 'promo' },
          ],
        },
      ],
      variants: [
        {
          id: 'banner-info',
          label: 'Info Banner',
          description: 'Informational blue banner for announcements.',
          values: { bannerPromoEnabled: true, bannerPromoText: 'New features available!', bannerPromoDismissible: true, bannerPromoVariant: 'info' },
          previewComponent: 'BannerPreview',
        },
        {
          id: 'banner-promo',
          label: 'Promo Banner',
          description: 'Gradient promotional banner for sales/offers.',
          values: { bannerPromoEnabled: true, bannerPromoText: '🔥 50% off this weekend only!', bannerPromoDismissible: false, bannerPromoVariant: 'promo' },
          previewComponent: 'BannerPreview',
        },
      ],
      configs: [
        { title: 'Promo Config', code: { bannerPromoEnabled: true, bannerPromoText: 'Limited offer!', bannerPromoDismissible: true } },
      ],
      dependencies: [],
    },
  ]
}
