import type { ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { cn, focusRing } from './cn';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabStatus = 'complete' | 'error';

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Small counter/badge after the label (e.g. errors count). */
  badge?: ReactNode;
  status?: TabStatus;
  disabled?: boolean;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Required accessible name of the tablist. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  /** "Etapas" variant (campaign builder): numbered steps. */
  steps?: boolean;
  statusLabels?: Partial<Record<TabStatus, string>>;
  className?: string;
  listClassName?: string;
}

const tabClasses: Record<TabsOrientation, string> = {
  horizontal: cn(
    'inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 text-sm font-medium',
    'text-muted-foreground transition-colors duration-150 hover:text-foreground',
    'aria-selected:border-primary aria-selected:font-semibold aria-selected:text-foreground',
  ),
  vertical: cn(
    'flex min-h-11 items-center gap-3 rounded-md border-l-4 border-transparent px-3 text-left text-sm font-medium',
    'text-muted-foreground transition-colors duration-150 hover:bg-muted',
    'aria-selected:border-primary aria-selected:bg-primary-subtle aria-selected:font-semibold aria-selected:text-foreground',
  ),
};

const listClasses: Record<TabsOrientation, string> = {
  horizontal: 'flex gap-1 overflow-x-auto border-b border-border',
  vertical: 'flex flex-col gap-1',
};

const defaultStatusLabels: Record<TabStatus, string> = {
  complete: 'concluída',
  error: 'com erros',
};

/**
 * Tabs over Radix Tabs (docs/design/components.md §12 and §21): WAI-ARIA tabs with automatic
 * activation, arrow keys (← → or ↑ ↓ when vertical), Home/End and roving tabindex.
 */
export const Tabs = ({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  steps = false,
  statusLabels,
  className,
  listClassName,
}: TabsProps) => {
  const statusText = { ...defaultStatusLabels, ...statusLabels };
  const isVertical = orientation === 'vertical';

  return (
    <TabsPrimitive.Root
      value={value}
      defaultValue={defaultValue ?? (value === undefined ? items[0]?.id : undefined)}
      onValueChange={onValueChange}
      orientation={orientation}
      activationMode="automatic"
      className={cn(isVertical && 'grid gap-8 lg:grid-cols-[16rem_1fr]', className)}
    >
      <TabsPrimitive.List
        aria-label={label}
        className={cn(listClasses[orientation], isVertical && 'self-start lg:sticky lg:top-24', listClassName)}
      >
        {items.map((item, index) => (
          <TabsPrimitive.Trigger
            key={item.id}
            value={item.id}
            disabled={item.disabled}
            className={cn(tabClasses[orientation], focusRing, 'cursor-pointer disabled:opacity-50 disabled:pointer-events-none')}
          >
            {steps && (
              <span
                aria-hidden="true"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-input text-xs font-semibold tabular-nums"
              >
                {item.status === 'complete' ? <FontAwesomeIcon icon={faCheck} /> : index + 1}
              </span>
            )}
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {item.status === 'error' && (
              <FontAwesomeIcon icon={faCircleExclamation} aria-hidden="true" className="text-danger" />
            )}
            {item.status && <span className="sr-only">({statusText[item.status]})</span>}
            {item.badge}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.id}
          value={item.id}
          className={cn(isVertical ? 'min-w-0' : 'pt-6', focusRing)}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
};

export default Tabs;
