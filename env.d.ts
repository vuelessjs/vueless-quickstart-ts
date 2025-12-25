/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="vueless/modules" />

declare module "*.yaml" {
  const content: Record<string, string>;
  export default content;
}

/* Module aliases for Vite */
declare module "#*" {
  const module: Record<string, unknown>;
  export = module;
  export default module;
}
