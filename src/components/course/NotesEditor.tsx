import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Save, Trash2 } from 'lucide-react';

interface NotesEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onClear: () => void;
}

const NotesEditor = ({ initialValue, onSave, onClear }: NotesEditorProps) => {
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Sync if initialValue changes (e.g. module change)
  useEffect(() => {
    setValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    setIsDirty(true);
    // Auto-save to localStorage via debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(val);
    }, 800);
  };

  const handleSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSave(value);
    setIsDirty(false);
  };

  const handleClear = () => {
    setValue('');
    setIsDirty(false);
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-violet-400" />
        <h3 className="font-consciousness text-base font-bold text-white">Personal Notes</h3>
        {isDirty && (
          <span className="font-body text-[10px] uppercase tracking-widest text-white/30 ml-auto">Unsaved changes</span>
        )}
      </div>
      <Textarea
        placeholder="Add your notes about this module... These are private to you."
        value={value}
        onChange={handleChange}
        className="min-h-[240px] font-body text-sm text-white/80 bg-white/3 border border-white/10 focus:border-violet-500/50 resize-none leading-relaxed placeholder:text-white/20 rounded-xl"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          Save Notes
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="font-body border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-xl px-4 py-2 text-sm flex items-center gap-2 bg-transparent"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default NotesEditor;
