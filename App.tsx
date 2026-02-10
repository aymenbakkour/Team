
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ClipboardList, 
  PieChart, 
  Plus, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { analyzeMeetingTranscript } from './services/geminiService';
import { MeetingSummary, ActionItem, AnalyticsData } from './types';

const MOCK_ANALYTICS: AnalyticsData[] = [
  { name: 'Mon', efficiency: 65, engagement: 40 },
  { name: 'Tue', efficiency: 78, engagement: 55 },
  { name: 'Wed', efficiency: 90, engagement: 75 },
  { name: 'Thu', efficiency: 72, engagement: 60 },
  { name: 'Fri', efficiency: 85, engagement: 80 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyzer' | 'tasks'>('dashboard');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<MeetingSummary | null>(null);
  const [allTasks, setAllTasks] = useState<ActionItem[]>([]);

  const handleAnalyze = async () => {
    if (!transcriptInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const summary = await analyzeMeetingTranscript(transcriptInput);
      setCurrentSummary(summary);
      setAllTasks(prev => [...prev, ...summary.actionItems]);
      setActiveTab('analyzer');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze transcript. Check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTaskStatus = (id: string) => {
    setAllTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 shadow-sm z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <MessageSquare size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ClarifyAI</h1>
          </div>
          
          <nav className="space-y-1">
            <SidebarLink 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarLink 
              icon={<MessageSquare size={20} />} 
              label="Meeting Analyzer" 
              active={activeTab === 'analyzer'} 
              onClick={() => setActiveTab('analyzer')} 
            />
            <SidebarLink 
              icon={<ClipboardList size={20} />} 
              label="Action Items" 
              active={activeTab === 'tasks'} 
              onClick={() => setActiveTab('tasks')} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Weekly Insight</p>
            <p className="text-sm text-indigo-900 leading-snug">
              Meeting efficiency is up <span className="font-bold">12%</span> this week. Keep discussions concise!
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === 'dashboard' && 'Team Productivity'}
              {activeTab === 'analyzer' && 'Meeting Intelligence'}
              {activeTab === 'tasks' && 'Strategic Backlog'}
            </h2>
            <p className="text-slate-500">Welcome back, Strategist.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('analyzer')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> New Analysis
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Active Tasks" value={allTasks.filter(t => t.status === 'Pending').length} color="indigo" icon={<Clock />} />
              <StatCard label="Completed" value={allTasks.filter(t => t.status === 'Completed').length} color="emerald" icon={<CheckCircle />} />
              <StatCard label="Critical Issues" value={2} color="rose" icon={<AlertCircle />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart size={18}/> Efficiency Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_ANALYTICS}>
                      <defs>
                        <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                      />
                      <Area type="monotone" dataKey="efficiency" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorEff)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart size={18}/> Engagement Metrics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_ANALYTICS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                      />
                      <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyzer' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Input Meeting Transcript</h3>
              <textarea 
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all"
                placeholder="Paste the meeting text or audio transcription here... e.g. 'John discussed the project timeline and Sarah suggested adding more developers...'"
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !transcriptInput}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="animate-spin" size={20} /> Analyzing with Gemini...</>
                  ) : (
                    <><Send size={20} /> Analyze Now</>
                  )}
                </button>
              </div>
            </div>

            {currentSummary && (
              <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-xl space-y-6 border-t-4 border-t-indigo-500 animate-in fade-in duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-2 uppercase">Analysis Result</span>
                    <h4 className="text-2xl font-bold text-slate-900">{currentSummary.topic}</h4>
                    <p className="text-slate-500">{currentSummary.date}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                    currentSummary.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 
                    currentSummary.sentiment === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentSummary.sentiment} Sentiment
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 mb-3 border-b pb-2">Key Discussions</h5>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSummary.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 mb-3 border-b pb-2">Proposed Action Items</h5>
                  <div className="overflow-hidden border border-slate-100 rounded-xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Task</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Owner</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Priority</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSummary.actionItems.map((item, i) => (
                          <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.task}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{item.owner}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                                item.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">{item.deadline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Pending</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Done</span>
                </div>
             </div>
             <div className="p-0">
               {allTasks.length === 0 ? (
                 <div className="py-20 text-center text-slate-400">
                   <ClipboardList className="mx-auto mb-4 opacity-20" size={64} />
                   <p>No action items yet. Use the Meeting Analyzer to generate some.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100">
                   {allTasks.map(task => (
                     <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                       <div className="flex items-center gap-4">
                         <button 
                           onClick={() => toggleTaskStatus(task.id)}
                           className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                             task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'
                           }`}
                         >
                           {task.status === 'Completed' && <CheckCircle size={14} />}
                         </button>
                         <div>
                           <h4 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                             {task.task}
                           </h4>
                           <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                             <span className="bg-slate-100 px-2 py-0.5 rounded uppercase font-bold text-[10px]">{task.owner}</span>
                             <span className="flex items-center gap-1"><Clock size={12}/> {task.deadline}</span>
                             <span className={`${
                                task.priority === 'High' ? 'text-rose-500' : 
                                task.priority === 'Medium' ? 'text-amber-500' : 'text-slate-400'
                             } font-bold`}>{task.priority} Priority</span>
                           </div>
                         </div>
                       </div>
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-slate-400 hover:text-rose-500 px-2 py-1">Delete</button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

const StatCard: React.FC<{ label: string, value: number, color: string, icon: React.ReactNode }> = ({ label, value, color, icon }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500'
  }[color as 'indigo' | 'emerald' | 'rose'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 rounded-full ${colorClasses}`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg text-white ${colorClasses}`}>
          {icon}
        </div>
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-slate-500 font-medium text-sm">{label}</p>
    </div>
  );
};

export default App;
