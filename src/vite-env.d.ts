/// <reference types="vite/client" />

declare module "*.yml" {
  const value: Record<string, unknown>
  export default value
}
