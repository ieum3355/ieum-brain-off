/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_GO_KR_SERVICE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
