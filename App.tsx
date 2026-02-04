import React, { useState, useEffect, useMemo } from 'react';
import { Search, GripVertical, Check, Filter, Edit3, RotateCcw, Calendar, CalendarPlus, Zap, Settings, Cloud, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import { StatsRing } from './components/StatsRing';
import { WeightBadge } from './components/WeightBadge';
import { SettingsModal } from './components/SettingsModal';
import { AppState, Chapter, ColumnNames, FilterState, Subject, SubjectColumnNames, Weightage } from './types';
import { INITIAL_DATA, INITIAL_COLUMN_NAMES, MOTIVATIONAL_QUOTES } from './constants';

declare var google: any;
declare var gapi: any;

// --- Components ---

interface RowProps {
  chapter: Chapter;
  index: number;
  subject: Subject;
  columnNames: ColumnNames;
  isDraggingEnabled: boolean;
  onToggleCheck: (id: string, idx: 0 | 1 | 2, subject: Subject) => void;
  onToggleToday: (id: string, idx: 0 | 1 | 2, subject: Subject) => void;
  onWeightChange: (id: string, w: Weightage, subject: Subject) => void;
  editingId: string | null;
  startEditing: (c: Chapter) => void;
  saveEditing: () => void;
  editingName: string;
  setEditingName: (s: string) => void;
}

const ChapterRow = ({
  chapter,
  subject,
  columnNames,
  isDraggingEnabled,
  onToggleCheck,
  onToggleToday,
  onWeightChange,
  editingId,
  startEditing,
  saveEditing,
  editingName,
  setEditingName
}: RowProps) => {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  const handleWeightCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle: Weightage[] = ['low', 'med', 'high'];
    const next = cycle[(cycle.indexOf(chapter.weightage) + 1) % 3];
    onWeightChange(chapter.id, next, subject);
  };

  const content = (
    <>
      <div className="flex items-center justify-center pl-2">
        <div
          onPointerDown={(e) => isDraggingEnabled && controls.start(e)}
          className={`p-2 rounded-lg transition-colors ${
            isDraggingEnabled 
              ? 'cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 hover:bg-white/5' 
              : 'cursor-not-allowed text-slate-800'
          }`}
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col justify-center px-2">
        {editingId === chapter.id ? (
          <div className="flex items-center gap-2 w-full">
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
              onBlur={saveEditing}
              className="bg-slate-800 text-white text-sm font-semibold px-2 py-1.5 rounded border border-indigo-500 w-full outline-none shadow-lg shadow-indigo-500/20"
            />
            <button onMouseDown={saveEditing} className="text-indigo-400 hover:text-indigo-300">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1.5">
            <span
              onClick={() => startEditing(chapter)}
              className="text-sm font-bold text-slate-200 cursor-pointer hover:text-indigo-300 transition-colors truncate w-full"
            >
              {chapter.name}
            </span>
            <WeightBadge weight={chapter.weightage} onClick={handleWeightCycle} />
          </div>
        )}
      </div>

      {[0, 1, 2].map((colIdx) => {
        const isToday = chapter.todaysTasks[colIdx as 0 | 1 | 2];
        const isCompleted = chapter.progress[colIdx as 0 | 1 | 2];
        const colKey = `col${colIdx + 1}` as keyof ColumnNames;
        
        return (
          <div key={colIdx} className="flex items-center justify-center relative group/cell">
            <div className={`
              relative flex items-center justify-center w-12 h-12 rounded-xl transition-colors
              ${isToday ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/[0.03]'}
            `}
            title={columnNames[colKey]}
            >
              <label className="relative inline-flex items-center justify-center cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isCompleted}
                  onChange={() => onToggleCheck(chapter.id, colIdx as 0 | 1 | 2, subject)}
                />
                <div className="w-5 h-5 rounded border-2 border-slate-700 bg-slate-800/50 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all duration-200 flex items-center justify-center hover:border-slate-500">
                  <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-all duration-200 transform scale-50 peer-checked:scale-100" />
                </div>
              </label>

              {/* Today Toggle Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleToday(chapter.id, colIdx as 0 | 1 | 2, subject);
                }}
                className={`
                  absolute -top-1 -right-1 p-1 rounded-full bg-slate-900 border shadow-sm transition-all duration-200
                  ${isToday 
                    ? 'border-indigo-500 text-indigo-400 opacity-100 scale-100' 
                    : 'border-slate-700 text-slate-600 opacity-0 group-hover/cell:opacity-100 scale-90 group-hover/cell:scale-100 hover:text-indigo-400 hover:border-indigo-500'}
                `}
                title={isToday ? "Remove from Today" : "Add to Today"}
              >
                <Calendar className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        );
      })}

      <div className="flex flex-col items-center justify-center px-4">
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${(chapter.progress.filter(Boolean).length / 3) * 100}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
        <p className="text-[10px] text-center text-slate-500 font-bold mt-1.5">
          {Math.round((chapter.progress.filter(Boolean).length / 3) * 100)}%
        </p>
      </div>
    </>
  );

  const rowClass = `
    grid grid-cols-[3.5rem_minmax(180px,2fr)_repeat(3,minmax(70px,1fr))_minmax(90px,1fr)] 
    gap-2 py-3 border-b border-white/[0.03] bg-[#0A0A0A] hover:bg-white/[0.02] transition-colors
    ${isDragging ? 'shadow-2xl ring-1 ring-indigo-500/50 z-50 rounded-lg bg-slate-900' : ''}
  `;

  if (isDraggingEnabled) {
    return (
      <Reorder.Item
        value={chapter}
        dragListener={false}
        dragControls={controls}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        className={rowClass}
        whileDrag={{ scale: 1.02 }}
      >
        {content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div layout className={rowClass}>
      {content}
    </motion.div>
  );
};

type ViewTab = Subject | 'today';

const App: React.FC = () => {
  // --- State ---
  const [data, setData] = useState<AppState>(INITIAL_DATA);
  const [columnNames, setColumnNames] = useState<SubjectColumnNames>(INITIAL_COLUMN_NAMES);
  const [currentTab, setCurrentTab] = useState<ViewTab>('physics');
  const [filters, setFilters] = useState<FilterState>({ search: '', weightage: 'all', status: 'all' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCol, setEditingCol] = useState<keyof ColumnNames | null>(null);
  const [tempColName, setTempColName] = useState('');
  const [quote, setQuote] = useState('');

  // --- Settings & Integrations State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // --- Persistence & Migration ---
  useEffect(() => {
    const savedData = localStorage.getItem('jee_zenith_data_v2');
    const savedCols = localStorage.getItem('jee_zenith_cols_v2');
    const savedClientId = localStorage.getItem('jee_zenith_google_client_id');
    
    if (savedClientId) setGoogleClientId(savedClientId);

    if (savedData) {
      const parsed: AppState = JSON.parse(savedData);
      let needsUpdate = false;
      const subjects: Subject[] = ['physics', 'math', 'chemistry'];
      subjects.forEach(sub => {
        parsed[sub] = parsed[sub].map(ch => {
          if (!ch.todaysTasks) {
            needsUpdate = true;
            return { ...ch, todaysTasks: [false, false, false] };
          }
          return ch;
        });
      });
      setData(parsed);
      if (needsUpdate) {
        localStorage.setItem('jee_zenith_data_v2', JSON.stringify(parsed));
      }
    }
    if (savedCols) {
      const parsed = JSON.parse(savedCols);
      if (parsed.col1) {
        setColumnNames({
          physics: parsed,
          math: parsed,
          chemistry: parsed
        });
      } else {
        setColumnNames(parsed);
      }
    }
    
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem('jee_zenith_data_v2', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('jee_zenith_cols_v2', JSON.stringify(columnNames));
  }, [columnNames]);

  useEffect(() => {
    localStorage.setItem('jee_zenith_google_client_id', googleClientId);
  }, [googleClientId]);

  // --- Google Integration ---
  const initGoogleTasks = () => {
    if (!googleClientId) return;

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/tasks',
        callback: (response: any) => {
          if (response.access_token) {
            setIsGoogleConnected(true);
            // Load GAPI client for requests
            gapi.load('client', async () => {
              await gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'],
              });
              // Set token for gapi
              gapi.client.setToken(response);
            });
          }
        },
      });
      setTokenClient(client);
      client.requestAccessToken();
    } catch (error) {
      console.error("Error initializing Google Client:", error);
      alert("Failed to initialize Google Client. Check console for details.");
    }
  };

  const handleDisconnectGoogle = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken('');
        setIsGoogleConnected(false);
      });
    } else {
      setIsGoogleConnected(false);
    }
  };

  const syncToGoogleTasks = async () => {
    if (!isGoogleConnected) {
      alert("Please connect your Google Account in Settings first.");
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      // 1. Find or Create "JEE Zenith" Task List
      const listsResponse = await gapi.client.tasks.tasklists.list();
      let targetList = listsResponse.result.items?.find((l: any) => l.title === 'JEE Zenith');

      if (!targetList) {
        const createListResponse = await gapi.client.tasks.tasklists.insert({ title: 'JEE Zenith' });
        targetList = createListResponse.result;
      }

      // 2. Get tasks to sync (from Today's tab)
      const tasksToSync: string[] = [];
      const subjects: Subject[] = ['physics', 'math', 'chemistry'];
      
      subjects.forEach(sub => {
        data[sub].forEach(ch => {
          ch.todaysTasks.forEach((isAssigned, idx) => {
            if (isAssigned) {
              const colKey = `col${idx + 1}` as keyof ColumnNames;
              const taskName = `${columnNames[sub][colKey]}: ${ch.name} (${sub.charAt(0).toUpperCase() + sub.slice(1)})`;
              tasksToSync.push(taskName);
            }
          });
        });
      });

      // 3. Sync Tasks (Simple check to avoid duplicates based on title, not perfect but good for MVP)
      const existingTasksResponse = await gapi.client.tasks.tasks.list({ tasklist: targetList.id });
      const existingTitles = new Set(existingTasksResponse.result.items?.map((t: any) => t.title) || []);

      for (const title of tasksToSync) {
        if (!existingTitles.has(title)) {
          await gapi.client.tasks.tasks.insert({
            tasklist: targetList.id,
            resource: { title: title }
          });
        }
      }

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshQuote = () => {
    let newQuote = quote;
    while (newQuote === quote) {
      newQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }
    setQuote(newQuote);
  };

  // --- Calculations ---
  const globalStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    Object.values(data).forEach((chapters) => {
      chapters.forEach((ch) => {
        total += 3;
        completed += ch.progress.filter(Boolean).length;
      });
    });
    return { total, completed, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [data]);

  const isFiltered = filters.search !== '' || filters.weightage !== 'all' || filters.status !== 'all';

  const applyFilters = (chapters: Chapter[]) => {
    return chapters.filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesWeight = filters.weightage === 'all' || ch.weightage === filters.weightage;
      
      const progressCount = ch.progress.filter(Boolean).length;
      let matchesStatus = true;
      if (filters.status === 'not-started') matchesStatus = progressCount === 0;
      if (filters.status === 'in-progress') matchesStatus = progressCount > 0 && progressCount < 3;
      if (filters.status === 'completed') matchesStatus = progressCount === 3;

      return matchesSearch && matchesWeight && matchesStatus;
    });
  };

  const currentViewData = useMemo(() => {
    if (currentTab === 'today') {
      const subjects: Subject[] = ['physics', 'math', 'chemistry'];
      const aggregated: { subject: Subject; chapters: Chapter[] }[] = [];
      
      subjects.forEach(sub => {
        const todaysChapters = data[sub].filter(ch => ch.todaysTasks.some(t => t));
        if (todaysChapters.length > 0) {
          aggregated.push({ subject: sub, chapters: applyFilters(todaysChapters) });
        }
      });
      return aggregated;
    } else {
      return applyFilters(data[currentTab]);
    }
  }, [data, currentTab, filters]);

  const colStats = useMemo(() => {
    if (currentTab === 'today') return [0, 0, 0];
    const allSubjectChapters = data[currentTab];
    if (allSubjectChapters.length === 0) return [0, 0, 0];
    const counts = [0, 0, 0];
    allSubjectChapters.forEach(ch => {
      if (ch.progress[0]) counts[0]++;
      if (ch.progress[1]) counts[1]++;
      if (ch.progress[2]) counts[2]++;
    });
    return counts.map(c => Math.round((c / allSubjectChapters.length) * 100));
  }, [data, currentTab]);

  const displayedColumnNames = useMemo(() => {
    if (currentTab === 'today') return { col1: 'Task 1', col2: 'Task 2', col3: 'Task 3' };
    return columnNames[currentTab];
  }, [columnNames, currentTab]);

  // --- Actions ---
  const handleToggleCheck = (id: string, index: 0 | 1 | 2, subject: Subject) => {
    setData(prev => ({
      ...prev,
      [subject]: prev[subject].map(ch => 
        ch.id === id 
          ? { ...ch, progress: ch.progress.map((p, i) => i === index ? !p : p) as [boolean, boolean, boolean] }
          : ch
      )
    }));
  };

  const handleToggleToday = (id: string, index: 0 | 1 | 2, subject: Subject) => {
    setData(prev => ({
      ...prev,
      [subject]: prev[subject].map(ch => 
        ch.id === id 
          ? { ...ch, todaysTasks: ch.todaysTasks.map((t, i) => i === index ? !t : t) as [boolean, boolean, boolean] }
          : ch
      )
    }));
  };

  const handleWeightChange = (id: string, weight: Weightage, subject: Subject) => {
    setData(prev => ({
      ...prev,
      [subject]: prev[subject].map(ch => ch.id === id ? { ...ch, weightage: weight } : ch)
    }));
  };

  const startEditing = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditingName(chapter.name);
  };

  const saveEditing = () => {
    if (editingId) {
      const subjects: Subject[] = ['physics', 'math', 'chemistry'];
      let foundSubject: Subject | null = null;
      for (const s of subjects) {
        if (data[s].some(c => c.id === editingId)) {
          foundSubject = s;
          break;
        }
      }
      if (foundSubject) {
        setData(prev => ({
          ...prev,
          [foundSubject!]: prev[foundSubject!].map(ch => ch.id === editingId ? { ...ch, name: editingName } : ch)
        }));
      }
      setEditingId(null);
    }
  };

  const handleReorder = (newOrder: Chapter[]) => {
    if (currentTab === 'today') return;
    setData(prev => ({ ...prev, [currentTab]: newOrder }));
  };

  const handleColumnNameChange = (colKey: keyof ColumnNames, newName: string) => {
    if (currentTab === 'today') return;
    setColumnNames(prev => ({
      ...prev,
      [currentTab]: {
        ...prev[currentTab],
        [colKey]: newName
      }
    }));
  };

  // --- Render Helpers ---
  const tabs: { id: ViewTab, label: string }[] = [
    { id: 'physics', label: 'Physics' },
    { id: 'math', label: 'Math' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'today', label: 'Today' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-20 overflow-x-hidden">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        googleClientId={googleClientId}
        setGoogleClientId={setGoogleClientId}
        isGoogleConnected={isGoogleConnected}
        onConnectGoogle={initGoogleTasks}
        onDisconnectGoogle={handleDisconnectGoogle}
      />

      {/* Background Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl shadow-black/50 mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                JEE Zenith
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Ultimate Tracking System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <StatsRing 
              percentage={globalStats.percentage} 
              totalTasks={globalStats.total} 
              completedTasks={globalStats.completed} 
            />
            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors group"
            >
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
                  ${currentTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {tab.id === 'today' && <Zap className={`w-4 h-4 ${currentTab === 'today' ? 'text-yellow-300' : 'text-slate-500'}`} />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar / Sync Bar */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl mb-6 flex flex-wrap items-center gap-4 shadow-lg justify-between">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search chapters..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-200 placeholder:text-slate-600"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {['all', 'low', 'med', 'high'].map((w) => (
                <button
                  key={w}
                  onClick={() => setFilters(prev => ({ ...prev, weightage: w as any }))}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap
                    ${filters.weightage === w ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}
                  `}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {currentTab === 'today' && (
             <div className="flex items-center gap-2">
               {isGoogleConnected ? (
                 <button
                   onClick={syncToGoogleTasks}
                   disabled={isSyncing}
                   className={`
                     flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all
                     ${syncStatus === 'success' ? 'bg-emerald-500 text-white' : 
                       syncStatus === 'error' ? 'bg-red-500 text-white' :
                       'bg-white text-slate-900 hover:bg-slate-200'}
                   `}
                 >
                   {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                    syncStatus === 'success' ? <Check className="w-4 h-4" /> :
                    <Cloud className="w-4 h-4" />}
                   {isSyncing ? 'Syncing...' : syncStatus === 'success' ? 'Synced!' : 'Sync to Google'}
                 </button>
               ) : (
                 <button
                   onClick={() => setIsSettingsOpen(true)}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
                 >
                   <Settings className="w-3.5 h-3.5" /> Configure Sync
                 </button>
               )}
             </div>
          )}
        </div>

        {/* Main List Card - Replaced Table with CSS Grid for Reorder support */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="w-full min-w-[700px] overflow-x-auto">
            {/* Header Row */}
            <div className="grid grid-cols-[3.5rem_minmax(180px,2fr)_repeat(3,minmax(70px,1fr))_minmax(90px,1fr)] gap-2 py-4 border-b border-white/5 bg-white/[0.02] px-0">
              <div className="text-center text-xs font-extrabold text-slate-500 uppercase tracking-widest self-center">Sort</div>
              <div className="text-left pl-2 text-xs font-extrabold text-slate-500 uppercase tracking-widest self-center">Chapter</div>
              {(['col1', 'col2', 'col3'] as const).map((colKey, idx) => (
                <div key={colKey} className="flex flex-col items-center justify-center group">
                  {currentTab !== 'today' && editingCol === colKey ? (
                    <input 
                      autoFocus
                      className="bg-slate-800 text-white text-[10px] font-bold py-1 px-1 rounded border border-indigo-500 w-20 text-center outline-none"
                      value={tempColName}
                      onChange={(e) => setTempColName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleColumnNameChange(colKey, tempColName);
                          setEditingCol(null);
                        }
                      }}
                      onBlur={() => {
                        handleColumnNameChange(colKey, tempColName);
                        setEditingCol(null);
                      }}
                    />
                  ) : (
                    <div 
                      className={`flex items-center gap-1 ${currentTab !== 'today' ? 'cursor-pointer hover:text-indigo-400' : ''} transition-colors`}
                      onClick={() => {
                        if (currentTab !== 'today') {
                          setTempColName(displayedColumnNames[colKey]);
                          setEditingCol(colKey);
                        }
                      }}
                    >
                      <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors text-center">
                        {displayedColumnNames[colKey]}
                      </span>
                      {currentTab !== 'today' && <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  )}
                  {currentTab !== 'today' && (
                    <span className="mt-1 text-[10px] font-bold text-indigo-400/80 bg-indigo-500/10 px-1.5 rounded-full">
                      {colStats[idx]}%
                    </span>
                  )}
                </div>
              ))}
              <div className="text-center text-xs font-extrabold text-slate-500 uppercase tracking-widest self-center">Mastery</div>
            </div>

            {/* List Body */}
            {currentTab === 'today' ? (
               <div className="flex flex-col relative">
                 {(currentViewData as { subject: Subject; chapters: Chapter[] }[]).length > 0 ? (
                   (currentViewData as { subject: Subject; chapters: Chapter[] }[]).map((group) => (
                      <div key={group.subject}>
                        <div className="px-6 py-2 bg-white/5 border-y border-white/5">
                          <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">{group.subject}</h3>
                        </div>
                        {group.chapters.map((chapter, index) => (
                           <ChapterRow
                           key={chapter.id}
                           index={index}
                           chapter={chapter}
                           subject={group.subject}
                           columnNames={columnNames[group.subject]}
                           isDraggingEnabled={false}
                           onToggleCheck={handleToggleCheck}
                           onToggleToday={handleToggleToday}
                           onWeightChange={handleWeightChange}
                           editingId={editingId}
                           startEditing={startEditing}
                           saveEditing={saveEditing}
                           editingName={editingName}
                           setEditingName={setEditingName}
                         />
                        ))}
                      </div>
                   ))
                 ) : (
                   <div className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <CalendarPlus className="w-10 h-10 opacity-30" />
                      <p className="text-lg font-medium text-slate-400">No tasks planned for today</p>
                      <p className="text-xs text-slate-600 max-w-md">
                        Go to a subject tab and hover over the task checkboxes to click the calendar icon <Calendar className="w-3 h-3 inline align-middle mx-1" /> to add them here.
                      </p>
                    </div>
                  </div>
                 )}
               </div>
            ) : isFiltered ? (
              <div className="flex flex-col relative">
                <AnimatePresence>
                  {(currentViewData as Chapter[]).map((chapter, index) => (
                    <ChapterRow
                      key={chapter.id}
                      index={index}
                      chapter={chapter}
                      subject={currentTab as Subject}
                      columnNames={columnNames[currentTab as Subject]}
                      isDraggingEnabled={false}
                      onToggleCheck={handleToggleCheck}
                      onToggleToday={handleToggleToday}
                      onWeightChange={handleWeightChange}
                      editingId={editingId}
                      startEditing={startEditing}
                      saveEditing={saveEditing}
                      editingName={editingName}
                      setEditingName={setEditingName}
                    />
                  ))}
                </AnimatePresence>
                {(currentViewData as Chapter[]).length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <RotateCcw className="w-8 h-8 opacity-50" />
                      <p className="text-sm font-medium">No chapters found matching your filters.</p>
                      <button 
                        onClick={() => setFilters({ search: '', weightage: 'all', status: 'all' })}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wide"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Reorder.Group axis="y" values={data[currentTab]} onReorder={handleReorder} className="flex flex-col relative">
                {data[currentTab].map((chapter, index) => (
                  <ChapterRow
                    key={chapter.id}
                    index={index}
                    chapter={chapter}
                    subject={currentTab as Subject}
                    columnNames={columnNames[currentTab as Subject]}
                    isDraggingEnabled={true}
                    onToggleCheck={handleToggleCheck}
                    onToggleToday={handleToggleToday}
                    onWeightChange={handleWeightChange}
                    editingId={editingId}
                    startEditing={startEditing}
                    saveEditing={saveEditing}
                    editingName={editingName}
                    setEditingName={setEditingName}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        </div>

        <div className="mt-8 mb-12 flex flex-col items-center">
          
          <div className="text-center mb-6">
             <p className="text-slate-600 text-xs font-medium">
                {currentTab === 'today' 
                  ? '✨ Focus on your daily goals here. Items are grouped by subject.'
                  : isFiltered 
                    ? <span className="text-amber-500/80">⚠️ Drag & drop is disabled while filtering</span>
                    : '💡 Pro Tip: Hover over task checkboxes to add them to "Today"'}
              </p>
          </div>

          <div className="relative group w-full max-w-2xl cursor-pointer" onClick={refreshQuote}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md text-center hover:bg-white/[0.02] transition-colors">
              <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-3 opacity-80" />
              <p className="text-slate-300 font-serif italic text-lg leading-relaxed">"{quote}"</p>
              <div className="flex items-center justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Daily Motivation</span>
                <RefreshCw className="w-3 h-3 text-slate-600" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default App;