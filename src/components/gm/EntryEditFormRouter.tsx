import { CodexEntry, SectionId } from '@/data/codex';
import CreatureEditForm from './CreatureEditForm';
import GenericEntryEditForm from './GenericEntryEditForm';

interface EntryEditFormRouterProps {
  entry: CodexEntry | null;
  section: SectionId | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (entry: CodexEntry) => void;
}

/** Выбирает нужную форму редактирования по секции записи: у существ — своя форма
 * со ставками боя, у остальных редактируемых разделов — общая форма. */
const EntryEditFormRouter = ({ entry, section, open, onOpenChange, onSaved }: EntryEditFormRouterProps) => {
  const activeSection = entry?.section ?? section;

  if (activeSection === 'creatures') {
    return <CreatureEditForm entry={entry} open={open} onOpenChange={onOpenChange} onSaved={onSaved} />;
  }

  return <GenericEntryEditForm entry={entry} section={section} open={open} onOpenChange={onOpenChange} onSaved={onSaved} />;
};

export default EntryEditFormRouter;
