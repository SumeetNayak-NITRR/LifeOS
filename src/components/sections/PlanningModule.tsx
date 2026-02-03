"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  X, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info
} from 'lucide-react';
import { planningStore, PlanningData, PlanningTask, TimeBlock, PlanningCategory } from '@/lib/store';
import { useFocusMode } from '@/hooks/useFocusMode';

type PlanningMode = 'today' | 'week' | 'horizon';

const CATEGORIES: PlanningCategory[] = [
  { id: 'work', name: 'Work', color: '#60a5fa' }, // Blue
  { id: 'personal', name: 'Personal', color: '#c084fc' }, // Purple
  { id: 'health', name: 'Health', color: '#34d399' }, // Emerald
  { id: 'focus', name: 'Deep Work', color: '#fb7185' }, // Rose
];

export default function PlanningModule() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<PlanningMode>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<PlanningData>({
    tasks: [],
    categories: [],
    horizonIntents: [],
    monthlyFocus: '',
    brainDump: ''
  });
  
  const [editingTask, setEditingTask] = useState<PlanningTask | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { isVisualsDisabled } = useFocusMode();

  useEffect(() => {
    setMounted(true);
    const storeData = planningStore.get();
    setData(storeData);
  }, []);

  const saveData = useCallback((updates: Partial<PlanningData>) => {
    const current = planningStore.get();
    const updated = { ...current, ...updates };
    setData(updated);
    planningStore.save(updated);
  }, [data.tasks]);

  const addTask = (text: string, date?: string, block?: TimeBlock) => {
    const newTask: PlanningTask = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      completed: false,
      date: date || selectedDate,
      block: block,
    };

    saveData({ tasks: [newTask, ...data.tasks] });
  };

  const updateTask = (id: string, updates: Partial<PlanningTask>) => {
    const updatedTasks = data.tasks.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveData({ tasks: updatedTasks });
  };

  const toggleTask = (id: string) => {
    const updatedTasks = data.tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveData({ tasks: updatedTasks });
  };

  const deleteTask = (id: string) => {
    const updatedTasks = data.tasks.filter(t => t.id !== id);
    saveData({ tasks: updatedTasks });
  };

  const handleEditTask = (task: PlanningTask) => {
    setEditingTask(task);
    setIsPanelOpen(true);
  };

  if (!mounted) return null;

  return (
    <section id="planning" className="relative py-24 md:py-32 overflow-hidden bg-[#050505]">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="w-1 h-1 rounded-full bg-blue-400/40" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Planning
                </span>
              </motion.div>
              <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight">
                Clear <span className="text-white/20 italic">Thinking.</span>
              </h2>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-white/[0.03] border border-white/5 rounded-xl p-1 self-start">
              {(['today', 'week', 'horizon'] as PlanningMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all relative ${
                    mode === m 
                      ? 'text-white' 
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {mode === m && (
                    <motion.div 
                      layoutId="mode-pill-planning"
                      className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" 
                    />
                  )}
                  <span className="relative z-10 capitalize">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {mode === 'today' && (
                <TodayView 
                  key="today" 
                  selectedDate={selectedDate}
                  tasks={data.tasks} 
                  onToggle={toggleTask} 
                  onEdit={handleEditTask}
                  onAdd={addTask}
                />
              )}
              {mode === 'week' && (
                <WeekView 
                  key="week" 
                  tasks={data.tasks} 
                  onToggle={toggleTask} 
                  onEdit={handleEditTask}
                  onAdd={addTask}
                  onUpdate={updateTask}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setMode('today');
                  }}
                />
              )}
              {mode === 'horizon' && (
                <HorizonView 
                  key="horizon" 
                  tasks={data.tasks} 
                  onToggle={toggleTask} 
                  onEdit={handleEditTask}
                  onAdd={addTask}
                  onDelete={deleteTask}
                  onBringToToday={(id) => updateTask(id, { date: new Date().toISOString().split('T')[0] })}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Advanced Edit Panel */}
      <AdvancedEditPanel 
        isOpen={isPanelOpen} 
        task={editingTask} 
        onClose={() => {
          setIsPanelOpen(false);
          setEditingTask(null);
        }}
        onSave={(updates) => {
          if (editingTask) updateTask(editingTask.id, updates);
          setIsPanelOpen(false);
          setEditingTask(null);
        }}
        onDelete={() => {
          if (editingTask) deleteTask(editingTask.id);
          setIsPanelOpen(false);
          setEditingTask(null);
        }}
      />
    </section>
  );
}

// --- Sub-components ---

function TodayView({ selectedDate, tasks, onToggle, onEdit, onAdd }: { 
  selectedDate: string,
  tasks: PlanningTask[], 
  onToggle: (id: string) => void, 
  onEdit: (task: PlanningTask) => void,
  onAdd: (text: string, date?: string, block?: TimeBlock) => void
}) {
  const currentTasks = tasks.filter(t => t.date === selectedDate);
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const blocks: { id: TimeBlock | 'flexible'; label: string; icon: React.ReactNode }[] = [
    { id: 'morning', label: 'Morning', icon: <Sunrise size={14} /> },
    { id: 'afternoon', label: 'Afternoon', icon: <Sun size={14} /> },
    { id: 'evening', label: 'Evening', icon: <Sunset size={14} /> },
    { id: 'flexible', label: 'Flexible', icon: <Circle size={14} className="opacity-20" /> },
  ];

  const hasTasks = currentTasks.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-3xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <h3 className="font-display text-2xl text-white">
          {isToday ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
      </div>

      <div className="space-y-12">
        {blocks.map(block => {
          const blockTasks = currentTasks.filter(t => 
            block.id === 'flexible' ? !t.block : t.block === block.id
          );
          
          if (blockTasks.length === 0 && block.id !== 'flexible') return null;

          return (
            <div key={block.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                <span className="text-white/20">{block.icon}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{block.label}</span>
              </div>
              <div className="space-y-1">
                {blockTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onEdit={onEdit} 
                  />
                ))}
                <InlineTaskInput 
                  placeholder={`Add to ${block.label}...`}
                  onAdd={(text) => onAdd(text, selectedDate, block.id === 'flexible' ? undefined : block.id)} 
                />
              </div>
            </div>
          );
        })}

        {!hasTasks && (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest mb-1">Nothing planned yet. That’s okay.</p>
            <p className="text-white/10 text-[10px] italic">Planning starts simple.</p>
            <div className="mt-6 flex justify-center">
              <div className="w-full max-w-sm">
                <InlineTaskInput 
                  placeholder="Start by adding your first intention..."
                  onAdd={(text) => onAdd(text, selectedDate)} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function WeekView({ tasks, onToggle, onEdit, onAdd, onUpdate, onSelectDate }: { 
  tasks: PlanningTask[], 
  onToggle: (id: string) => void, 
  onEdit: (task: PlanningTask) => void,
  onAdd: (text: string, date?: string, block?: TimeBlock) => void,
  onUpdate: (id: string, updates: Partial<PlanningTask>) => void,
  onSelectDate: (date: string) => void
}) {
  const days = [0, 1, 2, 3, 4, 5, 6].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start"
    >
      {days.map((date) => (
        <DayColumn 
          key={date.toISOString()}
          date={date}
          tasks={tasks.filter(t => t.date === date.toISOString().split('T')[0])}
          onToggle={onToggle}
          onEdit={onEdit}
          onAdd={onAdd}
          onFocus={() => onSelectDate(date.toISOString().split('T')[0])}
        />
      ))}
    </motion.div>
  );
}

function DayColumn({ date, tasks, onToggle, onEdit, onAdd, onFocus }: {
  date: Date,
  tasks: PlanningTask[],
  onToggle: (id: string) => void,
  onEdit: (task: PlanningTask) => void,
  onAdd: (text: string, date?: string, block?: TimeBlock) => void,
  onFocus: () => void
}) {
  const [isAdding, setIsAdding] = useState(false);
  const dateStr = date.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();

  const isExpanded = tasks.length > 0 || isAdding;

  return (
    <div 
      className={`bg-[#0a0a0a] border ${isToday ? 'border-blue-500/20' : 'border-white/5'} rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'min-h-[140px]' : 'h-[80px]'}`}
    >
      <div 
        className="p-4 flex items-center justify-between group cursor-pointer"
        onClick={onFocus}
      >
        <div className="flex flex-col">
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isToday ? 'text-blue-400' : 'text-white/20'}`}>
            {dayName}
          </span>
          <span className={`text-xl font-display ${isToday ? 'text-white' : 'text-white/40'}`}>
            {dayNum}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               setIsAdding(!isAdding);
             }}
             className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"
           >
             <Plus size={14} />
           </button>
           {tasks.length > 0 && (
             <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-white/30">
               {tasks.length}
             </div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-3 space-y-1 overflow-hidden"
          >
            <div className="space-y-1">
              {tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={onToggle} 
                  onEdit={onEdit}
                  isCompact
                />
              ))}
            </div>
            {(isAdding || tasks.length > 0) && (
              <InlineTaskInput 
                onAdd={(text) => {
                  onAdd(text, dateStr);
                  // Optional: Keep adding open or close? Let's keep it open for flow
                }} 
                placeholder="Add task..."
                isCompact
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HorizonView({ tasks, onToggle, onEdit, onAdd, onDelete, onBringToToday }: { 
  tasks: PlanningTask[], 
  onToggle: (id: string) => void, 
  onEdit: (task: PlanningTask) => void,
  onAdd: (text: string) => void,
  onDelete: (id: string) => void,
  onBringToToday: (id: string) => void
}) {
  const horizonTasks = tasks.filter(t => !t.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-3xl"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-white">Long-term Intentions</h3>
          <p className="text-white/30 text-sm font-light leading-relaxed">
            This space is for intentions without urgency. Vague goals, long-term dreams, or simple "someday" items.
          </p>
        </div>

        <div className="space-y-1">
          {horizonTasks.map(task => (
            <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
              <span className="text-white/60 text-sm font-light">{task.text}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onBringToToday(task.id)}
                  className="p-2 text-white/20 hover:text-blue-400 transition-colors"
                  title="Move to Today"
                >
                  <ArrowRight size={14} />
                </button>
                <button 
                  onClick={() => onEdit(task)}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-4">
            <InlineTaskInput 
              onAdd={onAdd} 
              placeholder="What's on the horizon?" 
            />
          </div>

          {horizonTasks.length === 0 && (
            <div className="py-12 text-center text-white/10 italic text-sm font-light">
              No long-term intentions yet. Click above to add one.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TaskItem({ task, onToggle, onEdit, isCompact = false }: { 
  task: PlanningTask, 
  onToggle: (id: string) => void, 
  onEdit: (task: PlanningTask) => void,
  isCompact?: boolean
}) {
  const category = CATEGORIES.find(c => c.id === task.category);

  return (
    <div 
      className={`group flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all cursor-pointer ${isCompact ? 'p-2' : 'p-3'}`}
      onClick={() => onEdit(task)}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className="shrink-0 transition-transform active:scale-90"
      >
        {task.completed ? (
          <CheckCircle2 size={isCompact ? 14 : 18} className="text-emerald-500/40" />
        ) : (
          <Circle size={isCompact ? 14 : 18} className="text-white/10 group-hover:text-white/30" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2">
          {category && (
            <div 
              className="w-1 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: `${category.color}40`, border: `1px solid ${category.color}20` }}
            />
          )}
          <span className={`text-sm truncate transition-all duration-300 ${isCompact ? 'text-[12px]' : 'text-sm'} ${task.completed ? 'text-white/10 line-through' : 'text-white/70'}`}>
            {task.text}
          </span>
        </div>
        
        {!isCompact && (task.block || task.reminder) && (
          <div className="flex items-center gap-3 mt-1 ml-3">
             {task.block && (
               <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-1">
                 {task.block === 'morning' && <Sunrise size={10} />}
                 {task.block === 'afternoon' && <Sun size={10} />}
                 {task.block === 'evening' && <Sunset size={10} />}
                 {task.block}
               </span>
             )}
             {task.reminder && (
               <span className="text-[9px] font-mono text-white/20 flex items-center gap-1">
                 <Clock size={10} /> {task.reminder}
               </span>
             )}
          </div>
        )}
      </div>

      <button className="opacity-0 group-hover:opacity-100 p-1 text-white/10 hover:text-white transition-all">
        <MoreVertical size={14} />
      </button>
    </div>
  );
}

function InlineTaskInput({ onAdd, placeholder = "Add task...", isCompact = false }: { 
  onAdd: (text: string) => void, 
  placeholder?: string,
  isCompact?: boolean
}) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
      // Keep focus for continuous adding
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 transition-all ${isFocused ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
    >
      <div className="relative flex-1">
        <Plus size={isCompact ? 14 : 16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input 
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (!text) setIsFocused(false);
          }}
          placeholder={placeholder}
          className={`w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all text-white placeholder:text-white/10 ${isCompact ? 'py-1.5 text-[12px]' : 'py-2.5 text-sm'}`}
        />
      </div>
      {text.trim() && (
        <button 
          type="submit"
          className="p-2 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white transition-all"
        >
          <ArrowRight size={14} />
        </button>
      )}
    </form>
  );
}

function AdvancedEditPanel({ isOpen, task, onClose, onSave, onDelete }: {
  isOpen: boolean,
  task: PlanningTask | null,
  onClose: () => void,
  onSave: (updates: Partial<PlanningTask>) => void,
  onDelete: () => void
}) {
  const [editedText, setEditedText] = useState('');
  const [editedNote, setEditedNote] = useState('');
  const [editedBlock, setEditedBlock] = useState<TimeBlock | undefined>(undefined);
  const [editedCategory, setEditedCategory] = useState<string | undefined>(undefined);
  const [editedDate, setEditedDate] = useState<string | undefined>(undefined);
  const [editedReminder, setEditedReminder] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (task) {
      setEditedText(task.text);
      setEditedNote(task.note || '');
      setEditedBlock(task.block);
      setEditedCategory(task.category);
      setEditedDate(task.date);
      setEditedReminder(task.reminder);
    }
  }, [task]);

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-display text-2xl text-white">Advanced Edit</h3>
              <button onClick={onClose} className="p-2 text-white/20 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar">
              {/* Text */}
              <div className="space-y-3">
                <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Description</label>
                <textarea 
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 resize-none h-24"
                />
              </div>

              {/* Note */}
              <div className="space-y-3">
                <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Notes</label>
                <textarea 
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  placeholder="Add details, links, or context..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-white/60 focus:outline-none focus:border-white/20 resize-none h-32 text-sm"
                />
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Date</label>
                  <input 
                    type="date"
                    value={editedDate || ''}
                    onChange={(e) => setEditedDate(e.target.value || undefined)}
                    className="w-full bg-[#0f0f0f] border border-white/5 rounded-xl px-4 py-3 text-[12px] text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Time Block</label>
                  <select 
                    value={editedBlock || ''}
                    onChange={(e) => setEditedBlock((e.target.value || undefined) as TimeBlock)}
                    className="w-full bg-[#0f0f0f] border border-white/5 rounded-xl px-4 py-3 text-[12px] text-white focus:outline-none appearance-none"
                  >
                    <option value="">Flexible</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>

              {/* Reminder & Category */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Reminder</label>
                  <div className="relative">
                    <Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="time"
                      value={editedReminder || ''}
                      onChange={(e) => setEditedReminder(e.target.value || undefined)}
                      className="w-full bg-[#0f0f0f] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[12px] text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Category</label>
                  <select 
                    value={editedCategory || ''}
                    onChange={(e) => setEditedCategory(e.target.value || undefined)}
                    className="w-full bg-[#0f0f0f] border border-white/5 rounded-xl px-4 py-3 text-[12px] text-white focus:outline-none appearance-none"
                  >
                    <option value="">None</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Visual Picker (Muted Tones) */}
              <div className="space-y-4 pt-4">
                 <div className="flex flex-wrap gap-2">
                   {CATEGORIES.map(cat => (
                     <button
                       key={cat.id}
                       onClick={() => setEditedCategory(editedCategory === cat.id ? undefined : cat.id)}
                       className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] border transition-all"
                       style={{ 
                         borderColor: editedCategory === cat.id ? `${cat.color}40` : 'transparent',
                         backgroundColor: editedCategory === cat.id ? `${cat.color}10` : 'rgba(255,255,255,0.02)',
                         color: editedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.2)'
                       }}
                     >
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                       {cat.name}
                     </button>
                   ))}
                 </div>
              </div>
            </div>

            <div className="pt-8 mt-auto flex gap-4">
              <button 
                onClick={onDelete}
                className="flex-1 bg-red-500/5 text-red-400 border border-red-500/10 py-4 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/10 transition-all"
              >
                Delete
              </button>
              <button 
                onClick={() => onSave({
                  text: editedText,
                  note: editedNote,
                  block: editedBlock,
                  category: editedCategory,
                  date: editedDate,
                  reminder: editedReminder
                })}
                className="flex-[2] bg-white text-black py-4 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
