/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the PM backend. Empty string = same origin. */
  readonly VITE_API_BASE_URL?: string;
  /** "true" to use the real backend instead of the in-memory mock. */
  readonly VITE_USE_REAL_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
