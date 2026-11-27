import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../ui';

export type CountdownVariant = 'blocks' | 'compact';

interface CountdownTimerProps {
  endDate: string;
  /** `blocks` = public page (4 blocks); `compact` = one line, used by the widget header. */
  variant?: CountdownVariant;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

const calculateTimeLeft = (endDate: string): TimeLeft | null => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / DAY_MS),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    totalMs: diff,
  };
};

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Countdown (docs/design/components.md §18.1). The live digits are aria-hidden; screen readers
 * get a static sentence with the end date, so nothing is announced every second.
 */
const CountdownTimer = ({ endDate, variant = 'blocks' }: CountdownTimerProps) => {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(endDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(endDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const endLabel = useMemo((): string => {
    const date = new Date(endDate);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }, [endDate, i18n.language]);

  if (!timeLeft) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold">
        <FontAwesomeIcon icon={faFlagCheckered} aria-hidden="true" />
        {t('countdown.ended')}
      </p>
    );
  }

  const srText = t('countdown.ends_at', { date: endLabel });

  if (variant === 'compact') {
    return (
      <span>
        <span aria-hidden="true" className="font-semibold tabular-nums">
          {t('countdown.compact', {
            days: timeLeft.days,
            hours: pad(timeLeft.hours),
            minutes: pad(timeLeft.minutes),
          })}
        </span>
        <span className="sr-only">{srText}</span>
      </span>
    );
  }

  const blocks: Array<{ key: string; value: string; label: string }> = [
    { key: 'd', value: String(timeLeft.days), label: t('countdown.days') },
    { key: 'h', value: pad(timeLeft.hours), label: t('countdown.hours') },
    { key: 'm', value: pad(timeLeft.minutes), label: t('countdown.minutes') },
    { key: 's', value: pad(timeLeft.seconds), label: t('countdown.seconds') },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="sr-only">{srText}</p>
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {blocks.map((block) => (
          <div key={block.key} className="rounded-md bg-secondary px-1 py-2 text-center text-secondary-foreground">
            <span className="block font-display text-3xl font-extrabold tabular-nums">{block.value}</span>
            <span className="text-xs uppercase tracking-wide text-secondary-muted-foreground">{block.label}</span>
          </div>
        ))}
      </div>
      {timeLeft.totalMs < DAY_MS && <Alert variant="warning" title={t('countdown.last_hours')} />}
    </div>
  );
};

export default CountdownTimer;
