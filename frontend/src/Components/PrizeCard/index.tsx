import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { PrizeInfo } from '../../types/prize';

interface PrizeCardProps {
  prize: PrizeInfo;
  /** 1-based position in the prize list ("1º prêmio"). */
  position?: number;
}

/** The notch sits on the perforation, right below the fixed-height image (h-36 = 9rem). */
const ticketStyle = { '--ticket-at': '9rem' } as CSSProperties;

/** Prize "ticket" (docs/design/components.md §18.2). */
const PrizeCard = ({ prize, position }: PrizeCardProps) => {
  const { t } = useTranslation();

  return (
    <article
      className="ticket flex h-full flex-col rounded-lg border-2 border-foreground bg-surface shadow-pop"
      style={ticketStyle}
    >
      {prize.image ? (
        <img src={prize.image} alt={prize.title} className="h-36 w-full rounded-t-md object-cover" />
      ) : (
        <div aria-hidden="true" className="grid h-36 w-full place-items-center rounded-t-md bg-accent-subtle text-4xl">
          <FontAwesomeIcon icon={faTrophy} />
        </div>
      )}
      <div className="perforation" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        {position !== undefined && (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t('prize.position', { position })}
          </p>
        )}
        <h3 className="font-sans text-base font-bold">{prize.title}</h3>
        {prize.description && <p className="text-sm text-muted-foreground">{prize.description}</p>}
        <p className="mt-auto pt-2 text-sm text-muted-foreground">{t('prize.quantity', { count: prize.quantity })}</p>
        {prize.minEntriesRequired != null && prize.minEntriesRequired > 0 && (
          <p className="text-sm text-muted-foreground">{t('prize.min_entries', { count: prize.minEntriesRequired })}</p>
        )}
      </div>
    </article>
  );
};

export default PrizeCard;
