<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  component: string
  values: Record<string, unknown>
}
const props = defineProps<Props>()

// ─── Loyalty Classic (Type 1) ─────────────────────────────────────────────
const loyaltyPoints = computed(() => props.values.loyalty_show_points !== false ? 740 : null)
const loyaltyTheme = computed(() => {
  const t = props.values.loyalty_theme as string
  if (t === 'platinum') return { bg: 'from-slate-700 to-slate-900', accent: '#94a3b8', bar: 'bg-slate-400', text: 'text-slate-300', label: 'Platinum' }
  if (t === 'emerald') return { bg: 'from-emerald-800 to-emerald-950', accent: '#34d399', bar: 'bg-emerald-400', text: 'text-emerald-300', label: 'Emerald' }
  return { bg: 'from-amber-800 to-yellow-950', accent: '#fbbf24', bar: 'bg-amber-400', text: 'text-amber-300', label: 'Gold' }
})
const loyaltyAnimated = computed(() => props.values.loyalty_animated !== false)

// ─── Modal Login helpers ──────────────────────────────────────────────────
const loginShowSocial = computed(() => props.values.modalLoginShowSocial === true)
const loginShowBio = computed(() => props.values.modalLoginShowBiometric === true)

// ─── Register helpers ─────────────────────────────────────────────────────
const regSteps = computed(() => Math.min(5, Math.max(1, Number(props.values.modalRegisterSteps) || 3)))
const regShowPhone = computed(() => props.values.modalRegisterShowPhone === true)

