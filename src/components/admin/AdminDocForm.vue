<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type {
  ConfigDoc,
  ConfigItem,
  Dependency,
  PlaygroundControl,
  ConfigVariant,
} from "../../types";
import { configsService } from "../../services/configs.service";
import { useConfigsStore } from "../../stores/configs.store";

const emit = defineEmits<{ saved: [id: string]; cancel: [] }>();
const props = defineProps<{ existing?: ConfigDoc }>();

const store = useConfigsStore();
const saving = ref(false);
const savingCategory = ref(false);
const activeSection = ref<
  "basic" | "configs" | "deps" | "controls" | "variants"
>("basic");
const showCategoryModal = ref(false);
const newCategory = ref("");

// ─── Form state ────────────────────────────────────────────────────────────
const form = reactive<Omit<ConfigDoc, "id" | "createdAt" | "updatedAt">>({
  category: props.existing?.category ?? "",
  title: props.existing?.title ?? "",
  slug: props.existing?.slug ?? "",
  description: props.existing?.description ?? "",
  tags: props.existing?.tags ?? [],
  status: props.existing?.status ?? "stable",
  version: props.existing?.version ?? "1.0.0",
  author: props.existing?.author ?? "",
  preview: props.existing?.preview ?? "",
  configs: props.existing?.configs
    ? JSON.parse(JSON.stringify(props.existing.configs))
    : [{ title: "", code: {} }],
  dependencies: props.existing?.dependencies
    ? JSON.parse(JSON.stringify(props.existing.dependencies))
    : [],
  controls: props.existing?.controls
    ? JSON.parse(JSON.stringify(props.existing.controls))
    : [],
  variants: props.existing?.variants
    ? JSON.parse(JSON.stringify(props.existing.variants))
    : [],
  playgroundDefault: props.existing?.playgroundDefault ?? {},
  changelog: props.existing?.changelog ?? [],
});

const tagInput = ref("");
const configJsonErrors = ref<string[]>([]);

