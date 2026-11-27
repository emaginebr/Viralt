import { cn } from './cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** Person's name: used for the initials and, when `standalone`, for the alt text. */
  name?: string;
  src?: string | null;
  size?: AvatarSize;
  /** The avatar appears alone (no visible name next to it): the image gets alt={name}. */
  standalone?: boolean;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-24 text-2xl',
};

export const getInitials = (name?: string): string =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/** Avatar (docs/design/components.md §27.1): image or up to two initials. */
export const Avatar = ({ name, src, size = 'md', standalone = false, className }: AvatarProps) => (
  <span
    className={cn(
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground',
      sizeClasses[size],
      className,
    )}
  >
    {src ? (
      <img src={src} alt={standalone ? name ?? '' : ''} className="size-full object-cover" />
    ) : (
      <>
        <span aria-hidden={!standalone || undefined}>{getInitials(name)}</span>
        {standalone && name && <span className="sr-only">{name}</span>}
      </>
    )}
  </span>
);

export default Avatar;
