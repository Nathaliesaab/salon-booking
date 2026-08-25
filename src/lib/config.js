/**
 * Whether a real Firebase project is wired up. When it is not, the app falls
 * back to a self-contained demo backend so it can be run and shown to someone
 * before any account exists.
 */
export const configured = Boolean(
  import.meta.env.VITE_FB_API_KEY && import.meta.env.VITE_FB_PROJECT_ID &&
  !import.meta.env.VITE_FB_PROJECT_ID.startsWith('your-project')
)

/**
 * UIDs allowed into the admin side, mirroring the allowlist in
 * firestore.rules. Both matter: this one decides what the UI shows, the rules
 * decide what the database actually permits. Keep them in step -- changing
 * only this one hides the tabs but grants nothing, and changing only the rules
 * grants access the UI will not offer.
 */
export const STYLIST_UIDS = (import.meta.env.VITE_STYLIST_UIDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
