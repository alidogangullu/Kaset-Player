/**
 * MusicKit JS decides whether to filter explicit content from a stored "itre"
 * flag that Apple's sign-in popup normally delivers. Our playback WebViews
 * inject the Music User Token directly, so that flag never arrives and MusicKit
 * falls back to guessing from the storefront: for a hardcoded list of countries
 * (br, ch, gt, hu, id, in, it, kr, la, lt, my, ru, sg, tr) it treats the account
 * as restricted and silently strips every explicit item from the queue, which
 * surfaces as "CONTENT_RESTRICTED" / "track unavailable".
 *
 * Clearing the flag makes the WebView engines behave like the native player,
 * which allows explicit content by default. Apple's servers still enforce real
 * account-level restrictions.
 *
 * Run this both before the user token is assigned (the token setter derives the
 * authorization status from the flag) and after it (the value is only persisted
 * once a token exists), and again before each setQueue since a MusicKit reset
 * drops the value.
 */
export const ALLOW_EXPLICIT_CONTENT_JS =
  'try { if (window.music) window.music.restrictedEnabled = false; } catch (e) {}';
