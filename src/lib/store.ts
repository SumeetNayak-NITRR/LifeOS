"use client";

import { getUserStoragePrefix, getSession } from './auth';
import { supabase } from './supabase';

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
let currentSyncStatus: SyncStatus = 'synced';
const syncListeners: Set<(status: SyncStatus) => void> = new Set();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribeToSyncStatus(listener: (status: SyncStatus) => void): () => void {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => syncListeners.delete(listener);
}

export function notifyListeners() {
  listeners.forEach(listener => listener());
}

function notifySyncStatus(status: SyncStatus) {
  currentSyncStatus = status;
  syncListeners.forEach(listener => listener(status));
}

function getUserKey(baseKey: string): string {
  const prefix = getUserStoragePrefix();
  return prefix + baseKey;
}

export type WorkoutType = 'Strength' | 'Cardio' | 'Mobility' | 'Football' | 'Rest';

export type SessionStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: string; // e.g., "8-10" or "AMRAP"
  time?: string; // e.g., "30 sec" or "5 min"
  notes?: string;
  isWarmup?: boolean;
}

export interface DayWorkoutPlan {
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  type: WorkoutType;
  name?: string;
  exercises: Exercise[];
}

export interface WeeklyWorkoutPlan {
  weekStartDate: string; // ISO date of Sunday that starts the week
  days: DayWorkoutPlan[];
  lockedAt: string | null; // ISO timestamp when plan was locked
  planningDay: number; // 0 = Sunday (default)
}

export interface DaySession {
  date: string; // YYYY-MM-DD
  plannedType: WorkoutType;
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
  completedExercises: string[]; // array of exercise IDs
}

export interface HydrationEntry {
  id: string;
  timestamp: string; // ISO
  amount: number; // in ml
}

export interface HydrationData {
  entries: Record<string, HydrationEntry[]>; // keyed by date YYYY-MM-DD
}

export interface FitnessData {
  selectedSession: string | null;
  streak: number;
  weekProgress: boolean[];
  recentActivity: { day: string; type: string; timestamp: number }[];
  history: { date: string; session: string | null }[];
  completedSessions: Record<string, string>; // YYYY-MM-DD -> session type
  weeklyPlan?: WeeklyWorkoutPlan;
  daySessions?: Record<string, DaySession>; // keyed by date YYYY-MM-DD
  hydration?: HydrationData;
  footballEnabled?: boolean;
  _lastUpdated?: number;
}

export interface WorkData {
  tasks: { 
    id: string; 
    text: string; 
    status: 'pending' | 'done' | 'missed'; 
    timeEstimate?: string; 
    isOngoing?: boolean;
    note?: string;
    date: string;
    carryOverCount: number;
    isImportant: boolean;
  }[];
  taskHistory: {
    id: string;
    text: string;
    status: 'done' | 'missed';
    date: string;
  }[];
  focusTime: number;
  focusSessions: number;
  timerState: {
    timeLeft: number;
    isActive: boolean;
    isPaused: boolean;
    lastUpdated: number;
  };
  _lastUpdated?: number;
}

export interface RoutineData {
  routines: {
    id: string;
    title: string;
    items: { id: string; label: string; done: boolean }[];
  }[];
  habits: { id: string; label: string; done: boolean }[];
  habitHistory: { date: string; habitId: string; done: boolean }[];
  _lastUpdated?: number;
}

export type TimeBlock = 'morning' | 'afternoon' | 'evening';

  export interface PlanningTask {
    id: string;
    text: string;
    completed: boolean;
    date?: string; // YYYY-MM-DD
    block?: TimeBlock;
    category?: string;
    reminder?: string;
    note?: string;
  }

export interface HorizonIntent {
  id: string;
  text: string;
}

export interface PlanningCategory {
  id: string;
  name: string;
  color: string;
}

export interface PlanningData {
  tasks: PlanningTask[];
  categories: PlanningCategory[];
  horizonIntents: HorizonIntent[];
  monthlyFocus: string;
  brainDump: string;
  _lastUpdated?: number;
}

export interface ReminderData {
  shownToday: string[]; // IDs like 'task', 'fitness', etc.
  lastResetDate: string;
  _lastUpdated?: number;
}

