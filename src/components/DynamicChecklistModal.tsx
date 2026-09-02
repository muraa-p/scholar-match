import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  CheckSquare, 
  Clock, 
  Tag, 
  Filter, 
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Scholarship, ChecklistItem } from '../types';
import { 
  getScholarshipChecklist, 
  saveScholarshipChecklist, 
  addChecklistItem, 
  deleteChecklistItem 
} from '../utils/db';

interface DynamicChecklistModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  isTracked: boolean;
  onTrack: (scholarship: Scholarship) => void;
  onOpenAiSummary: (scholarship: Scholarship) => void;
  onChecklistChanged?: () => void;
}

export const DynamicChecklistModal: React.FC<DynamicChecklistModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  isTracked,
  onTrack,
  onOpenAiSummary,
  onChecklistChanged,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistItem['category']>('custom');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (isOpen && scholarship) {
      setItems(getScholarshipChecklist(scholarship));
    }
  }, [isOpen, scholarship]);

  if (!isOpen || !scholarship) return null;

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  const handleToggle = (itemId: string) => {
    const updated = items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    saveScholarshipChecklist(scholarship.id, updated);
    if (onChecklistChanged) onChecklistChanged();
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const updated = addChecklistItem(scholarship.id, {
      title: newTitle.trim(),
      category: newCategory,
    });
    setItems(updated);
    setNewTitle('');
    if (onChecklistChanged) onChecklistChanged();
  };

  const handleDelete = (itemId: string) => {
    const updated = deleteChecklistItem(scholarship.id, itemId);
    setItems(updated);
    if (onChecklistChanged) onChecklistChanged();
  };

  const handleReset = () => {
    if (window.confirm('Reset this checklist back to the default official requirements?')) {
      const resetItems: ChecklistItem[] = (scholarship.defaultChecklist || []).map((item, idx) => ({
        id: `req-${scholarship.id}-${idx}`,
        title: item.title,
        category: item.category || 'document',
        completed: false,
      }));
      setItems(resetItems);
      saveScholarshipChecklist(scholarship.id, resetItems);
      if (onChecklistChanged) onChecklistChanged();
    }
  };

  const filteredItems = items.filter(item => {
    if (filterMode === 'pending') return !item.completed;
    if (filterMode === 'completed') return item.completed;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        id="dynamic-checklist-dialog"
        className="bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#24242E] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-stone-800 dark:text-[#D1D1D6]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-[#22222A] flex items-start justify-between bg-stone-50/70 dark:bg-[#0E0E12] gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-amber-500/15 dark:bg-[#C5A267]/20 text-amber-800 dark:text-[#E5C38F] border border-amber-500/30 dark:border-[#C5A267]/40">
                Application Checklist
              </span>
              <span className="text-xs text-stone-500 dark:text-[#8E8E93] flex items-center">
                <Calendar className="w-3 h-3 mr-1 text-stone-400 dark:text-[#71717A]" /> Deadline: {scholarship.deadline}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-stone-900 dark:text-[#F4F4F5] line-clamp-1">
              {scholarship.title}
            </h2>
            <p className="text-xs text-stone-500 dark:text-[#8E8E93]">
              {scholarship.provider} • {scholarship.hostCountry}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[#F4F4F5] hover:bg-stone-200 dark:hover:bg-[#181820] transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Visual Progress Card */}
        <div className="px-5 py-4 bg-stone-100/70 dark:bg-[#181822] border-b border-stone-200 dark:border-[#22222A]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-[#E4E4E7]">
                Submission Readiness
              </span>
              {isAllComplete && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                  Ready to Submit! 🎉
                </span>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-stone-900 dark:text-[#F4F4F5]">
              {completedCount} of {totalCount} Completed ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-200 dark:bg-[#262634] h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isAllComplete 
                  ? 'bg-emerald-500' 
                  : progressPercent > 50 
                    ? 'bg-amber-500 dark:bg-[#C5A267]' 
                    : 'bg-stone-900 dark:bg-[#A8864B]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Controls & Reset */}
        <div className="px-5 py-2.5 border-b border-stone-100 dark:border-[#1E1E28] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterMode === 'all'
                  ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B]'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterMode === 'pending'
                  ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B]'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
            >
              To-Do ({totalCount - completedCount})
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterMode === 'completed'
                  ? 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B]'
                  : 'text-stone-600 dark:text-[#8E8E93] hover:bg-stone-100 dark:hover:bg-[#181820]'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset to official default requirements"
            className="flex items-center space-x-1 text-stone-400 hover:text-stone-600 dark:hover:text-[#D1D1D6] transition text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Scrollable Checklist Items List */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400 dark:text-[#71717A]">
              {filterMode === 'completed' 
                ? 'No items marked as completed yet. Check off items as you prepare!' 
                : 'All tasks completed! Great work.'}
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className={`flex items-start justify-between p-3 rounded-xl border transition ${
                  item.completed
                    ? 'bg-stone-50/60 dark:bg-[#0E0E12] border-stone-200/60 dark:border-[#1E1E28] opacity-80'
                    : 'bg-white dark:bg-[#181820] border-stone-200 dark:border-[#282834] shadow-xs'
                }`}
              >
                <div 
                  onClick={() => handleToggle(item.id)}
                  className="flex items-start space-x-3 cursor-pointer flex-1"
                >
                  <button className="mt-0.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-400 dark:text-[#52525B]" />
                    )}
                  </button>
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${
                      item.completed 
                        ? 'line-through text-stone-400 dark:text-[#666672]' 
                        : 'text-stone-800 dark:text-[#E4E4E7]'
                    }`}>
                      {item.title}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-[#8E8E93] mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-[#121217] text-stone-500 dark:text-[#A1A1AA] border dark:border-[#262632]">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-stone-300 dark:text-[#52525B] hover:text-rose-500 dark:hover:text-rose-400 p-1 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Quick Add Custom Requirement / Task Form */}
          <form onSubmit={handleAddItem} className="pt-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Add custom task (e.g. Request transcript translation, Email Dr. Robert for reference)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-900 dark:text-[#F4F4F5] placeholder-stone-400 dark:placeholder-[#666672] focus:outline-hidden focus:ring-1 focus:ring-[#C5A267]"
            />

            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-[#2E2E3C] bg-stone-50 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] focus:outline-hidden"
            >
              <option value="custom">Custom</option>
              <option value="document">Document</option>
              <option value="essay">Essay / SOP</option>
              <option value="recommendation">Reference</option>
              <option value="test">Test</option>
              <option value="submission">Submission</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90 dark:hover:bg-[#D4B37F] transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-[#0E0E12] border-t border-stone-200 dark:border-[#22222A] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenAiSummary(scholarship);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-[#181820] text-stone-800 dark:text-[#D1D1D6] hover:bg-stone-300 dark:hover:bg-[#22222C] border border-stone-300/60 dark:border-[#282834] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-[#C5A267]" />
            <span>AI Summary</span>
          </button>

          <div className="flex items-center space-x-2">
            {scholarship.officialApplicationUrl && (
              <a
                href={scholarship.officialApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-[#8E8E93] dark:hover:text-[#F4F4F5] hover:bg-stone-200 dark:hover:bg-[#181820] border border-transparent dark:hover:border-[#2E2E38] transition"
                title="Open Official Portal"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={() => {
                onTrack(scholarship);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isTracked
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-900 dark:bg-[#C5A267] text-stone-50 dark:text-[#0A0A0B] hover:opacity-90'
              }`}
            >
              {isTracked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Tracker</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Tracker</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