// ─── Auto-slug ────────────────────────────────────────────────────────────
function autoSlug() {
  if (!props.existing) {
    form.slug = `${form.category.toLowerCase()}-${form.title.toLowerCase()}`
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
}

// ─── Tags ─────────────────────────────────────────────────────────────────
function addTag() {
  const t = tagInput.value.trim().toLowerCase().replace(/\s+/g, "-");
  if (t && !form.tags.includes(t)) form.tags.push(t);
  tagInput.value = "";
}
function removeTag(t: string) {
  form.tags = form.tags.filter((x) => x !== t);
}

// ─── Configs ──────────────────────────────────────────────────────────────
const configJsonRaw = ref<string[]>(
  (form.configs || []).map((c) => JSON.stringify(c.code, null, 2)),
);

function addConfig() {
  form.configs!.push({ title: "New Config", code: {} });
  configJsonRaw.value.push("{}");
}
function removeConfig(i: number) {
  form.configs!.splice(i, 1);
  configJsonRaw.value.splice(i, 1);
}
function updateConfigJson(i: number, raw: string) {
  configJsonRaw.value[i] = raw;
  try {
    form.configs![i].code = JSON.parse(raw);
    configJsonErrors.value[i] = "";
  } catch {
    configJsonErrors.value[i] = "Invalid JSON";
  }
}

// ─── Dependencies ─────────────────────────────────────────────────────────
const depJsonRaw = ref<string[]>(
  (form.dependencies || []).map((d) => JSON.stringify(d.code, null, 2)),
);
function addDep() {
  form.dependencies!.push({ type: "required", label: "", code: {} });
  depJsonRaw.value.push("{}");
}
function removeDep(i: number) {
  form.dependencies!.splice(i, 1);
  depJsonRaw.value.splice(i, 1);
}
function updateDepJson(i: number, raw: string) {
  depJsonRaw.value[i] = raw;
  try {
    form.dependencies![i].code = JSON.parse(raw);
  } catch {}
}

// ─── Controls ─────────────────────────────────────────────────────────────
function addControl() {
  form.controls!.push({
    key: "",
    label: "",
    type: "toggle",
    defaultValue: false,
  });
}
function removeControl(i: number) {
  form.controls!.splice(i, 1);
}

// ─── Variants ─────────────────────────────────────────────────────────────
const variantJsonRaw = ref<string[]>(
  (form.variants || []).map((v) => JSON.stringify(v.values, null, 2)),
);
function addVariant() {
  form.variants!.push({
    id: `variant-${Date.now()}`,
    label: "",
    values: {},
    previewComponent: "",
  });
  variantJsonRaw.value.push("{}");
}
function removeVariant(i: number) {
  form.variants!.splice(i, 1);
  variantJsonRaw.value.splice(i, 1);
}
function updateVariantJson(i: number, raw: string) {
  variantJsonRaw.value[i] = raw;
  try {
    form.variants![i].values = JSON.parse(raw);
  } catch {}
}

// ─── Save ─────────────────────────────────────────────────────────────────
async function save() {
  if (!form.title || !form.category || !form.slug) {
    store.notify("error", "Title, category, and slug are required.");
    return;
  }
  saving.value = true;
  try {
    if (props.existing) {
      await configsService.update(props.existing.id, form);
      store.notify("success", "Configuration updated!");
      emit("saved", props.existing.id);
    } else {
      const id = await configsService.create(form);
      store.notify("success", "Configuration created!");
      emit("saved", id);
    }
  } catch (e) {
    store.notify("error", "Failed to save. Check your Firebase config.");
    console.log("Error saving configuration:", e);
  } finally {
    saving.value = false;
  }
}

const sections = [
  { id: "basic", label: "Informacion basica" },
  { id: "configs", label: "Configuracion Principal" },
  { id: "variants", label: "Versiones" },
  { id: "deps", label: "Informacion Adicional" },
] as const;

const depTypes = ["Requerido", "Opcional", "Compatible"] as const;

const categoryOptions = ref<string[]>([]);

onMounted(async() => {
  await loadCategories();
});

async function loadCategories() {
  try {
    categoryOptions.value = await configsService.getCategories();
  } catch (e) {
    console.error("Error loading categories:", e);
  }
}

async function saveCategory() {
  if (!newCategory.value.trim()) return;
  savingCategory.value = true;

  if (categoryOptions.value.includes(newCategory.value.trim())) {
    store.notify("error", "Esta categoria ya existe.");
    savingCategory.value = false;
    return;
  }

  try {
    await configsService.createCategory({ name: newCategory.value, slug: newCategory.value.toLowerCase().replace(/\s+/g, "-") });
    form.category = newCategory.value;
    showCategoryModal.value = false;
    store.notify("success", `Categoria "${newCategory.value}" creada!`);
    await loadCategories();
    newCategory.value = "";
  } catch (e) {
    store.notify("error", "Failed to create category.");
    console.error("Error creating category:", e);
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-surface-800/60 shrink-0"
    >
      <div>
        <h2 class="text-lg font-bold text-white font-display">
          {{
            existing ? `Editar: ${existing.title}` : "Crear nueva configuración"
          }}
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <button @click="emit('cancel')" class="btn-ghost">Cancelar</button>
        <button
          @click="save"
          :disabled="saving"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="saving"
            class="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {{ saving ? "Creando..." : existing ? "Actualizar" : "Crear" }}
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left nav -->
      <nav
        class="w-52 shrink-0 border-r border-surface-800/60 py-4 space-y-0.5 px-2 bg-surface-950/60"
      >
        <button
          v-for="s in sections"
          :key="s.id"
          @click="activeSection = s.id"
          class="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
          :class="
            activeSection === s.id
              ? 'bg-accent-600/15 text-accent-300 border border-accent-500/20'
              : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/40'
          "
        >
          {{ s.label }}
        </button>
      </nav>

      <!-- Form content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- ══ BASIC INFO ══════════════════════════════════════════════════ -->
        <div v-if="activeSection === 'basic'" class="space-y-5 max-w-2xl">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-surface-300"
                >Categoria <span class="text-rose-400">*</span></label
              >
              <div class="flex gap-1">
                <select
                  v-model="form.category"
                  @change="autoSlug"
                  class="input-base"
                >
                  <option value="">Seleccionar</option>
                  <option v-for="c in categoryOptions" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
                <button class="btn-primary" @click="showCategoryModal = true">
                  <svg
                    class="w-3 h-3"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 309.059 309.059"
                    xml:space="preserve"
                  >
                    <g>
                      <g>
                        <path fill="currentColor"
                          d="M280.71,126.181h-97.822V28.338C182.889,12.711,170.172,0,154.529,0S126.17,12.711,126.17,28.338
			v97.843H28.359C12.722,126.181,0,138.903,0,154.529c0,15.621,12.717,28.338,28.359,28.338h97.811v97.843
			c0,15.632,12.711,28.348,28.359,28.348c15.643,0,28.359-12.717,28.359-28.348v-97.843h97.822
			c15.632,0,28.348-12.717,28.348-28.338C309.059,138.903,296.342,126.181,280.71,126.181z"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-surface-300"
                >Titulo <span class="text-rose-400">*</span></label
              >
              <input
                v-model="form.title"
                @input="autoSlug"
                type="text"
                placeholder="Login Modal"
                class="input-base"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-surface-300"
              >Slug <span class="text-rose-400">*</span></label
            >
            <input
              v-model="form.slug"
              type="text"
              placeholder="modal-login"
              class="input-base   text-xs"
            />
            <p class="text-[10px] text-surface-600">
              URL: /config/{{ form.slug || "slug" }}
            </p>
          </div>
          <div class="space-y-1.5">
              <label class="text-xs font-medium text-surface-300">Responsable</label>
              <input
                v-model="form.author"
                type="text"
                placeholder="Team name"
                class="input-base"
              />
            </div>
            </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-surface-300"
              >Descripcion</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Para que funciona esta configuracion, que hace, etc."
              class="input-base resize-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-surface-300"
              >URL de imagen</label
            >
            <input
              v-model="form.preview"
              type="text"
              placeholder="https://frontend.com/imagen.png"
              class="input-base   text-xs"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-surface-300">Tags</label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <div
                v-for="tag in form.tags"
                :key="tag"
                class="flex items-center gap-1 px-2 py-0.5 bg-surface-800 border border-surface-700/60 rounded-md text-xs   text-surface-300"
              >
                #{{ tag }}
                <button
                  @click="removeTag(tag)"
                  class="text-surface-600 hover:text-rose-400 transition-colors ml-0.5"
                >
                  ×
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                @keydown.enter.prevent="addTag"
                type="text"
                placeholder="Añadir tags + Enter"
                class="input-base   text-xs"
              />
              <button @click="addTag" class="btn-primary shrink-0">Añadir</button>
            </div>
          </div>
        </div>

        <!-- ══ CONFIG BLOCKS ══════════════════════════════════════════════ -->
        <div
          v-else-if="activeSection === 'configs'"
          class="space-y-4 max-w-2xl"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm text-surface-400">
              Agregar configuracion para entender como se debe utilizar, activar o manejar la configuracion.
            </p>
            <button @click="addConfig" class="btn-primary text-xs">
              + Añadir Config
            </button>
          </div>

          <div
            v-for="(cfg, i) in form.configs"
            :key="i"
            class="glass-card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-4 py-3 border-b border-surface-800/40 bg-surface-900/40"
            >
              <input
                v-model="cfg.title"
                type="text"
                placeholder="Titulo breve para esta configuracion ( Ej: Configuracion para activar el modo oscuro )"
                class="bg-transparent text-sm font-medium text-surface-200 outline-none flex-1 placeholder-surface-600"
              />
              <button
                @click="removeConfig(i)"
                class="text-surface-600 hover:text-rose-400 text-xs ml-3 transition-colors"
              >
                Eliminar
              </button>
            </div>
            <div class="p-4 space-y-3">
              <input
                v-model="cfg.description"
                type="text"
                placeholder="Descripcion opcional"
                class="input-base text-xs"
              />
              <div>
                <textarea
                  :value="configJsonRaw[i]"
                  @input="
                    updateConfigJson(
                      i,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                  rows="6"
                  placeholder='{\n  "myKey": "value"\n}'
                  class="input-base   text-xs resize-none"
                  spellcheck="false"
                />
                <p
                  v-if="configJsonErrors[i]"
                  class="text-xs text-rose-400 mt-1  "
                >
                  {{ configJsonErrors[i] }}
                </p>
              </div>
            </div>
          </div>

          <button
            v-if="!form.configs?.length"
            @click="addConfig"
            class="w-full py-10 border border-dashed border-surface-700/40 rounded-xl text-surface-600 hover:text-surface-400 hover:border-surface-600/60 transition-all text-sm"
          >
            + Add first config block
          </button>
        </div>

        <!-- ══ DEPENDENCIES ══════════════════════════════════════════════ -->
        <div v-else-if="activeSection === 'deps'" class="space-y-4 max-w-2xl">
          <div class="flex items-center justify-between">
            <p class="text-sm text-surface-400">
              Añade informacion adicional sobre la configuracion para dar contexto.
            </p>
            <button @click="addDep" class="btn-primary text-xs">
              + Añadir informacion
            </button>
          </div>

          <div
            v-for="(dep, i) in form.dependencies"
            :key="i"
            class="glass-card overflow-hidden"
          >
            <div
              class="flex items-center gap-3 px-4 py-3 border-b border-surface-800/40 bg-surface-900/40 flex-wrap"
            >
              <select
                v-model="dep.type"
                class="bg-surface-800 border border-surface-700/60 rounded-lg px-2 py-1.5 text-xs text-surface-300 outline-none"
              >
                <option v-for="dt in depTypes" :key="dt" :value="dt">
                  {{ dt }}
                </option>
              </select>
              <input
                v-model="dep.label"
                type="text"
                placeholder="Indicacion breve de esta informacion adicional ( Ej: Requiere autenticacion )"
                class="flex-1 bg-transparent text-sm text-surface-200 outline-none placeholder-surface-600 min-w-0"
              />
              <button
                @click="removeDep(i)"
                class="text-surface-600 hover:text-rose-400 text-xs transition-colors"
              >
                Eliminar
              </button>
            </div>
            <div class="p-4 space-y-3">
              <input
                v-model="dep.description"
                type="text"
                placeholder="Describe esta informacion adicional, que implica, porque es importante, etc."
                class="input-base text-xs"
              />
              <textarea
                :value="depJsonRaw[i]"
                @input="
                  updateDepJson(i, ($event.target as HTMLTextAreaElement).value)
                "
                rows="4"
                placeholder='{ "requiredKey": true }'
                class="input-base   text-xs resize-none"
                spellcheck="false"
              />
            </div>
          </div>

          <button
            v-if="!form.dependencies?.length"
            @click="addDep"
            class="w-full py-10 border border-dashed border-surface-700/40 rounded-xl text-surface-600 hover:text-surface-400 transition-all text-sm"
          >
            + Añadir informacion adicional
          </button>
        </div>

        <!-- ══ VARIANTS ════════════════════════════════════════════════════ -->
        <div
          v-else-if="activeSection === 'variants'"
          class="space-y-4 max-w-2xl"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm text-surface-400">
              Agregar variante si la configuracion lo requiere.
            </p>
            <button @click="addVariant" class="btn-primary text-xs">
              + Añadir Variante
            </button>
          </div>

          <div
            v-for="(variant, i) in form.variants"
            :key="i"
            class="glass-card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-4 py-3 border-b border-surface-800/40 bg-surface-900/40"
            >
              <input
                v-model="variant.label"
                type="text"
                placeholder="Añadir titulo ( Version 1 — Clasico / Version 2 — Moderno )"
                class="bg-transparent text-sm font-medium text-surface-200 outline-none flex-1 placeholder-surface-600"
              />
              <button
                @click="removeVariant(i)"
                class="text-surface-600 hover:text-rose-400 text-xs ml-3 transition-colors"
              >
                Eliminar
              </button>
            </div>
            <div class="p-4 space-y-3">
              <input
                v-model="variant.description"
                type="text"
                placeholder="Describe esta variante, que la diferencia de las otras, cuando usarla, etc."
                class="input-base text-xs"
              />
              <div class="space-y-1">
                <label class="text-[10px] text-surface-600"
                  >Preview Component</label
                >
                <input
                  v-model="variant.previewImage"
                  type="text"
                  placeholder="https://frontend.com/imagen.png"
                  class="input-base   text-xs"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] text-surface-600"
                  >Config Values (JSON)</label
                >
                <textarea
                  :value="variantJsonRaw[i]"
                  @input="
                    updateVariantJson(
                      i,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                  rows="5"
                  placeholder='{ "myKey": 1, "otherKey": true }'
                  class="input-base   text-xs resize-none"
                  spellcheck="false"
                />
              </div>
            </div>
          </div>

          <button
            v-if="!form.variants?.length"
            @click="addVariant"
            class="w-full py-10 border border-dashed border-surface-700/40 rounded-xl text-surface-600 hover:text-surface-400 transition-all text-sm"
          >
            + Añadir primera variante
          </button>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
  <div
    v-if="showCategoryModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div
      class="w-full max-w-md rounded-xl border border-surface-700 bg-surface-900 p-6"
    >
      <h3 class="text-lg font-semibold text-white mb-4">
        Crear Categoría
      </h3>

      <div class="space-y-4">
        <input
          v-model="newCategory"
          type="text"
          placeholder="Ej: Sportsbook"
          class="input-base"
        />

        <div class="flex justify-end gap-2">
          <button
            class="btn-ghost"
            @click="showCategoryModal = false"
          >
            Cancelar
          </button>

          <button
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            @click="saveCategory"
            :disabled="savingCategory"
          >
            {{savingCategory ? 'Creando...' : 'Crear'}}
          </button>
        </div>
      </div>
    </div>
  </div>
</Teleport>
</template>


