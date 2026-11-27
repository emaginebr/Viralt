import type { ReactNode, RefObject } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';
import { Button } from './Button';
import { useReturnFocus } from './useReturnFocus';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required: it is the dialog's accessible name (aria-labelledby). */
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Element that receives focus when the modal opens (default: first focusable). */
  initialFocus?: RefObject<HTMLElement>;
  /** Blocks closing by Esc, overlay and X (e.g. while a request is running). */
  preventClose?: boolean;
  closeLabel?: string;
  /** Optional trigger; when given, Radix returns focus to it on close. */
  trigger?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Modal over Radix Dialog (docs/design/components.md §9): focus trap, Esc, focus return to the
 * trigger, aria-modal and scroll lock come from Radix and must not be disabled (FR-009).
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  initialFocus,
  preventClose = false,
  closeLabel = 'Fechar',
  trigger,
  className,
  children,
}: ModalProps) => {
  // With a Radix Trigger, Radix itself returns the focus to it.
  const returnFocus = useReturnFocus(!trigger);

  const handleOpenChange = (next: boolean) => {
    if (!next && preventClose) return;
    onOpenChange(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay/60 motion-safe:data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          onCloseAutoFocus={returnFocus.onCloseAutoFocus}
          onOpenAutoFocus={(event) => {
            returnFocus.rememberOpener();
            if (initialFocus?.current) {
              event.preventDefault();
              initialFocus.current.focus();
            }
          }}
          className={cn(
            'fixed inset-x-4 top-1/2 z-50 mx-auto w-auto -translate-y-1/2 max-h-[85dvh] overflow-y-auto',
            'rounded-lg bg-surface p-6 text-surface-foreground shadow-lg',
            'motion-safe:data-[state=open]:animate-pop-in focus-visible:outline-none',
            sizeClasses[size],
            className,
          )}
        >
          <DialogPrimitive.Title className="font-display text-xl font-bold pr-12">{title}</DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          )}
          {children !== undefined && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={closeLabel}
              disabled={preventClose}
              className="absolute right-3 top-3"
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

/** Closes the surrounding Modal (e.g. a "Cancelar" button in the footer). */
export const ModalClose = DialogPrimitive.Close;

export default Modal;
