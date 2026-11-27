import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

interface CustomToolbarProps {
  onSave?: () => void;
}

/**
 * Quill toolbar (react-quill `modules.toolbar.container = "#custom-toolbar"`).
 * The `ql-*` classes are required by Quill; the labels make the icon-only buttons accessible
 * (docs/design/components.md §25.1). Visual tokens for `.ql-*` live with the RichTextEditor CSS.
 */
export const CustomToolbar = ({ onSave }: CustomToolbarProps = {}) => {
  const { t } = useTranslation();

  return (
    <div
      id="custom-toolbar"
      role="toolbar"
      aria-label={t('editorToolbar.label')}
      className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-muted p-1"
    >
      <select className="ql-header" defaultValue="" aria-label={t('editorToolbar.heading')}>
        <option value="1" />
        <option value="2" />
        <option value="" />
      </select>
      <select className="ql-size" defaultValue="" aria-label={t('editorToolbar.size')}>
        <option value="small" />
        <option value="normal" />
        <option value="large" />
        <option value="huge" />
      </select>
      <button type="button" className="ql-bold" aria-label={t('editorToolbar.bold')} />
      <button type="button" className="ql-italic" aria-label={t('editorToolbar.italic')} />
      <button type="button" className="ql-underline" aria-label={t('editorToolbar.underline')} />
      <button type="button" className="ql-link" aria-label={t('editorToolbar.link')} />
      <button type="button" className="ql-clean" aria-label={t('editorToolbar.clean')} />

      {/* Botão de salvar fora da API do Quill, então chamamos direto */}
      {onSave && (
        <button
          type="button"
          className="ql-save"
          aria-label={t('editorToolbar.save')}
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
