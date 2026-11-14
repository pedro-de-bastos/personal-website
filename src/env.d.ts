// Only the Node API used by astro.config.mjs. The scaffold has no @types/node;
// keep this narrow instead of adding a dependency or disabling type checking.
declare module 'node:process' {
 const process: { env: Record<string, string | undefined> };
 export default process;
}
