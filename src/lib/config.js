/**
 * Whether a real Firebase project is wired up. When it is not, the app falls
 * back to a self-contained demo backend so it can be run and shown to someone
 * before any account exists.
 */
export const configured = Boolean(
  import.meta.env.VITE_FB_API_KEY && import.meta.env.VITE_FB_PROJECT_ID &&
  !import.meta.env.VITE_FB_PROJECT_ID.startsWith('your-project')
)
