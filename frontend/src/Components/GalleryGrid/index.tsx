import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlay } from '@fortawesome/free-solid-svg-icons';
import type { SubmissionInfo } from '../../types/submission';
import { SubmissionFileType } from '../../types/submission';
import { Button } from '../ui';

interface GalleryGridProps {
  submissions: SubmissionInfo[];
  onVote: (submissionId: number) => void;
  votedIds: Set<number>;
}

/**
 * GalleryGrid component - Displays contest submissions in a responsive grid.
 * Shows image/video thumbnails, captions, vote counts, and vote buttons.
 */
const GalleryGrid = ({ submissions, onVote, votedIds }: GalleryGridProps) => {
  const { t } = useTranslation();

  if (submissions.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">{t('gallery.empty')}</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {submissions.map((submission) => {
        const hasVoted = votedIds.has(submission.submissionId);
        const isVideo = submission.fileType === SubmissionFileType.Video;
        const name = submission.caption || t('gallery.untitled');

        return (
          <li
            key={submission.submissionId}
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-surface-foreground shadow-sm"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-secondary">
              {isVideo ? (
                <>
                  <video
                    src={submission.fileUrl}
                    className="size-full object-cover"
                    muted
                    playsInline
                    aria-label={t('gallery.video_label', { name })}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 grid place-items-center text-5xl text-secondary-foreground opacity-80"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </span>
                </>
              ) : (
                <img src={submission.fileUrl} alt={name} className="size-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              {submission.caption && <p className="flex-1">{submission.caption}</p>}
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                  <FontAwesomeIcon icon={faHeart} className="text-danger" aria-hidden="true" />
                  {t('gallery.votes', { count: submission.voteCount })}
                </span>
                <Button
                  variant={hasVoted ? 'outline' : 'primary'}
                  size="sm"
                  disabled={hasVoted}
                  aria-pressed={hasVoted}
                  aria-label={hasVoted ? t('gallery.voted_aria', { name }) : t('gallery.vote_aria', { name })}
                  leftIcon={<FontAwesomeIcon icon={faHeart} aria-hidden="true" />}
                  onClick={() => onVote(submission.submissionId)}
                >
                  {hasVoted ? t('gallery.voted') : t('gallery.vote')}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GalleryGrid;
