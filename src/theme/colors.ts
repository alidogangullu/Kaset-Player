/**
 * Centralized app color palette.
 * Use theme context (useTheme()) to get colors in components.
 * See docs/THEME_AND_COLORS.md.
 *
 * Kaset Player brand:
 * - Pink accent (brandPink) and red (brandRed) for small highlights only.
 * - Light mode: warm beige surfaces. Dark mode: near-black neutral surfaces.
 */

export type AppColors = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brandPink: string;
  brandRed: string;
  accent: string;

  // ── Gradient background ────────────────────────────────────────────────────
  gradientStart: string;
  gradientEnd: string;

  // ── Screen / surface backgrounds ──────────────────────────────────────────
  screenBackground: string;
  codeScreenBackground: string;
  lightGreyBg: string;
  subtleBg: string;

  // ── Text (light surfaces) ─────────────────────────────────────────────────
  textOnDark: string;
  textMuted: string;
  textSubtle: string;
  textMono: string;
  textSecondary: string;
  textFooter: string;
  cardTitleText: string;

  // ── Text (dark surfaces — now playing, overlays) ──────────────────────────
  onDarkTextPrimary: string;
  onDarkTextSecondary: string;
  onDarkTextMuted: string;
  onDarkTextDim: string;

  // ── Buttons ────────────────────────────────────────────────────────────────
  buttonPrimary: string;
  buttonSecondaryBg: string;
  buttonFocusedBg: string;
  alertRed: string;

  // ── Borders ────────────────────────────────────────────────────────────────
  borderMuted: string;

  // ── Status messages ────────────────────────────────────────────────────────
  messageSuccessBg: string;
  messageSuccessBorder: string;
  messageErrorBg: string;
  messageErrorBorder: string;

  // ── Glass morphism (light) ────────────────────────────────────────────────
  glassBg: string;
  glassBorder: string;
  glassBorderSubtle: string;
  glassCodeBg: string;
  glassButtonBg: string;
  glassButtonBorder: string;
  glassCardBg: string;
  glassCardBgStrong: string;
  /** Very transparent white — nav card bg in transparent/light mode. */
  glassBgDim: string;

  // ── Text (dark surfaces — additional opacity variants) ────────────────────
  /** 0.7 opacity white text. */
  onDarkTextFaint: string;
  /** 0.8 opacity white text. */
  onDarkTextSoft: string;

  // ── Controls (dark surface) ───────────────────────────────────────────────
  onDarkControlBg: string;
  /** Semi-transparent white focus bg on dark surfaces. */
  onDarkBgMid: string;
  /** Semi-transparent white bg for active/selected state on dark surfaces. */
  onDarkButtonActiveBg: string;
  /** Dark icon color for use on white/light focused button backgrounds. */
  onDarkFocusedIcon: string;

  // ── Progress bar (on dark bg) ─────────────────────────────────────────────
  progressTrackBg: string;
  progressTrackFocusedBg: string;
  scrubFillBg: string;
  scrubKnobBg: string;

  // ── Dark overlays ─────────────────────────────────────────────────────────
  overlayLight: string;
  overlayMid: string;
  overlayMedium: string;
  overlayStrong: string;
  overlayHeavy: string;

  // ── System UI ─────────────────────────────────────────────────────────────
  notificationBadge: string;

  // ── Now Playing (dynamic palette fallbacks) ───────────────────────────────
  nowPlayingDarkBg: string;
  nowPlayingDarkBgDeep: string;

  // ── Modal (dark-themed) ───────────────────────────────────────────────────
  modalOverlay: string;
  modalBg: string;
  modalBorder: string;
  modalInputBg: string;
  modalInputPlaceholder: string;

  // ── Navigation bar ────────────────────────────────────────────────────────
  /** Top bar card background (main container). */
  navBarCardBg: string;
  /** Grey bar background (tabs + search area). */
  navBarGreyBg: string;
  /** Nav tab pill when focused (white, elevated). */
  navTabFocusedBg: string;
  /** Nav tab text when unfocused. */
  navTabText: string;
  /** Nav tab text when focused. */
  navTabTextFocused: string;
  /** Avatar background (on card). */
  navAvatarBg: string;

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsCardBg: string;
  settingsTextSubdued: string;
  settingsTextHint: string;
  settingsTextDisabled: string;

  // ── Discount / savings ────────────────────────────────────────────────────
  /** Vivid green for discount badges — same saturation/energy as brandPink. */
  discountGreen: string;
};

