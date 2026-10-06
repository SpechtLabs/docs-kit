declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent;
  export default component;
}

declare module "@temp/docs-kit/github.js" {
  import type { GitHubData } from "../src/shared/types.js";

  const data: GitHubData;
  export default data;
}

// Swagger UI's ES bundle ships no types; SwaggerUI.vue uses this much of it.
declare module "swagger-ui-dist/swagger-ui-es-bundle.js" {
  const SwaggerUIBundle: (options: { url: string; domNode: HTMLElement }) => unknown;
  export default SwaggerUIBundle;
}

declare module "*.css";
