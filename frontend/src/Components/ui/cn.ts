import { clsx, type ClassValue } from 'clsx';

/** Composes class names (clsx). Conditional classes, arrays and objects are accepted. */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);

/** Focus ring shared by every interactive element (docs/design/components.md §0). */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** Text link used inside tables and paragraphs: underlined (not color only) and 44 px tall. */
export const textLinkClasses = cn(
  'inline-flex min-h-11 items-center rounded-sm font-semibold text-primary underline underline-offset-2',
  'hover:text-primary-hover',
  focusRing,
);

/** Joins ids for aria-describedby, ignoring empty values. */
export const describedBy = (...ids: Array<string | false | null | undefined>): string | undefined => {
  const value = ids.filter(Boolean).join(' ');
  return value.length > 0 ? value : undefined;
};