export const lightColors: AppColors = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brandPink: '#FF4E6B',
  brandRed: '#FF0436',
  accent: '#FF4E6B',

  // ── Gradient background ────────────────────────────────────────────────────
  gradientStart: '#f1e8da',
  gradientEnd: '#d8ccb9',

  // ── Screen / surface backgrounds ──────────────────────────────────────────
  screenBackground: '#f1e8da',
  codeScreenBackground: '#f1e8da',
  lightGreyBg: '#f0f0f0',
  subtleBg: 'rgba(0, 0, 0, 0.05)',

  // ── Text (light surfaces) ─────────────────────────────────────────────────
  textOnDark: '#111111',
  textMuted: '#666666',
  textSubtle: '#555555',
  textMono: '#444444',
  textSecondary: '#6b7280',
  textFooter: 'rgba(107, 114, 128, 0.8)',
  cardTitleText: '#404040',

  // ── Text (dark surfaces — now playing, overlays) ──────────────────────────
  onDarkTextPrimary: '#ffffff',
  onDarkTextSecondary: 'rgba(255, 255, 255, 0.65)',
  onDarkTextMuted: 'rgba(255, 255, 255, 0.5)',
  onDarkTextDim: 'rgba(255, 255, 255, 0.4)',

  // ── Buttons ────────────────────────────────────────────────────────────────
  buttonPrimary: '#FF0436',
  buttonSecondaryBg: '#e0e0e0',
  buttonFocusedBg: '#ffffff',
  alertRed: '#f0535b',

  // ── Borders ────────────────────────────────────────────────────────────────
  borderMuted: '#cccccc',

  // ── Status messages ────────────────────────────────────────────────────────
  messageSuccessBg: 'rgba(0, 200, 100, 0.2)',
  messageSuccessBorder: '#00cc88',
  messageErrorBg: 'rgba(255, 80, 80, 0.2)',
  messageErrorBorder: '#ff5555',

  // ── Glass morphism (light) ────────────────────────────────────────────────
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.85)',
  glassBorderSubtle: 'rgba(255, 255, 255, 0.2)',
  glassCodeBg: 'rgba(255, 255, 255, 0.6)',
  glassButtonBg: 'rgba(255, 255, 255, 0.75)',
  glassButtonBorder: 'rgba(255, 78, 107, 0.35)',
  glassCardBg: 'rgba(255, 255, 255, 0.85)',
  glassCardBgStrong: 'rgba(255, 255, 255, 0.90)',
  glassBgDim: 'rgba(255, 255, 255, 0.12)',

  // ── Text (dark surfaces — additional opacity variants) ────────────────────
  onDarkTextFaint: 'rgba(255, 255, 255, 0.7)',
  onDarkTextSoft: 'rgba(255, 255, 255, 0.8)',

  // ── Controls (dark surface) ───────────────────────────────────────────────
  onDarkControlBg: 'rgba(255, 255, 255, 0.15)',
  onDarkBgMid: 'rgba(255, 255, 255, 0.3)',
  onDarkButtonActiveBg: 'rgba(255, 255, 255, 0.18)',
  onDarkFocusedIcon: '#111111',

  // ── Progress bar (on dark bg) ─────────────────────────────────────────────
  progressTrackBg: 'rgba(255, 255, 255, 0.1)',
  progressTrackFocusedBg: 'rgba(255, 255, 255, 0.2)',
  scrubFillBg: 'rgba(255, 255, 255, 0.25)',
  scrubKnobBg: '#ffffff',

  // ── Dark overlays ─────────────────────────────────────────────────────────
  overlayLight: 'rgba(0, 0, 0, 0.15)',
  overlayMid: 'rgba(0, 0, 0, 0.3)',
  overlayMedium: 'rgba(0, 0, 0, 0.35)',
  overlayStrong: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',

  // ── System UI ─────────────────────────────────────────────────────────────
  notificationBadge: '#FF3B30',

  // ── Now Playing (dynamic palette fallbacks) ───────────────────────────────
  nowPlayingDarkBg: '#1a1a1a',
  nowPlayingDarkBgDeep: '#121212',

  // ── Modal ───────────────────────────────────────────────────
  modalOverlay: 'rgba(0, 0, 0, 0.9)',
  modalBg: '#2a2a2a',
  modalBorder: '#444444',
  modalInputBg: '#1a1a1a',
  modalInputPlaceholder: 'rgba(255, 255, 255, 0.4)',

  // ── Navigation bar ────────────────────────────────────────────────────────
  navBarCardBg: '#ebe3d6',
  navBarGreyBg: 'rgba(0, 0, 0, 0.06)',
  navTabFocusedBg: '#FFFFFF',
  navTabText: '#6b7280',
  navTabTextFocused: '#111111',
  navAvatarBg: 'rgba(0, 0, 0, 0.06)',

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsCardBg: 'rgba(255, 255, 255, 0.95)',
  settingsTextSubdued: 'rgba(0, 0, 0, 0.7)',
  settingsTextHint: 'rgba(0, 0, 0, 0.35)',
  settingsTextDisabled: 'rgba(0, 0, 0, 0.25)',

  discountGreen: '#30D158',
};

