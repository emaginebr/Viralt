import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion, faTrash } from '@fortawesome/free-solid-svg-icons';
import { cn } from './cn';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { useReturnFocus } from './useReturnFocus';

export type ConfirmTone = 'default' | 'danger';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Runs on confirm. If it throws, the modal stays open and shows `errorMessage`. */
  onConfirm: () => void | Promise<void>;
  /** A question naming the object: "Excluir a campanha "Sorteio de Natal"?" */
  title: ReactNode;
  /** The consequence, in plain language. */
  description?: ReactNode;
  /** A verb ("Excluir", "Publicar"). Never "OK" or "Sim". */
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Text the user must type to enable the confirm button (bulk deletions). */
  requireText?: string;
  requireTextLabel?: ReactNode;
  /** External loading flag (optional; the modal also tracks onConfirm's promise). */
  loading?: boolean;
  errorMessage?: ReactNode;
}

/**
 * Confirmation dialog over Radix AlertDialog (role="alertdialog"), replacing window.confirm
 * (docs/design/components.md §26).
 */
export const ConfirmModal = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  requireText,
  requireTextLabel,
  loading = false,
  errorMessage = 'Não foi possível concluir a ação. Tente de novo.',
}: ConfirmModalProps) => {
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const [typed, setTyped] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useReturnFocus();

  const busy = loading || running;
  const isDanger = tone === 'danger';
  const textMatches = !requireText || typed.trim() === requireText;

  const handleOpenChange = (next: boolean) => {
    if (!next && busy) return;
    if (!next) {
      setTyped('');
      setFailed(false);
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setFailed(false);
    setRunning(true);
    try {
      await onConfirm();
      setRunning(false);
      setTyped('');
      onOpenChange(false);
    } catch {
      setRunning(false);
      setFailed(true);
    }
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay/60 motion-safe:data-[state=open]:animate-fade-in" />
        <AlertDialogPrimitive.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          onCloseAutoFocus={returnFocus.onCloseAutoFocus}
          onOpenAutoFocus={(event) => {
            returnFocus.rememberOpener();
            // Destructive: initial focus on "Cancelar", so Enter never confirms by accident.
            if (isDanger && cancelRef.current) {
              event.preventDefault();
              cancelRef.current.focus();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          className={cn(
            'fixed inset-x-4 top-1/2 z-50 mx-auto w-auto max-w-md -translate-y-1/2 max-h-[85dvh] overflow-y-auto',
            'rounded-lg bg-surface p-6 text-surface-foreground shadow-lg',
            'motion-safe:data-[state=open]:animate-pop-in focus-visible:outline-none',
          )}
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex size-12 shrink-0 items-center justify-center rounded-full text-xl',
                isDanger ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary',
              )}
            >
              <FontAwesomeIcon icon={isDanger ? faTrash : faCircleQuestion} />
            </span>
            <div className="min-w-0 flex-1">
              <AlertDialogPrimitive.Title className="font-display text-xl font-bold">{title}</AlertDialogPrimitive.Title>
              {description && (
                <AlertDialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
                  {description}
                </AlertDialogPrimitive.Description>
              )}
            </div>
          </div>

          {requireText && (
            <div className="mt-4">
              <Input
                label={requireTextLabel ?? `Digite ${requireText} para confirmar`}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
              />
            </div>
          )}

          {failed && (
            <div className="mt-4">
              <Alert variant="danger">{errorMessage}</Alert>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button ref={cancelRef} variant="outline" disabled={busy}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant={isDanger ? 'danger' : 'primary'}
              loading={busy}
              disabled={!textMatches}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};

/* ------------------------------------------------------------------
 * Promise API: `if (!(await confirm({...}))) return;` replaces window.confirm.
 * ------------------------------------------------------------------ */

export interface ConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  requireText?: string;
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export interface ConfirmProviderProps {
  children: ReactNode;
}

/** Single provider at the app root that renders the ConfirmModal for `useConfirm()`. */
export const ConfirmProvider = ({ children }: ConfirmProviderProps) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (next) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setOptions(next);
      }),
    [],
  );

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        open={options !== null}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
        onConfirm={() => settle(true)}
        title={options?.title ?? ''}
        description={options?.description}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        tone={options?.tone}
        requireText={options?.requireText}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export default ConfirmModal;
