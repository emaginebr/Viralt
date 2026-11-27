import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { MessageToastEnum } from '../DTO/Enum/MessageToastEnum';

interface IMessageToastParam {
  dialog: MessageToastEnum;
  showMessage: boolean;
  messageText: string;
  onClose: () => void;
  onYes?: () => void;
  onNo?: () => void;
}

const ERROR_DURATION = 8000;
const CONFIRMATION_DURATION = 15000;

/**
 * Legacy API kept for the screens that still use it: it no longer renders anything itself.
 * When `showMessage` turns true it fires a sonner toast (the region is the app-wide `ui/Toaster`)
 * and calls `onClose` right away, so the caller's `showMessage` flag goes back to false.
 *
 * The Confirmation mode becomes a toast with "Sim"/"Não" actions. New screens should use
 * `useConfirm()` / `ConfirmModal` instead (docs/design/components.md §26).
 */
const MessageToast = ({ dialog, showMessage, messageText, onClose, onYes, onNo }: IMessageToastParam): null => {
  const { t } = useTranslation();

  // Keep the latest callbacks without re-firing the toast when the parent re-renders.
  const callbacks = useRef({ onClose, onYes, onNo });
  callbacks.current = { onClose, onYes, onNo };

  useEffect(() => {
    if (!showMessage) return;

    const text = messageText || '';

    switch (dialog) {
      case MessageToastEnum.Error:
        toast.error(t('messageToast.error'), { description: text, duration: ERROR_DURATION });
        break;
      case MessageToastEnum.Success:
        toast.success(t('messageToast.success'), { description: text });
        break;
      case MessageToastEnum.Information:
        toast.info(t('messageToast.information'), { description: text });
        break;
      case MessageToastEnum.Confirmation:
        toast(t('messageToast.confirmation'), {
          description: text,
          duration: CONFIRMATION_DURATION,
          action: {
            label: t('messageToast.yes'),
            onClick: () => callbacks.current.onYes?.(),
          },
          cancel: {
            label: t('messageToast.no'),
            onClick: () => callbacks.current.onNo?.(),
          },
        });
        break;
      default:
        toast(text);
    }

    callbacks.current.onClose();
    // Fires once per showMessage false -> true transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMessage]);

  return null;
};

export default MessageToast;