// ─── Banner helpers ───────────────────────────────────────────────────────
const bannerText = computed(() => String(props.values.bannerPromoText || 'Promotional message here'))
const bannerDismissible = computed(() => props.values.bannerPromoDismissible !== false)
const bannerVariant = computed(() => {
  const v = props.values.bannerPromoVariant as string
  if (v === 'warning') return { cls: 'bg-amber-500/20 border-amber-500/30 text-amber-200', icon: '⚠️' }
  if (v === 'success') return { cls: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200', icon: '✅' }
  if (v === 'promo') return { cls: 'bg-gradient-to-r from-violet-600/40 to-pink-600/40 border-violet-500/30 text-white', icon: '🔥' }
  return { cls: 'bg-accent-500/20 border-accent-500/30 text-accent-200', icon: 'ℹ️' }
})

// ─── Theme helpers ────────────────────────────────────────────────────────
const themePrimary = computed(() => String(props.values.themePrimary || '#3b82f6'))
const themeSecondary = computed(() => String(props.values.themeSecondary || '#8b5cf6'))
const themeSurface = computed(() => String(props.values.themeSurface || '#0f172a'))

// ─── Header helpers ───────────────────────────────────────────────────────
const headerVersion = computed(() => Number(props.values.headerVersion) || 1)
const headerTransparent = computed(() => props.values.headerTransparent === true)
const headerShowSearch = computed(() => props.values.headerShowSearch !== false)

// ─── Footer helpers ───────────────────────────────────────────────────────
const footerDark = computed(() => props.values.footerDark !== false)
const footerCols = computed(() => Math.min(6, Math.max(2, Number(props.values.footerColumns) || 4)))
</script>

<template>
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  LOYALTY — Type 1: Classic Points                                     -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-if="component === 'LoyaltyClassic'"
    class="rounded-xl overflow-hidden w-full"
    :class="`bg-gradient-to-br ${loyaltyTheme.bg}`"
  >
    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs opacity-60 uppercase tracking-widest font-mono">Loyalty Program</p>
          <p class="text-lg font-bold text-white font-display mt-0.5">Classic Points</p>
        </div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          :style="`background: ${loyaltyTheme.accent}20; border: 1px solid ${loyaltyTheme.accent}40`">⭐</div>
      </div>

      <div v-if="loyaltyPoints !== null" class="space-y-2">
        <div class="flex justify-between items-end">
          <span class="text-3xl font-bold text-white font-display">{{ loyaltyPoints.toLocaleString() }}</span>
          <span class="text-xs opacity-50">/ 1,000 pts</span>
        </div>
        <div class="w-full h-2 rounded-full bg-white/10">
          <div
            class="h-2 rounded-full"
            :class="[loyaltyTheme.bar, loyaltyAnimated ? 'transition-all duration-700' : '']"
            style="width: 74%"
          />
        </div>
        <div class="flex justify-between text-xs opacity-50">
          <span>Bronze</span><span class="opacity-100" :class="loyaltyTheme.text">Silver (260 pts away)</span><span>Gold</span>
        </div>
      </div>

      <div v-else class="py-2 text-center opacity-40 text-sm">Points hidden</div>

      <button class="w-full py-2 rounded-lg text-sm font-semibold text-surface-900"
        :style="`background: ${loyaltyTheme.accent}`">
        Redeem Rewards →
      </button>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  LOYALTY — Type 2: Tier Badges                                        -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'LoyaltyTiers'"
    class="rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 overflow-hidden w-full"
  >
    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-widest font-mono">Your Tier</p>
          <p class="text-lg font-bold text-white font-display mt-0.5">Tier Badges</p>
        </div>
        <span class="text-2xl">🏆</span>
      </div>

      <div class="grid grid-cols-4 gap-2">
        <div v-for="(tier, i) in [
          { name: 'Bronze', icon: '🥉', active: false },
          { name: 'Silver', icon: '🥈', active: true },
          { name: 'Gold', icon: '🥇', active: false },
          { name: 'Plat', icon: '💎', active: false },
        ]" :key="i"
          class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all"
          :class="tier.active ? 'bg-slate-400/20 border border-slate-400/40 ring-1 ring-slate-400/30' : 'bg-slate-800/60 border border-slate-700/30 opacity-40'"
        >
          <span class="text-xl">{{ tier.icon }}</span>
          <span class="text-[10px] font-mono" :class="tier.active ? 'text-slate-300' : 'text-slate-600'">{{ tier.name }}</span>
          <div v-if="tier.active" class="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      </div>

      <div v-if="loyaltyPoints !== null" class="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2">
        <span class="text-xs text-slate-500">Current points</span>
        <span class="text-sm font-bold text-slate-300 font-mono">{{ loyaltyPoints.toLocaleString() }}</span>
      </div>

      <div class="space-y-1.5">
        <div v-for="perk in ['Free shipping on all orders', '2× points on weekends', 'Early access to sales']"
          :key="perk"
          class="flex items-center gap-2 text-xs text-slate-400">
          <span class="text-emerald-400 text-[10px]">✓</span>{{ perk }}
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  LOYALTY — Type 3: Scratch Card                                       -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'LoyaltyScratch'"
    class="rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700/40 overflow-hidden w-full"
  >
    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-emerald-600 uppercase tracking-widest font-mono">Scratch & Win</p>
          <p class="text-lg font-bold text-white font-display mt-0.5">Your Cards</p>
        </div>
        <span class="text-2xl">🎫</span>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div v-for="(card, i) in [
          { scratched: true, reward: '🎁 +50pts' },
          { scratched: false, reward: '?' },
          { scratched: false, reward: '?' },
        ]" :key="i"
          class="aspect-[3/2] rounded-xl flex items-center justify-center text-center p-2"
          :class="card.scratched
            ? 'bg-emerald-500/20 border border-emerald-500/30'
            : 'bg-gradient-to-br from-emerald-600/40 to-teal-600/40 border border-emerald-500/20 cursor-pointer hover:from-emerald-500/50 transition-all'"
        >
          <span class="text-sm font-bold" :class="card.scratched ? 'text-emerald-300' : 'text-emerald-600'">
            {{ card.reward }}
          </span>
        </div>
      </div>

      <p class="text-xs text-emerald-600 text-center">2 cards remaining · Tap to scratch</p>

      <button class="w-full py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-emerald-950">
        Earn More Cards →
      </button>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  MODAL LOGIN — V1: Simple                                             -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'ModalLoginV1'"
    class="rounded-xl bg-surface-900 border border-surface-700/60 overflow-hidden w-full max-w-sm mx-auto"
  >
    <div class="p-6 space-y-4">
      <div class="text-center space-y-1">
        <div class="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center mx-auto mb-3">
          <span class="text-lg">🔐</span>
        </div>
        <h3 class="text-base font-bold text-white font-display">Sign in</h3>
        <p class="text-xs text-surface-500">Welcome back</p>
      </div>
      <div class="space-y-2">
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Email address</span>
        </div>
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Password</span>
        </div>
      </div>
      <button class="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent-600 text-white">Continue</button>
      <div v-if="loginShowSocial" class="space-y-2 pt-1">
        <div class="flex items-center gap-2"><div class="flex-1 h-px bg-surface-800"/><span class="text-xs text-surface-600">or</span><div class="flex-1 h-px bg-surface-800"/></div>
        <div class="grid grid-cols-2 gap-2">
          <button class="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-800 border border-surface-700/60 text-xs text-surface-400">
            <span>G</span> Google
          </button>
          <button class="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-800 border border-surface-700/60 text-xs text-surface-400">
            <span>🐙</span> GitHub
          </button>
        </div>
      </div>
      <div v-if="loginShowBio" class="flex justify-center">
        <button class="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300">
          <span>👆</span> Use biometric
        </button>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  MODAL LOGIN — V2: Two-column                                         -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'ModalLoginV2'"
    class="rounded-xl bg-surface-900 border border-surface-700/60 overflow-hidden w-full"
  >
    <div class="flex min-h-[240px]">
      <!-- Left panel -->
      <div class="flex-1 bg-gradient-to-br from-accent-600 to-violet-700 p-6 flex flex-col justify-between">
        <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <span class="text-white font-bold text-xs">CF</span>
        </div>
        <div>
          <p class="text-white font-bold text-base font-display">Welcome back</p>
          <p class="text-white/60 text-xs mt-1">Sign in to continue your journey</p>
        </div>
      </div>
      <!-- Right form -->
      <div class="flex-1 p-5 flex flex-col gap-3">
        <p class="text-sm font-semibold text-white font-display">Sign in</p>
        <div class="space-y-2 flex-1">
          <div class="h-8 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
            <span class="text-[10px] text-surface-600">Email</span>
          </div>
          <div class="h-8 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
            <span class="text-[10px] text-surface-600">Password</span>
          </div>
        </div>
        <button class="w-full py-2 rounded-lg text-xs font-semibold bg-accent-600 text-white">Continue →</button>
        <div v-if="loginShowSocial" class="grid grid-cols-2 gap-1.5">
          <button class="py-1.5 rounded-md bg-surface-800 border border-surface-700/60 text-[10px] text-surface-500">G Google</button>
          <button class="py-1.5 rounded-md bg-surface-800 border border-surface-700/60 text-[10px] text-surface-500">🐙 GitHub</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  MODAL LOGIN — V3: Full-screen                                        -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'ModalLoginV3'"
    class="rounded-xl overflow-hidden w-full relative"
    style="min-height: 280px"
  >
    <div class="absolute inset-0 bg-gradient-to-br from-accent-900 via-violet-900 to-surface-950" />
    <!-- Animated orbs -->
    <div class="absolute top-4 right-4 w-24 h-24 rounded-full bg-accent-500/20 blur-2xl" />
    <div class="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-violet-500/20 blur-2xl" />
    <div class="relative z-10 flex items-center justify-center h-full p-8">
      <div class="w-full max-w-xs space-y-4">
        <div class="text-center">
          <p class="text-white font-bold text-xl font-display">Welcome back</p>
          <p class="text-white/50 text-xs mt-1">Full-screen immersive login</p>
        </div>
        <div class="space-y-2">
          <div class="h-10 bg-white/10 backdrop-blur rounded-xl border border-white/10 px-3 flex items-center">
            <span class="text-xs text-white/40">Email address</span>
          </div>
          <div class="h-10 bg-white/10 backdrop-blur rounded-xl border border-white/10 px-3 flex items-center">
            <span class="text-xs text-white/40">Password</span>
          </div>
        </div>
        <button class="w-full py-2.5 rounded-xl text-sm font-semibold bg-white text-surface-900">Sign in</button>
        <div v-if="loginShowSocial" class="grid grid-cols-2 gap-2">
          <button class="py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-white/60">G Google</button>
          <button class="py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-white/60">🐙 GitHub</button>
        </div>
        <div v-if="loginShowBio" class="text-center">
          <button class="text-xs text-white/40">👆 Biometric login</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  MODAL REGISTER — V1 Single Step                                      -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'ModalRegisterV1'"
    class="rounded-xl bg-surface-900 border border-surface-700/60 overflow-hidden w-full max-w-sm mx-auto"
  >
    <div class="p-6 space-y-3">
      <div class="text-center space-y-1 mb-2">
        <h3 class="text-base font-bold text-white font-display">Create account</h3>
        <p class="text-xs text-surface-500">All fields in one step</p>
      </div>
      <div class="space-y-2">
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Full name</span>
        </div>
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Email address</span>
        </div>
        <div v-if="regShowPhone" class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Phone number</span>
        </div>
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Password</span>
        </div>
      </div>
      <button class="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent-600 text-white">Create account</button>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  MODAL REGISTER — V2 Multi Step                                       -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'ModalRegisterV2'"
    class="rounded-xl bg-surface-900 border border-surface-700/60 overflow-hidden w-full max-w-sm mx-auto"
  >
    <div class="p-6 space-y-4">
      <!-- Progress -->
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-surface-500">
          <span>Step 1 of {{ regSteps }}</span>
          <span>Personal info</span>
        </div>
        <div class="flex gap-1">
          <div v-for="s in regSteps" :key="s"
            class="flex-1 h-1 rounded-full"
            :class="s === 1 ? 'bg-accent-500' : 'bg-surface-800'"
          />
        </div>
      </div>
      <div class="text-center">
        <h3 class="text-base font-bold text-white font-display">Who are you?</h3>
        <p class="text-xs text-surface-500 mt-0.5">Step 1: Your details</p>
      </div>
      <div class="space-y-2">
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Full name</span>
        </div>
        <div class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Email address</span>
        </div>
        <div v-if="regShowPhone" class="h-9 bg-surface-800 rounded-lg border border-surface-700/60 px-3 flex items-center">
          <span class="text-xs text-surface-600">Phone number</span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="flex-1 py-2 rounded-lg text-sm border border-surface-700 text-surface-400">Back</button>
        <button class="flex-1 py-2 rounded-lg text-sm font-semibold bg-accent-600 text-white">Next →</button>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  BANNER PREVIEW                                                       -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'BannerPreview'" class="rounded-xl overflow-hidden w-full">
    <!-- Simulated page with banner -->
    <div class="bg-surface-950 rounded-xl overflow-hidden border border-surface-800/60">
      <!-- Banner -->
      <div class="flex items-center justify-between px-4 py-2.5 border-b"
        :class="bannerVariant.cls">
        <div class="flex items-center gap-2">
          <span class="text-sm">{{ bannerVariant.icon }}</span>
          <span class="text-sm font-medium">{{ bannerText }}</span>
        </div>
        <button v-if="bannerDismissible" class="text-xs opacity-60 hover:opacity-100 transition-opacity ml-4">✕</button>
      </div>
      <!-- Fake page content -->
      <div class="p-6 space-y-3">
        <div class="h-4 bg-surface-800 rounded w-2/3" />
        <div class="h-3 bg-surface-800/60 rounded w-full" />
        <div class="h-3 bg-surface-800/60 rounded w-4/5" />
        <div class="h-8 bg-surface-800/40 rounded-lg w-32 mt-4" />
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  HEADER PREVIEW                                                       -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="['HeaderV1','HeaderV2','HeaderV3'].includes(component)" class="rounded-xl overflow-hidden w-full">
    <div class="border border-surface-800/60 rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-surface-800"
        :class="headerTransparent ? 'bg-transparent' : 'bg-surface-900'">
        <!-- Logo always -->
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-accent-500 flex items-center justify-center">
            <span class="text-white text-[10px] font-bold">L</span>
          </div>
          <span class="text-sm font-bold text-white font-display">Logo</span>
        </div>
        <!-- Nav links — V2+ -->
        <div v-if="headerVersion >= 2" class="hidden sm:flex items-center gap-4">
          <span v-for="l in ['Home','About','Products']" :key="l"
            class="text-xs text-surface-400 hover:text-white cursor-pointer transition-colors">{{ l }}</span>
          <!-- Dropdown indicator for V3 -->
          <span v-if="headerVersion >= 3" class="text-xs text-surface-400 cursor-pointer">More ▾</span>
        </div>
        <!-- Right side -->
        <div class="flex items-center gap-2">
          <div v-if="headerShowSearch && headerVersion >= 2"
            class="w-6 h-6 rounded-md bg-surface-800 flex items-center justify-center text-surface-500 text-xs">⌕</div>
          <button v-if="headerVersion >= 3" class="px-3 py-1 rounded-md bg-accent-600 text-white text-xs font-medium">Get started</button>
          <button v-else class="w-6 h-6 flex flex-col gap-1 items-center justify-center">
            <span class="w-4 h-0.5 bg-surface-400 rounded"></span>
            <span class="w-4 h-0.5 bg-surface-400 rounded"></span>
          </button>
        </div>
      </div>
      <!-- Page body placeholder -->
      <div class="p-6 bg-surface-950 space-y-3">
        <div class="h-5 bg-surface-800 rounded w-1/2" />
        <div class="h-3 bg-surface-800/50 rounded w-full" />
        <div class="h-3 bg-surface-800/50 rounded w-3/4" />
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  FOOTER PREVIEW                                                       -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="['FooterLight','FooterDark'].includes(component)" class="rounded-xl overflow-hidden w-full">
    <div class="border border-surface-800/60 rounded-xl overflow-hidden">
      <div class="p-3 space-y-2" :class="footerDark ? 'bg-surface-950' : 'bg-white'">
        <!-- Columns -->
        <div class="grid gap-3" :style="`grid-template-columns: repeat(${footerCols}, 1fr)`">
          <div v-for="c in footerCols" :key="c" class="space-y-1.5">
            <div class="h-3 rounded w-3/4" :class="footerDark ? 'bg-surface-700' : 'bg-gray-300'" />
            <div v-for="r in 3" :key="r" class="h-2 rounded" :class="footerDark ? 'bg-surface-800' : 'bg-gray-200'" />
          </div>
        </div>
        <!-- Bottom bar -->
        <div class="flex items-center justify-between pt-2 border-t"
          :class="footerDark ? 'border-surface-800' : 'border-gray-200'">
          <div class="h-2 w-20 rounded" :class="footerDark ? 'bg-surface-800' : 'bg-gray-200'" />
          <div class="flex gap-1.5">
            <div v-for="i in 3" :key="i" class="w-5 h-5 rounded-full" :class="footerDark ? 'bg-surface-800' : 'bg-gray-200'" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  THEME PREVIEW                                                        -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else-if="component === 'ThemePreview'" class="rounded-xl overflow-hidden w-full">
    <div class="rounded-xl border border-surface-800/60 overflow-hidden" :style="`background: ${themeSurface}`">
      <!-- Mini app chrome -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg" :style="`background: ${themePrimary}`" />
          <span class="text-white text-sm font-display font-bold">Brand</span>
        </div>
        <button class="px-3 py-1 rounded-lg text-xs font-semibold text-white" :style="`background: ${themePrimary}`">
          Get started
        </button>
      </div>
      <div class="p-4 space-y-3">
        <div class="h-5 w-2/3 rounded-lg bg-white/10" />
        <div class="h-3 w-full rounded bg-white/5" />
        <div class="h-3 w-4/5 rounded bg-white/5" />
        <div class="flex gap-2 mt-2">
          <div class="px-3 py-1.5 rounded-lg text-xs text-white font-medium" :style="`background: ${themePrimary}`">Primary</div>
          <div class="px-3 py-1.5 rounded-lg text-xs text-white font-medium" :style="`background: ${themeSecondary}`">Secondary</div>
          <div class="px-3 py-1.5 rounded-lg text-xs text-white/60 border border-white/10">Ghost</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <!--  FALLBACK                                                             -->
  <!-- ══════════════════════════════════════════════════════════════════════ -->
  <div v-else class="rounded-xl bg-surface-900 border border-surface-800/40 border-dashed flex flex-col items-center justify-center py-16 gap-3">
    <span class="text-4xl opacity-20">◎</span>
    <p class="text-sm text-surface-600 font-mono">No preview for "{{ component }}"</p>
  </div>
</template>
