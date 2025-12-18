import React from "react";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-gray-300">توضیحات (اختیاری)</label>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="هر نکته‌ای که لازم است پرسنل بدونند..."
        className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 resize-none h-28 backdrop-blur-sm"
      />
    </div>
  );
};

export default NotesSection;