export interface SettingsData {
  dailyResetEnabled: boolean;
  lastResetDate: string; // ISO date string (YYYY-MM-DD)
  promptDismissed: boolean;
  visualsEnabled: boolean;
  visualsOnlyOutsideFocus: boolean;
  dailySignal: 'calm' | 'standard';
  notificationTone: 'silent' | 'gentle';
  focusBehavior: 'manual' | 'auto';
  aiFrequency: 'occasional' | 'weekly';
  retentionPolicy?: 'all' | '1year' | '90days' | '30days';
  systemReviewDate?: string; // ISO date
  aiSkillInsights: boolean;
  practiceSuggestionsManual: boolean;
  skillVisibility: 'Personal' | 'Community-ready';
  modules: {
        fitness: boolean;
        finance: boolean;
        flow: boolean;
        football: boolean;
        community: boolean;
        neuralTimeline: boolean;
      };

  _lastUpdated?: number;
}

export type FixedExpenseCategory = 
  | 'Room Rent' | 'Hostel / Mess Fees' 
  | 'Electricity' | 'Water' | 'Wi-Fi / Internet' | 'Mobile Recharge' 
  | 'Other recurring bills';

export type VariableExpenseCategory = 
  | 'Food' | 'Travel' | 'Fitness' | 'Study' | 'Lifestyle' | 'Misc';

export interface FinanceExpense {
  id: string;
  amount: number;
  category: VariableExpenseCategory;
  paymentType: 'Cash' | 'UPI' | 'Card';
  note?: string;
  date: string;
  shared?: boolean;
  sharedId?: string;
}

export interface SharedExpense {
  id: string;
  title: string;
  totalAmount: number;
  splitMethod: 'equal' | 'manual';
  splits: { name: string; amount: number; settled: boolean }[];
  date: string;
  settled: boolean;
  category: VariableExpenseCategory;
  paymentType: 'Cash' | 'UPI' | 'Card';
}

export interface FixedExpense {
  id: string;
  amount: number;
  category: FixedExpenseCategory;
  note?: string;
  date: string;
}

export interface FinanceBudget {
  monthlyBudget: number | null;
  categoryLimits: { [key: string]: number | null };
}

export interface FinanceSummary {
  monthlyIncome: number | null;
}

export interface MonthlyFinanceData {
  expenses: FinanceExpense[];
  fixedExpenses: FixedExpense[];
  sharedExpenses: SharedExpense[];
  budget: FinanceBudget;
  summary: FinanceSummary;
  notes: string;
  aiReview?: string;
  crossTabInsight?: string;
  archived: boolean;
}

export interface FinanceData {
  months: Record<string, MonthlyFinanceData>;
  _lastUpdated?: number;
}

const STORAGE_KEYS = {
  fitness: 'lifeos_fitness',
  work: 'lifeos_work',
  routine: 'lifeos_routine',
  planning: 'lifeos_planning',
  settings: 'lifeos_settings',
  reminders: 'lifeos_reminders',
  finance: 'lifeos_finance',
  sleep: 'lifeos_sleep',
  ai: 'lifeos_ai',
} as const;

export interface SleepDay {
  date: string; // YYYY-MM-DD (the wake-up date)
  sleepAt: string | null; // ISO string
  wakeAt: string | null; // ISO string
  isSleepEstimated: boolean;
  isWakeEstimated: boolean;
}

export interface SleepData {
  days: Record<string, SleepDay>;
  _lastUpdated?: number;
}

// SYNC LOGIC
let syncTimeout: NodeJS.Timeout | null = null;
const PENDING_SYNC_KEY = 'lifeos_pending_sync';

function getPendingSync(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem(PENDING_SYNC_KEY);
  return new Set(stored ? JSON.parse(stored) : []);
}

function addToPendingSync(key: string) {
  const pending = getPendingSync();
  pending.add(key);
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(Array.from(pending)));
}

function clearPendingSync(key: string) {
  const pending = getPendingSync();
  pending.delete(key);
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(Array.from(pending)));
}

async function pushToCloud(key: string, data: any) {
  const session = getSession();
  if (!session || session.isGuest) return;

  if (!navigator.onLine) {
    notifySyncStatus('offline');
    addToPendingSync(key);
    return;
  }

  notifySyncStatus('syncing');
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: session.userId,
        key: key,
        data: data,
        last_updated: new Date().toISOString()
      });

    if (error) throw error;
    clearPendingSync(key);
    notifySyncStatus('synced');
  } catch (err) {
    console.error('Push to cloud failed:', err);
    notifySyncStatus('error');
    addToPendingSync(key);
  }
}