export const darkColors: AppColors = {
  ...lightColors,

  // ── Gradient ──────────────────────────────────────────────────────────────
  gradientStart: '#1c1c1c',
  gradientEnd: '#0d0d0d',

  // ── Screen / surface backgrounds ──────────────────────────────────────────
  screenBackground: '#0d0d0d',
  codeScreenBackground: '#0d0d0d',
  lightGreyBg: '#1e1e1e',
  subtleBg: 'rgba(255, 255, 255, 0.05)',

  // ── Text (light surfaces → repurposed for dark bg) ────────────────────────
  textOnDark: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  textSubtle: 'rgba(255, 255, 255, 0.45)',
  cardTitleText: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  glassCodeBg: 'rgba(255, 255, 255, 0.08)',

  // ── Overlays (inverted for dark bg) ──────────────────────────────────────
  overlayLight: 'rgba(255, 255, 255, 0.15)',

  // ── Buttons ────────────────────────────────────────────────────────────────
  buttonSecondaryBg: '#262626',
  buttonFocusedBg: '#3a3a3a',

  // ── Borders ────────────────────────────────────────────────────────────────
  borderMuted: 'rgba(255, 255, 255, 0.12)',

  // ── Glass morphism (dark) ─────────────────────────────────────────────────
  glassBg: '#262626',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassBorderSubtle: 'rgba(255, 255, 255, 0.08)',
  glassButtonBg: '#262626',
  glassCardBg: '#262626',
  glassCardBgStrong: '#3a3a3a',

  // ── Navigation bar ────────────────────────────────────────────────────────
  navBarCardBg: '#262626',
  navBarGreyBg: '#262626',
  navTabFocusedBg: '#ffffff',
  navTabText: 'rgba(255, 255, 255, 0.55)',
  navTabTextFocused: '#0d0d0d',

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsCardBg: '#3a3a3a',
  settingsTextSubdued: 'rgba(255, 255, 255, 0.55)',
  settingsTextHint: 'rgba(255, 255, 255, 0.38)',
  settingsTextDisabled: 'rgba(255, 255, 255, 0.22)',
};

/** @deprecated Use lightColors or darkColors directly. */
export const colors: AppColors = lightColors;
