import { useEffect, useState, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { cn, describedBy } from './cn';
import { FieldError, FieldLabel, controlClasses, useFieldIds } from './Field';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** WCAG contrast ratio between two #RRGGBB colors. */
export const contrastRatio = (hexA: string, hexB: string): number => {
  const luminance = (hex: string): number => {
    const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
    const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = luminance(hexA);
  const b = luminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

export interface ColorInputProps {
  id?: string;
  label: ReactNode;
  /** Current color, #RRGGBB. */
  value: string;
  onChange: (value: string) => void;
  /** Screen-reader label of the native picker ("Escolher cor primária no seletor"). */
  pickerLabel?: string;
  /** Text color the swatch is checked against (default white). Pass null to hide the feedback. */
  contrastWith?: string | null;
  invalidMessage?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/** Native color picker + editable hex field, with live contrast feedback (§24). */
export const ColorInput = ({
  id,
  label,
  value,
  onChange,
  pickerLabel = 'Escolher cor no seletor',
  contrastWith = '#ffffff',
  invalidMessage = 'Use o formato #RRGGBB.',
  disabled,
  required,
  className,
}: ColorInputProps) => {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  const isValid = HEX_PATTERN.test(text);
  const ids = useFieldIds(id, contrastWith && isValid ? 'contrast' : null, isValid ? null : invalidMessage);
  const ratio = contrastWith && isValid ? contrastRatio(text, contrastWith) : null;
  const passes = ratio !== null && ratio >= 4.5;
  const ratioText = ratio !== null ? ratio.toFixed(2).replace('.', ',') : '';

  const handleText = (next: string) => {
    setText(next);
    if (HEX_PATTERN.test(next)) onChange(next.toLowerCase());
  };

  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-50 pointer-events-none', className)}>
      <FieldLabel htmlFor={ids.id} required={required}>
        {label}
      </FieldLabel>
      <div className="flex">
        <label className="relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-l-md border border-r-0 border-input bg-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
          <span className="sr-only">{pickerLabel}</span>
          <input
            type="color"
            value={isValid ? text : value}
            disabled={disabled}
            onChange={(event) => handleText(event.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            className="size-6 rounded-sm border border-foreground/20"
            style={{ backgroundColor: isValid ? text : value }}
          />
        </label>
        <input
          id={ids.id}
          type="text"
          inputMode="text"
          spellCheck={false}
          value={text}
          disabled={disabled}
          required={required}
          pattern="#[0-9A-Fa-f]{6}"
          aria-invalid={!isValid || undefined}
          aria-describedby={describedBy(ids.hintId, ids.errorId)}
          onChange={(event) => handleText(event.target.value)}
          className={cn(controlClasses, 'rounded-l-none font-mono uppercase')}
        />
      </div>
      {ratio !== null && (
        <p
          id={ids.hintId}
          className={cn('flex items-center gap-1.5 text-sm', passes ? 'text-success' : 'text-warning')}
        >
          <FontAwesomeIcon icon={passes ? faCircleCheck : faTriangleExclamation} aria-hidden="true" />
          {passes
            ? `Contraste com o texto: ${ratioText}:1 (aprovado)`
            : `Contraste baixo (${ratioText}:1). A página pública vai usar a cor padrão.`}
        </p>
      )}
      <FieldError id={ids.errorId}>{isValid ? null : invalidMessage}</FieldError>
    </div>
  );
};

export default ColorInput;
