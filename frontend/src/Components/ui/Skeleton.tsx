import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/** Decorative placeholder block. The container announces the loading state (SkeletonGroup). */
export const Skeleton = ({ className, ...rest }: SkeletonProps) => (
  <div aria-hidden="true" className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)} {...rest} />
);

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

const lineWidths = ['w-full', 'w-11/12', 'w-3/5'];

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => (
  <div aria-hidden="true" className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton key={index} className={cn('h-4', lineWidths[index % lineWidths.length])} />
    ))}
  </div>
);

export const SkeletonTitle = ({ className }: { className?: string }) => (
  <Skeleton className={cn('h-8 w-2/3', className)} />
);

export const SkeletonAvatar = ({ className }: { className?: string }) => (
  <Skeleton className={cn('size-10 rounded-full', className)} />
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <Skeleton className={cn('h-40 rounded-lg', className)} />
);

export interface SkeletonGroupProps {
  /** Screen-reader text announced while loading. */
  label?: string;
  className?: string;
  children: ReactNode;
}

/** Container with aria-busy + sr-only status text, wrapping decorative skeletons. */
export const SkeletonGroup = ({ label = 'Carregando…', className, children }: SkeletonGroupProps) => (
  <div aria-busy="true" className={className}>
    <span role="status" className="sr-only">
      {label}
    </span>
    {children}
  </div>
);

export default Skeleton;
