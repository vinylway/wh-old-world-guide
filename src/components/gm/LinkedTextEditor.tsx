import { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CodexEntry, StatLink } from '@/data/codex';
import EntryLinkPicker from './EntryLinkPicker';

interface LinkedTextEditorProps {
  value: string;
  links?: StatLink[];
  onChange: (value: string, links: StatLink[]) => void;
  entries: CodexEntry[];
  rows?: number;
  placeholder?: string;
}

const LinkedTextEditor = ({ value, links, onChange, entries, rows = 3, placeholder }: LinkedTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const currentLinks = links ?? [];

  const handleInsertLink = (entry: CodexEntry) => {
    const textarea = textareaRef.current;
    const selStart = textarea?.selectionStart ?? value.length;
    const selEnd = textarea?.selectionEnd ?? value.length;
    const hasSelection = textarea && selEnd > selStart;

    if (hasSelection) {
      const matchText = value.slice(selStart, selEnd);
      const nextLinks = [
        ...currentLinks.filter((l) => l.match !== matchText),
        { match: matchText, entryId: entry.id },
      ];
      onChange(value, nextLinks);
    } else {
      const insertText = entry.title;
      const nextValue = value.slice(0, selStart) + insertText + value.slice(selStart);
      const nextLinks = [
        ...currentLinks.filter((l) => l.match !== insertText),
        { match: insertText, entryId: entry.id },
      ];
      onChange(nextValue, nextLinks);
    }
  };

  return (
    <div className="space-y-1.5">
      <Textarea
        ref={textareaRef}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value, currentLinks)}
      />
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Icon name="Link2" size={13} className="mr-1.5" />
          Вставить ссылку на карточку
        </Button>
        {currentLinks.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {currentLinks.map((l) => (
              <span
                key={l.match}
                className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2 py-0.5 text-[11px] text-gold/80"
              >
                {l.match}
                <button
                  type="button"
                  onClick={() => onChange(value, currentLinks.filter((cl) => cl.match !== l.match))}
                  className="text-gold/60 hover:text-destructive"
                >
                  <Icon name="X" size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <EntryLinkPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        entries={entries}
        onSelect={handleInsertLink}
        title="Выделите текст в поле или найдите карточку"
      />
    </div>
  );
};

export default LinkedTextEditor;
