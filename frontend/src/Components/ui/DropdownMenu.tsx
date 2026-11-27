import { Fragment, type ReactNode } from 'react';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';

export interface DropdownMenuActionItem {
  type?: 'item';
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export interface DropdownMenuRadioGroupItem {
  type: 'radio';
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean }>;
}

export interface DropdownMenuSeparatorItem {
  type: 'separator';
}

export interface DropdownMenuLabelItem {
  type: 'label';
  label: ReactNode;
}

export type DropdownMenuItem =
  | DropdownMenuActionItem
  | DropdownMenuRadioGroupItem
  | DropdownMenuSeparatorItem
  | DropdownMenuLabelItem;

export interface DropdownMenuProps {
  /** Trigger element (a Button). Radix applies aria-haspopup and aria-expanded. */
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const itemClasses = cn(
  'relative flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-sm px-3 outline-none',
  'data-[highlighted]:bg-muted data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
);

/** Action menu over Radix DropdownMenu (docs/design/components.md §19). Not for filters: use Select. */
export const DropdownMenu = ({ trigger, items, align = 'end', side = 'bottom', className }: DropdownMenuProps) => (
  <DropdownPrimitive.Root>
    <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        side={side}
        sideOffset={6}
        className={cn(
          'z-50 min-w-56 rounded-md border border-border bg-surface p-1.5 text-sm text-foreground shadow-md',
          'motion-safe:data-[state=open]:animate-pop-in',
          className,
        )}
      >
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <DropdownPrimitive.Separator key={`sep-${index}`} className="my-1 h-px bg-border" />;
          }

          if (item.type === 'label') {
            return (
              <DropdownPrimitive.Label
                key={`label-${index}`}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {item.label}
              </DropdownPrimitive.Label>
            );
          }

          if (item.type === 'radio') {
            return (
              <DropdownPrimitive.RadioGroup
                key={`radio-${index}`}
                value={item.value}
                onValueChange={item.onValueChange}
              >
                {item.options.map((option) => (
                  <DropdownPrimitive.RadioItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(itemClasses, 'pl-9')}
                  >
                    <DropdownPrimitive.ItemIndicator className="absolute left-3 inline-flex">
                      <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                    </DropdownPrimitive.ItemIndicator>
                    {option.icon && <span aria-hidden="true">{option.icon}</span>}
                    {option.label}
                  </DropdownPrimitive.RadioItem>
                ))}
              </DropdownPrimitive.RadioGroup>
            );
          }

          return (
            <Fragment key={`item-${index}`}>
              <DropdownPrimitive.Item
                disabled={item.disabled}
                onSelect={item.onSelect}
                className={cn(itemClasses, item.destructive && 'text-danger data-[highlighted]:bg-danger-subtle')}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && <span className="text-xs text-muted-foreground">{item.shortcut}</span>}
              </DropdownPrimitive.Item>
            </Fragment>
          );
        })}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>
);

export default DropdownMenu;
