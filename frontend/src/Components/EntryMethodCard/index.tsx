import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faLock, faStar, faUserPlus, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faInstagram,
  faTiktok,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { Badge, Button, cn } from '../ui';
import type { EntryMethodData } from '../../types/campaignEntry';

export type { EntryMethodData } from '../../types/campaignEntry';

interface EntryMethodCardProps {
  entry: EntryMethodData;
  onComplete: (entryMethodId: number) => void;
  completed: boolean;
  /** Participant not registered yet: the action is shown but cannot be done. */
  locked?: boolean;
  /** The completion request is running. */
  loading?: boolean;
}

const ICONS: Array<{ match: RegExp; icon: IconDefinition }> = [
  { match: /instagram/i, icon: faInstagram },
  { match: /facebook/i, icon: faFacebook },
  { match: /youtube/i, icon: faYoutube },
  { match: /tiktok/i, icon: faTiktok },
  { match: /whatsapp/i, icon: faWhatsapp },
  { match: /twitter|x-twitter|\bx\b/i, icon: faXTwitter },
  { match: /refer|friend|user-plus|indica/i, icon: faUserPlus },
];

/** Picks a brand icon from the entry's icon name or title; falls back to a star. */
const resolveIcon = (entry: EntryMethodData): IconDefinition => {
  const source = `${entry.icon ?? ''} ${entry.title}`;
  return ICONS.find((item) => item.match.test(source))?.icon ?? faStar;
};

/** Entry action row (docs/design/components.md §18.3): pending, done or locked. */
const EntryMethodCard = ({ entry, onComplete, completed, locked = false, loading = false }: EntryMethodCardProps) => {
  const { t } = useTranslation();
  const pointsLabel = t('entryMethod.points', { count: entry.points });

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:p-4',
        completed ? 'bg-success-subtle' : 'bg-surface',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('grid size-11 shrink-0 place-items-center rounded-md text-xl', completed ? 'bg-surface' : 'bg-muted')}
      >
        <FontAwesomeIcon icon={resolveIcon(entry)} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{entry.title}</p>
        {entry.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}
      </div>
      <Badge variant="points">{pointsLabel}</Badge>

      {completed ? (
        <span className="col-span-3 inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-success sm:col-span-1">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
          {t('entryMethod.done')}
        </span>
      ) : locked ? (
        <span
          aria-disabled="true"
          className="col-span-3 inline-flex items-center justify-center gap-2 border-t border-border pt-2 text-sm font-semibold text-muted-foreground sm:col-span-1 sm:min-h-11 sm:border-0 sm:pt-0"
        >
          <FontAwesomeIcon icon={faLock} aria-hidden="true" />
          {t('entryMethod.locked')}
        </span>
      ) : (
        <Button
          variant="accent"
          size="sm"
          loading={loading}
          className="col-span-3 w-full sm:col-span-1 sm:w-auto"
          aria-label={t('entryMethod.complete_aria', { title: entry.title, count: entry.points })}
          onClick={() => onComplete(entry.entryMethodId)}
        >
          {t('entryMethod.complete')}
        </Button>
      )}
    </div>
  );
};

export default EntryMethodCard;