export async function pullFromCloud() {
  const session = getSession();
  if (!session || session.isGuest) return;

  if (!navigator.onLine) {
    notifySyncStatus('offline');
    return;
  }

  notifySyncStatus('syncing');
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', session.userId);

    if (error) throw error;

    let hasChanges = false;
    data?.forEach(item => {
      const localData = getFromStorage<any>(item.key, null);
      const remoteTimestamp = new Date(item.last_updated).getTime();
      const localTimestamp = localData?._lastUpdated || 0;

      // Last-write-wins conflict resolution
      if (remoteTimestamp > localTimestamp) {
        saveToStorage(item.key, { ...item.data, _lastUpdated: remoteTimestamp }, false);
        hasChanges = true;
      }
    });

    if (hasChanges) notifyListeners();
    notifySyncStatus('synced');
  } catch (err) {
    console.error('Pull from cloud failed:', err);
    notifySyncStatus('error');
  }
}

let realtimeChannel: any = null;


export function initRealtimeSync() {
  if (typeof window === 'undefined') return;
  
  const session = getSession();
  if (!session || session.isGuest) {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }
    return;
  }

  if (realtimeChannel) return; // Already subscribed

  realtimeChannel = supabase
    .channel('public:user_data')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${session.userId}`
      },
      (payload: any) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const remoteTimestamp = new Date(payload.new.last_updated).getTime();
          const localData = getFromStorage<any>(payload.new.key, null);
          const localTimestamp = localData?._lastUpdated || 0;

          if (remoteTimestamp > localTimestamp) {
            saveToStorage(payload.new.key, { ...payload.new.data, _lastUpdated: remoteTimestamp }, false);
            notifyListeners();
          }
        }
      }
    )
    .subscribe();
}

// Handle connectivity changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const pending = getPendingSync();
    if (pending.size > 0) {
      pullFromCloud().then(() => {
        pending.forEach(key => {
          const data = getFromStorage(key, null);
          if (data) pushToCloud(key, data);
        });
      });
    } else {
      pullFromCloud();
    }
  });

  window.addEventListener('offline', () => notifySyncStatus('offline'));
  
  // Predictable sync: pull on tab focus
  window.addEventListener('focus', () => pullFromCloud());

  // Initialize Realtime Sync
  initRealtimeSync();
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const userKey = getUserKey(key);
    const stored = localStorage.getItem(userKey);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && 
        typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
      return { ...defaultValue, ...parsed };
    }
    
    return parsed;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: any, triggerPush = true): void {
  if (typeof window === 'undefined') return;
  try {
    const userKey = getUserKey(key);
    const timestampedValue = { ...value, _lastUpdated: Date.now() };
    localStorage.setItem(userKey, JSON.stringify(timestampedValue));
    
    if (triggerPush) {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => pushToCloud(key, timestampedValue), 2000);
    }
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

export const settingsStore = {
  get: (): SettingsData => getFromStorage(STORAGE_KEYS.settings, {
    dailyResetEnabled: false,
    lastResetDate: new Date().toISOString().split('T')[0],
    promptDismissed: false,
    visualsEnabled: true,
    visualsOnlyOutsideFocus: true,
    dailySignal: 'standard',
    notificationTone: 'gentle',
      focusBehavior: 'manual',
      aiFrequency: 'occasional',
      aiSkillInsights: true,
      practiceSuggestionsManual: true,
      skillVisibility: 'Personal',
      systemReviewDate: undefined,
            modules: {
          fitness: true,
          finance: true,
          flow: true,
          football: true,
          community: false,
          neuralTimeline: true,
        },

  }),
  save: (data: SettingsData) => {
    saveToStorage(STORAGE_KEYS.settings, data);
    notifyListeners();
  },
};

export const fitnessStore = {
  get: (): FitnessData => getFromStorage(STORAGE_KEYS.fitness, {
    selectedSession: null,
    streak: 0,
    weekProgress: [false, false, false, false, false],
    recentActivity: [],
    history: [],
    completedSessions: {},
      weeklyPlan: undefined,
      daySessions: {},
      hydration: { entries: {} },
      footballEnabled: false,
    }),
  save: (data: FitnessData) => {
    saveToStorage(STORAGE_KEYS.fitness, data);
    notifyListeners();
  },
  removeHydrationEntry: (date: string, entryId: string) => {
    const fitness = fitnessStore.get();
    if (!fitness.hydration?.entries[date]) return;
    
    const updatedEntries = fitness.hydration.entries[date].filter(e => e.id !== entryId);
    
    fitnessStore.save({
      ...fitness,
      hydration: {
        ...fitness.hydration,
        entries: {
          ...fitness.hydration.entries,
          [date]: updatedEntries
        }
      }
    });
  }
};

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split('T')[0];
}

export function isWeeklyPlanLocked(plan: WeeklyWorkoutPlan | undefined): boolean {
  if (!plan) return false;
  return !!plan.lockedAt;
}

export function canEditWeeklyPlan(plan: WeeklyWorkoutPlan | undefined): boolean {
  if (!plan) return true;
  if (!plan.lockedAt) return true;
  
  const today = new Date();
  const todayDay = today.getDay();
  const planningDay = plan.planningDay ?? 0;
  
  return todayDay === planningDay && !plan.lockedAt;
}

export function getDefaultWeeklyPlan(): WeeklyWorkoutPlan {
  const weekStart = getWeekStartDate();
  return getPhase1FoundationBlueprint(weekStart);
}

export function getPhase1FoundationBlueprint(weekStartDate: string): WeeklyWorkoutPlan {
  const warmupExercises: Exercise[] = [
    { id: 'w1', name: 'Neck circles', time: '30 sec', isWarmup: true },
    { id: 'w2', name: 'Shoulder rolls + arm swings', time: '1 min', isWarmup: true },
    { id: 'w3', name: 'Cat-Cow', reps: '10', isWarmup: true },
    { id: 'w4', name: 'Hip circles', time: '30 sec', isWarmup: true },
    { id: 'w5', name: 'Ankle circles', reps: '20 each side', isWarmup: true },
    { id: 'w6', name: 'Calf stretch', time: '30 sec each', isWarmup: true },
    { id: 'w7', name: 'Dead hang (relaxed)', time: '20-30 sec', isWarmup: true },
  ];

  return {
    weekStartDate,
    days: [
      {
        dayIndex: 0,
        type: 'Rest',
        name: 'Rest / Light Stretching',
        exercises: [],
      },
      {
        dayIndex: 1,
        type: 'Strength',
        name: 'Push + Core',
        exercises: [
          ...warmupExercises,
          { id: 'd1e1', name: 'Incline push-ups', sets: 3, reps: '8-10' },
          { id: 'd1e2', name: 'Knee push-ups', sets: 3, reps: '6-8' },
          { id: 'd1e3', name: 'Pike push-up hold', sets: 3, time: '20 sec' },
          { id: 'd1e4', name: 'Bench/bed triceps dips', sets: 3, reps: '8' },
          { id: 'd1e5', name: 'Forearm plank', sets: 3, time: '20-30 sec', notes: 'Core' },
          { id: 'd1e6', name: 'Dead bug', sets: 3, reps: '8 each side', notes: 'Core' },
        ],
      },
      {
        dayIndex: 2,
        type: 'Strength',
        name: 'Pull + Core',
        exercises: [
          ...warmupExercises.map(e => ({ ...e, id: e.id + '_d2' })),
          { id: 'd2e1', name: 'Dead hang', sets: 3, time: '20-30 sec' },
          { id: 'd2e2', name: 'Negative pull-ups', sets: 4, reps: '3' },
          { id: 'd2e3', name: 'Australian rows', sets: 3, reps: '8' },
          { id: 'd2e4', name: 'Scapular pull-ups', sets: 3, reps: '6' },
          { id: 'd2e5', name: 'Lying leg raises (bent knees)', sets: 3, reps: '8', notes: 'Core' },
          { id: 'd2e6', name: 'Side plank', sets: 2, time: '15 sec each side', notes: 'Core' },
        ],
      },
      {
        dayIndex: 3,
        type: 'Mobility',
        name: 'Rest / Mobility',
        exercises: [],
      },
      {
        dayIndex: 4,
        type: 'Strength',
        name: 'Legs + Core (ankle-safe)',
        exercises: [
          ...warmupExercises.map(e => ({ ...e, id: e.id + '_d4' })),
          { id: 'd4e1', name: 'Bodyweight squats', sets: 3, reps: '15' },
          { id: 'd4e2', name: 'Split squats (slow)', sets: 3, reps: '8 each leg' },
          { id: 'd4e3', name: 'Glute bridges', sets: 3, reps: '12' },
          { id: 'd4e4', name: 'Standing calf raises', sets: 3, reps: '15' },
          { id: 'd4e5', name: 'Bird dog', sets: 3, reps: '8 each side', notes: 'Core' },
          { id: 'd4e6', name: 'Seated forward fold stretch', time: '30 sec', notes: 'Core' },
        ],
      },
      {
        dayIndex: 5,
        type: 'Cardio',
        name: 'Full Body + Skills',
        exercises: [
          ...warmupExercises.map(e => ({ ...e, id: e.id + '_d5' })),
          { id: 'd5e1', name: 'Incline push-ups', sets: 3, reps: 'AMRAP' },
          { id: 'd5e2', name: 'Negative pull-ups', sets: 3, reps: '3' },
          { id: 'd5e3', name: 'Squats', sets: 3, reps: '20' },
          { id: 'd5e4', name: 'Hollow body hold', sets: 3, time: '15-25 sec' },
          { id: 'd5e5', name: 'Shadow football footwork (light)', time: '5 min', notes: 'Conditioning' },
        ],
      },
      {
        dayIndex: 6,
        type: 'Rest',
        name: 'Rest / Light Stretching',
        exercises: [],
      },
    ],
    lockedAt: null,
    planningDay: 0,
  };
}

const DEFAULT_WORK_DATA: WorkData = {
  tasks: [
    { id: '1', text: 'Review project documentation', status: 'done', timeEstimate: '30m', isOngoing: false, date: new Date().toISOString().split('T')[0], carryOverCount: 0, isImportant: false },
    { id: '2', text: 'Prepare weekly report', status: 'pending', timeEstimate: '45m', isOngoing: false, date: new Date().toISOString().split('T')[0], carryOverCount: 0, isImportant: true },
    { id: '3', text: 'Team sync call', status: 'pending', timeEstimate: '1h', isOngoing: true, date: new Date().toISOString().split('T')[0], carryOverCount: 0, isImportant: false },
  ],
  taskHistory: [],
  focusTime: 0,
  focusSessions: 0,
  timerState: {
    timeLeft: 25 * 60,
    isActive: false,
    isPaused: false,
    lastUpdated: 0,
  },
};

export const workStore = {
  get: (): WorkData => getFromStorage(STORAGE_KEYS.work, DEFAULT_WORK_DATA),
  save: (data: WorkData) => {
    saveToStorage(STORAGE_KEYS.work, data);
    notifyListeners();
  },
};

export const routineStore = {
  get: (): RoutineData => getFromStorage(STORAGE_KEYS.routine, {
    routines: [
      {
        id: 'morning',
        title: 'Morning',
        items: [
          { id: 'm1', label: 'Wake by 7am', done: false },
          { id: 'm2', label: 'Hydrate', done: false },
          { id: 'm3', label: 'Movement', done: false },
        ]
      },
      {
        id: 'evening',
        title: 'Evening',
        items: [
          { id: 'e1', label: 'Review day', done: false },
          { id: 'e2', label: 'Prepare tomorrow', done: false },
          { id: 'e3', label: 'Wind down', done: false },
        ]
      }
    ],
    habits: [
      { id: 'h1', label: 'Read 20 pages', done: false },
      { id: 'h2', label: 'No phone first hour', done: false },
      { id: 'h3', label: 'Journal entry', done: false },
    ],
    habitHistory: [],
  }),
  save: (data: RoutineData) => {
    saveToStorage(STORAGE_KEYS.routine, data);
    notifyListeners();
  },
};

export const planningStore = {
  get: (): PlanningData => getFromStorage(STORAGE_KEYS.planning, {
    tasks: [],
    horizonIntents: [],
    monthlyFocus: 'Deep Work & Recovery',
    brainDump: '',
  }),
  save: (data: PlanningData) => {
    saveToStorage(STORAGE_KEYS.planning, data);
    notifyListeners();
  },
};

export const reminderStore = {
  get: (): ReminderData => getFromStorage(STORAGE_KEYS.reminders, {
    shownToday: [],
    lastResetDate: new Date().toISOString().split('T')[0],
  }),
  save: (data: ReminderData) => {
    saveToStorage(STORAGE_KEYS.reminders, data);
    notifyListeners();
  },
};

export const sleepStore = {
  get: (): SleepData => getFromStorage(STORAGE_KEYS.sleep, { days: {} }),
  save: (data: SleepData) => {
    saveToStorage(STORAGE_KEYS.sleep, data);
    notifyListeners();
  },
  getDay: (date: string): SleepDay => {
    const data = sleepStore.get();
    return data.days[date] || {
      date,
      sleepAt: null,
      wakeAt: null,
      isSleepEstimated: false,
      isWakeEstimated: false,
    };
  },
  saveDay: (day: SleepDay) => {
    const data = sleepStore.get();
    sleepStore.save({
      ...data,
      days: { ...data.days, [day.date]: day }
    });
  }
};

export interface AIInsight {
  id: string;
  text: string;
  category: string;
}

export interface AIData {
  insights: AIInsight[];
  lastUpdated: string;
  _lastUpdated?: number;
}

export const aiStore = {
  get: (): AIData => getFromStorage(STORAGE_KEYS.ai, {
    insights: [
      { id: '1', text: "Welcome to your AI life coach. I'll provide insights as you use the app.", category: 'System' }
    ],
    lastUpdated: new Date().toISOString(),
  }),
  save: (data: AIData) => {
    saveToStorage(STORAGE_KEYS.ai, data);
    notifyListeners();
  },
};

export const DEFAULT_MONTHLY_FINANCE: MonthlyFinanceData = {
  expenses: [],
  fixedExpenses: [],
  sharedExpenses: [],
  budget: {
    monthlyBudget: null,
    categoryLimits: {},
  },
  summary: {
    monthlyIncome: null,
  },
  notes: '',
  archived: false
};

export function generateCrossTabInsight(monthKey: string): string | null {
  const finance = financeStore.get();
  const monthData = finance.months[monthKey];
  
  if (!monthData) return null;

  const expenses = monthData.expenses || [];
  const fixedExpenses = monthData.fixedExpenses || [];
  const income = monthData.summary?.monthlyIncome || 0;
  
  const totalVariable = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = totalVariable + totalFixed;

  // Find top category
  const catTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  const insights: string[] = [];

  // Observation 1: Split
  if (totalSpent > 0) {
    const fixedPercent = Math.round((totalFixed / totalSpent) * 100);
    insights.push(`Fixed expenses accounted for ${fixedPercent}% of your total spending.`);
  }

  // Observation 2: Top Category
  if (topCategory) {
    insights.push(`Spending was highest in the ${topCategory[0]} category this month.`);
  }

  // Observation 3: Income context
  if (income > 0) {
    const usage = Math.round((totalSpent / income) * 100);
    insights.push(`Total spending was ${usage}% of your recorded income.`);
  }

  // Logic: Neutral observation
  if (insights.length === 0) {
    insights.push("Spending and activity levels showed relative stability throughout the month.");
  }

  return insights[0] || null;
}

export const financeStore = {
  get: (): FinanceData => {
    const raw = getFromStorage<any>(STORAGE_KEYS.finance, { months: {} });
    
    const budget = raw.budget || { monthlyBudget: null, categoryLimits: {} };
    const summary = raw.summary || { monthlyIncome: null };
    
    // Migration logic for old structure
    if (raw && raw.expenses && !raw.months) {
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      return {
        months: {
          [currentMonthKey]: {
            expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
            budget,
            summary,
            notes: raw.notes || '',
            archived: false
          }
        }
      };
    }

    // Ensure months object exists and each month has valid sub-objects
    const data = raw as FinanceData;
    if (!data || !data.months) {
      return { months: {} };
    }

    const currentMonthKey = new Date().toISOString().slice(0, 7);
    if (!data.months[currentMonthKey]) {
      data.months[currentMonthKey] = { ...DEFAULT_MONTHLY_FINANCE };
    }

      // Defensive check for each month (in case of corrupt storage)
      Object.keys(data.months).forEach(key => {
        const m = data.months[key];
        if (m) {
          if (!m.expenses) m.expenses = [];
          if (!m.fixedExpenses) m.fixedExpenses = [];
          if (!m.sharedExpenses) m.sharedExpenses = [];
          if (!m.budget) m.budget = { monthlyBudget: null, categoryLimits: {} };
          if (!m.summary) m.summary = { monthlyIncome: null };
        }
      });

    return data;
  },
  save: (data: FinanceData) => {
    saveToStorage(STORAGE_KEYS.finance, data);
    notifyListeners();
  },
  getCurrentMonthData: (): MonthlyFinanceData => {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const data = financeStore.get();
    if (!data.months[currentMonthKey]) {
      // Create it if it doesn't exist
      const newData = {
        ...data,
        months: {
          ...data.months,
          [currentMonthKey]: { ...DEFAULT_MONTHLY_FINANCE }
        }
      };
      financeStore.save(newData);
      return DEFAULT_MONTHLY_FINANCE;
    }
    return data.months[currentMonthKey];
  }
};

export function calculateFitnessStreak(completedSessions: Record<string, string> = {}): number {
  const dates = Object.keys(completedSessions).sort();
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let checkDate = completedSessions[today] ? today : (completedSessions[yesterday] ? yesterday : null);
  if (!checkDate) return 0;

  let streak = 0;
  while (checkDate && completedSessions[checkDate]) {
    // Both active sessions and logged rest days count towards consistency streak
    streak++;
    
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    const prevDate = d.toISOString().split('T')[0];
    
    if (completedSessions[prevDate]) {
      checkDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

export function performDailyReset() {
  const settings = settingsStore.get();
  const today = new Date().toISOString().split('T')[0];
  const currentMonthKey = today.slice(0, 7);

  // Reset reminders daily regardless of dailyResetEnabled
  const reminders = reminderStore.get();
  if (reminders.lastResetDate !== today) {
    reminderStore.save({
      shownToday: [],
      lastResetDate: today,
    });
  }

  // FINANCE MONTH TRANSITION LOGIC
  const finance = financeStore.get();
  const lastResetMonthKey = settings.lastResetDate.slice(0, 7);
  
    if (lastResetMonthKey !== currentMonthKey) {
      // New month detected!
      const updatedMonths = { ...finance.months };
      
      if (updatedMonths[lastResetMonthKey]) {
        updatedMonths[lastResetMonthKey].archived = true;
        updatedMonths[lastResetMonthKey].crossTabInsight = generateCrossTabInsight(lastResetMonthKey) || undefined;
      }

    if (!updatedMonths[currentMonthKey]) {
      const prevMonthData = updatedMonths[lastResetMonthKey] || DEFAULT_MONTHLY_FINANCE;
      updatedMonths[currentMonthKey] = {
        ...DEFAULT_MONTHLY_FINANCE,
        budget: prevMonthData.budget,
        notes: prevMonthData.notes,
      };
    }

    const sortedMonthKeys = Object.keys(updatedMonths).sort().reverse();
    const keysToKeep = sortedMonthKeys.slice(0, 12);
    const finalMonths: Record<string, MonthlyFinanceData> = {};
    keysToKeep.forEach(key => {
      finalMonths[key] = updatedMonths[key];
    });

    financeStore.save({ months: finalMonths });
  }

  if (!settings.dailyResetEnabled) {
    if (settings.lastResetDate !== today) {
      settingsStore.save({ ...settings, lastResetDate: today });
    }
    return;
  }
  
  if (settings.lastResetDate === today) return;

  // 1. Fitness Reset
  const fitness = fitnessStore.get();
  const lastResetTime = new Date(settings.lastResetDate).getTime();
  const todaySessions = (fitness.recentActivity || [])
    .filter(a => a && a.timestamp >= lastResetTime)
    .map(a => a.type);
  
  const fitnessHistory = Array.isArray(fitness.history) ? [...fitness.history] : [];
  if (todaySessions.length > 0) {
    fitnessHistory.push({ 
      date: settings.lastResetDate, 
      session: todaySessions.join(', ') 
    });
  } else if (fitness.selectedSession) {
    fitnessHistory.push({ 
      date: settings.lastResetDate, 
      session: `Planned: ${fitness.selectedSession}` 
    });
  }

  // Hydration Cleanup - Keep history
  const hydration = fitness.hydration || { entries: {} };
  
  fitnessStore.save({
    ...fitness,
    selectedSession: null,
    history: fitnessHistory.slice(-30),
    hydration: hydration // Preserve all history
  });

  // 2. Work Reset
  const work = workStore.get();
  const todayDate = new Date().toISOString().split('T')[0];
  
  const activeTasks: WorkData['tasks'] = [];
  const newHistory: WorkData['taskHistory'] = Array.isArray(work.taskHistory) ? [...work.taskHistory] : [];

  (work.tasks || []).forEach(task => {
    if (!task) return;
    if (task.status === 'done') {
      newHistory.push({ id: task.id, text: task.text, status: 'done', date: task.date });
    } else if (task.isOngoing) {
      activeTasks.push({ ...task, status: 'pending', date: todayDate });
    } else {
      if (task.date < todayDate) {
        if (task.status === 'pending') {
          activeTasks.push({ ...task, status: 'missed' });
        } else if (task.status === 'missed') {
          activeTasks.push(task);
        }
      } else {
        activeTasks.push(task);
      }
    }
  });

    workStore.save({
      ...work,
      tasks: activeTasks,
      taskHistory: newHistory.slice(-100),
      focusTime: 0,
      focusSessions: 0,
      timerState: {
        timeLeft: 25 * 60,
        isActive: false,
        isPaused: false,
        lastUpdated: Date.now(),
      },
    });

  // 3. Routine/Habits Reset
  const routine = routineStore.get();
  const newHabitHistory = Array.isArray(routine.habitHistory) ? [...routine.habitHistory] : [];
  (routine.habits || []).forEach(habit => {
    if (habit) {
      newHabitHistory.push({ date: settings.lastResetDate, habitId: habit.id, done: habit.done });
    }
  });

  const resetRoutines = (routine.routines || []).map(r => ({
    ...r,
    items: (r.items || []).map(item => ({ ...item, done: false }))
  }));
  const resetHabits = (routine.habits || []).map(h => ({ ...h, done: false }));

    routineStore.save({
      ...routine,
      routines: resetRoutines,
      habits: resetHabits,
      habitHistory: newHabitHistory,
    });
  
    // 4. Retention Policy Logic
    if (settings.retentionPolicy && settings.retentionPolicy !== 'all') {
      const days = settings.retentionPolicy === '1year' ? 365 : settings.retentionPolicy === '90days' ? 90 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];
  
      // Clean up fitness completedSessions
      const fitness = fitnessStore.get();
      const newCompleted = { ...fitness.completedSessions };
      Object.keys(newCompleted).forEach(d => { if (d < cutoffStr) delete newCompleted[d]; });
      
      // Clean up routine history
      const newHabitHist = (routineStore.get().habitHistory || []).filter(h => h.date >= cutoffStr);
      
      // Clean up finance
      const finance = financeStore.get();
      const newMonths = { ...finance.months };
      Object.keys(newMonths).forEach(m => { if (m < cutoffStr.slice(0, 7)) delete newMonths[m]; });
  
      // Save cleaned data
      if (Object.keys(fitness.completedSessions).length !== Object.keys(newCompleted).length) {
        fitnessStore.save({ ...fitness, completedSessions: newCompleted });
      }
      if (routineStore.get().habitHistory?.length !== newHabitHist.length) {
        routineStore.save({ ...routineStore.get(), habitHistory: newHabitHist });
      }
      if (Object.keys(finance.months).length !== Object.keys(newMonths).length) {
        financeStore.save({ ...finance, months: newMonths });
      }
    }
  
    // 5. Update Reset Date
    settingsStore.save({
      ...settings,
      lastResetDate: today,
    });
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('clear-all-data', async () => {
      const session = getSession();
      if (session && !session.isGuest) {
        try {
          const { error } = await supabase
            .from('user_data')
            .delete()
            .eq('user_id', session.userId);
          if (error) console.error('Cloud delete failed:', error);
        } catch (e) {
          console.error('Cloud delete error:', e);
        }
      }
      
      Object.keys(STORAGE_KEYS).forEach(key => {
        const userKey = getUserKey(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]);
        localStorage.removeItem(userKey);
      });
      
      localStorage.removeItem(PENDING_SYNC_KEY);
      window.location.reload();
    });
  }
