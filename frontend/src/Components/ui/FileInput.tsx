import { forwardRef, useState, type ChangeEvent, type DragEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { cn, describedBy } from './cn';
import { FieldError, useFieldIds } from './Field';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: ReactNode;
  /** Limits written before any error ("PNG, JPG ou WebP, até 2 MB"). */
  hint?: ReactNode;
  error?: ReactNode;
  /** Main call to action inside the drop zone. */
  prompt?: ReactNode;
  dropPrompt?: ReactNode;
  dragPrompt?: ReactNode;
  onFilesChange?: (files: FileList | null) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Selected-state content (preview, name, "Trocar"/"Remover"), rendered below the zone. */
  selected?: ReactNode;
  wrapperClassName?: string;
}

/**
 * Upload drop zone (docs/design/components.md §23): a `<label>` linked to a visually hidden but
 * focusable `<input type="file">`. Dragging is a shortcut; click, Enter and Space open the picker.
 */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      id,
      label,
      hint,
      error,
      prompt = 'Escolher arquivo',
      dropPrompt = 'ou arraste aqui',
      dragPrompt = 'Solte para enviar',
      onFilesChange,
      onChange,
      selected,
      disabled,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const ids = useFieldIds(id, hint, error, ariaDescribedBy);
    const labelId = `${ids.id}-label`;
    const [dragging, setDragging] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onFilesChange?.(event.target.files);
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      if (!disabled) setDragging(true);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragging(false);
      if (!disabled) onFilesChange?.(event.dataTransfer.files);
    };

    return (
      <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-50 pointer-events-none', wrapperClassName)}>
        <span id={labelId} className="text-sm font-semibold text-foreground">
          {label}
        </span>
        <label
          htmlFor={ids.id}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-surface p-6 text-center',
            'transition-colors duration-150 hover:border-primary hover:bg-primary-subtle',
            'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
            error ? 'border-danger' : 'border-input',
            dragging && 'border-primary bg-primary-subtle',
          )}
        >
          <FontAwesomeIcon icon={faCloudArrowUp} aria-hidden="true" className="text-2xl text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            {dragging ? (
              dragPrompt
            ) : (
              <>
                {prompt} <span className="font-normal text-muted-foreground">{dropPrompt}</span>
              </>
            )}
          </span>
          {hint && (
            <span id={ids.hintId} className="text-xs text-muted-foreground">
              {hint}
            </span>
          )}
          <input
            ref={ref}
            id={ids.id}
            type="file"
            disabled={disabled}
            aria-labelledby={labelId}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy(ids.hintId, ids.errorId, ariaDescribedBy)}
            onChange={handleChange}
            className="sr-only"
            {...rest}
          />
        </label>
        {selected}
        <FieldError id={ids.errorId}>{error}</FieldError>
      </div>
    );
  },
);

FileInput.displayName = 'FileInput';

export default FileInput;
