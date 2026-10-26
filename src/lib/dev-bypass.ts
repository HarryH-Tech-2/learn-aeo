/**
 * Local-only preview switch for the members area.
 *
 * When the dev server is started with `AEO_DEV_BYPASS_AUTH=1`, the auth
 * middleware and the lesson API treat the visitor as a paid member so the
 * lesson flow can be viewed/screenshotted without a real session. It is
 * hard-disabled in production builds regardless of the env var.
 */
export function devBypassAuth(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.AEO_DEV_BYPASS_AUTH === "1";
}
