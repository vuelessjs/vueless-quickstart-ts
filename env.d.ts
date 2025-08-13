/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="@modyfi/vite-plugin-yaml/modules" />
/// <reference types="vueless/modules" />

/* Module aliases for Vite */
declare module "#*" {
  const module: Record<string, unknown>;
  export = module;
  export default module;
}
