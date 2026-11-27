import type { CSSProperties } from 'react';
import { contrastRatio } from './ui';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const MIN_CONTRAST = 4.5;

/**
 * Applies the campaign primary color to the design system token `--color-primary`, but only when
 * it keeps ≥ 4.5:1 against the white `primary-foreground` (docs/design/tokens.md §1.1). Otherwise
 * the default token stays, so a low-contrast brand color never reaches the CTA text.
 */
export const campaignThemeStyle = (color: string | null | undefined): CSSProperties | undefined => {
  if (!color || !HEX_PATTERN.test(color)) return undefined;
  if (contrastRatio(color, '#ffffff') < MIN_CONTRAST) return undefined;
  return {
    '--color-primary': color,
    '--color-primary-hover': color,
  } as CSSProperties;
};

/** Extracts the YouTube embed URL from the usual YouTube URL formats. */
export const getYoutubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};
