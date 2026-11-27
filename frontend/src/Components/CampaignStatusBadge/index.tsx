import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleQuestion,
  faCirclePause,
  faCirclePlay,
  faFlagCheckered,
  faPen,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { Badge, type BadgeVariant } from '../ui/Badge';

interface StatusConfig {
  key: string;
  variant: BadgeVariant;
  icon: IconDefinition;
}

/** Fixed mapping, always text + icon + color (docs/design/components.md §15). */
const CAMPAIGN_STATUS: Record<number, StatusConfig> = {
  0: { key: 'draft', variant: 'neutral', icon: faPen },
  1: { key: 'active', variant: 'success', icon: faCirclePlay },
  2: { key: 'paused', variant: 'warning', icon: faCirclePause },
  3: { key: 'ended', variant: 'info', icon: faFlagCheckered },
};

const UNKNOWN_STATUS: StatusConfig = { key: 'unknown', variant: 'neutral', icon: faCircleQuestion };

export const CAMPAIGN_STATUS_VALUES = [0, 1, 2, 3];

export const campaignStatusKey = (status: number): string =>
  `campaignStatus.${(CAMPAIGN_STATUS[status] ?? UNKNOWN_STATUS).key}`;

/** Entry types 0..3 (Sorteio, Ranking, Concurso, Cupom). */
export const ENTRY_TYPE_VALUES = [0, 1, 2, 3];

const ENTRY_TYPE_KEYS: Record<number, string> = {
  0: 'draw',
  1: 'leaderboard',
  2: 'contest',
  3: 'coupon',
};

export const entryTypeKey = (entryType: number | null | undefined): string =>
  `entryType.${ENTRY_TYPE_KEYS[entryType ?? 0] ?? 'unknown'}`;

interface CampaignStatusBadgeProps {
  status: number;
  className?: string;
  /** Render nothing for an unknown status instead of the "unknown" badge (public pages). */
  hideUnknown?: boolean;
}

export const CampaignStatusBadge = ({ status, className, hideUnknown = false }: CampaignStatusBadgeProps) => {
  const { t } = useTranslation();
  const known = CAMPAIGN_STATUS[status];
  if (!known && hideUnknown) return null;
  const config = known ?? UNKNOWN_STATUS;
  return (
    <Badge variant={config.variant} icon={<FontAwesomeIcon icon={config.icon} />} className={className}>
      {t(campaignStatusKey(status))}
    </Badge>
  );
};
