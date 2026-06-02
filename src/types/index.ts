// src/types/index.ts

// ─── Control types for the Playground ───────────────────────────────────────

export type ControlType = 'select' | 'toggle' | 'number' | 'text' | 'range' | 'color'

export interface PlaygroundControl {
  key: string          // matches the JSON key, e.g. "loyalty_type"
  label: string        // human-readable label
  type: ControlType
  options?: { label: string; value: unknown }[]  // for select
  min?: number         // for number/range
  max?: number
  step?: number
  defaultValue: unknown
}

// A single variant = a combination of config values that produces a distinct visual
export interface ConfigVariant {
  id: string
  label: string               // e.g. "Version 1 — Classic"
  description?: string
  values: Record<string, unknown>   // the full config snapshot for this variant
  previewComponent?: string   // key into the preview registry
  previewImage?: string       // fallback static image URL
  tags?: string[]
}

// ─── Main config doc ─────────────────────────────────────────────────────────

export interface ConfigItem {
  title: string
  description?: string
  code: Record<string, unknown>
}

export interface Dependency {
  type: 'required' | 'optional' | 'compatible' | 'deprecated'
  label?: string
  description?: string
  code: Record<string, unknown>
}

export interface ChangelogEntry {
  version: string
  date: string
  author?: string
  changes: string[]
}

export interface ConfigDoc {
  id: string
  category: string
  subcategory?: string
  title: string
  slug: string
  description: string
  preview?: string
  tags: string[]
  configs: ConfigItem[]
  dependencies?: Dependency[]
  changelog?: ChangelogEntry[]
  createdAt?: Date
  updatedAt?: Date
  author?: string
  status?: 'stable' | 'beta' | 'deprecated' | 'experimental'
  version?: string
  starred?: boolean

  // Playground / Storybook-style fields
  controls?: PlaygroundControl[]   // interactive knobs
  variants?: ConfigVariant[]       // discrete selectable versions
  playgroundDefault?: Record<string, unknown>  // starting state for the playground
}

// ─── Navigation / UI ────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  icon?: string
  items: CategoryItem[]
  collapsed?: boolean
}

export interface CategoryItem {
  id: string
  title: string
  slug: string
  category: string
  status?: ConfigDoc['status']
}

export interface SearchResult {
  id: string
  title: string
  category: string
  slug: string
  description: string
  tags: string[]
  matchType: 'title' | 'description' | 'tag' | 'config'
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role?: 'admin' | 'editor' | 'viewer'
}

export interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}
