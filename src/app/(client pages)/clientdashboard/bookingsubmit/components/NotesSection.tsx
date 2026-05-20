import React from "react";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-slate-600 dark:text-gray-300">توضیحات (اختیاری)</label>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="هر نکته‌ای که لازمه مشتری بدونه..."
        className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm placeholder:text-slate-400 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 resize-none h-28 backdrop-blur-sm text-slate-800 dark:text-white"
      />
    </div>
  );
};

export default NotesSection;