
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  LayoutDashboard, 
  Server, 
  Settings, 
  Bell, 
  Zap, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AetherNavSrv } from './services/aetherNav';
import { NavRspDta, UsrIdyCtx, SvcTp } from './types';

// Mock user context
const DEMO_USER: UsrIdyCtx = {
  uID: "citi-exec-492",
  rLs: ["prm_usr", "mgr"],
  tID: "citibank-corp",
  loc: "US-NYC",
  sID: "session-77a2-b91c"
};

// Reusable Components
// Fix: children must be optional in the props type definition to allow JSX to correctly validate the component when used with children.
const GlassCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-xl p-4 ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
    {active ? 'Operational' : 'Degraded'}
  </span>
);

const App: React.FC = () => {
  const engine = useMemo(() => AetherNavSrv.gInst(), []);
  const [navData, setNavData] = useState<NavRspDta | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemLoad, setSystemLoad] = useState(0);
  const [metricsData, setMetricsData] = useState<any[]>([]);

  // Simulation loop for metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(engine.cM.systemLoad);
      setMetricsData(prev => [
        ...prev.slice(-20),
        { time: new Date().toLocaleTimeString(), val: Math.floor(engine.cM.systemLoad * 100) }
      ]);
      setLogs(engine.oSC.gRcntEv(20));
    }, 2000);
    return () => clearInterval(interval);
  }, [engine]);

  const handlePredictiveCheck = useCallback(async () => {
    setLoading(true);
    try {
      const res = await engine.gNavSt(DEMO_USER);
      setNavData(res);
      await engine.oSC.recEv("MANUAL_NAV_PRED_REQ", { result: res.isNwNavAct });
    } finally {
      setLoading(false);
    }
  }, [engine]);

  const toggleSvc = useCallback((sID: string, current: boolean) => {
    engine.oSC.upSvcSt(sID, !current);
  }, [engine]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">AetherNav</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Control Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-4">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 bg-slate-800/50 rounded-lg text-sm font-medium transition-colors">
            <LayoutDashboard size={18} className="text-blue-400" />
            System Overview
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors">
            <ShieldCheck size={18} />
            Policy Enforcement
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors">
            <Cpu size={18} />
            Learning Engine
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors">
            <Server size={18} />
            Microservices
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg text-sm font-medium transition-colors">
            <Settings size={18} />
            Global Config
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
              <User size={16} className="text-slate-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-200">Executive 492</p>
              <p className="text-[10px] text-slate-500 truncate">citibank-corp</p>
            </div>
            <LogOut size={14} className="text-slate-500 hover:text-slate-300 cursor-pointer" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search global context..." 
                className="bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-all w-64"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Load</span>
                <span className="text-xs font-mono font-medium text-blue-400">{(systemLoad * 100).toFixed(1)}%</span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Users</span>
                <span className="text-xs font-mono font-medium text-emerald-400">1,248</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <button 
              onClick={handlePredictiveCheck}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Predictive Run
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-12 gap-6">
            
            {/* AI Insight Card */}
            <GlassCard className="col-span-12 lg:col-span-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={120} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Cpu size={16} className="text-blue-400" />
                  Predictive Reasoner
                </h3>
                {navData && (
                  <span className={`text-[10px] font-mono px-2 py-1 rounded bg-slate-800 ${navData.isNwNavAct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    CONF_SCORE: {(navData.cnfdSc * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-center py-4">
                {!navData ? (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                      <Zap className="text-slate-500" size={20} />
                    </div>
                    <p className="text-xs text-slate-500">Run manual prediction to update navigation heuristics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {navData.isNwNavAct ? (
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-rose-500 shrink-0" size={20} />
                      )}
                      <div>
                        <p className="text-sm font-bold">{navData.isNwNavAct ? 'New Nav Active' : 'Fallback Engaged'}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed italic">"{navData.dSc}"</p>
                      </div>
                    </div>
                    {navData.fTrCtx && (
                      <div className="bg-slate-950/50 rounded-lg p-3 font-mono text-[10px] space-y-1 border border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-600">CTX_LOAD:</span>
                          <span className="text-blue-400">{(navData.fTrCtx.load * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">POLICY_AUTH:</span>
                          <span className="text-emerald-400">{navData.fTrCtx.auth}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Performance Metrics Area Chart */}
            <GlassCard className="col-span-12 lg:col-span-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" />
                  System Load Telemetry
                </h3>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Compute Pressure</span>
                   </div>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6', fontSize: '10px', fontFamily: 'monospace' }}
                      labelStyle={{ color: '#64748b', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Service Status List */}
            <GlassCard className="col-span-12 lg:col-span-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Server size={16} className="text-blue-400" />
                Service Health Matrix
              </h3>
              <div className="space-y-3">
                {engine.oSC.extSvcRgs.map(svc => (
                  <div key={svc.sID} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${svc.sAct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <Activity size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{svc.sNm}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{svc.sID} • {svc.sTp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge active={svc.sAct} />
                      <button 
                        onClick={() => toggleSvc(svc.sID, svc.sAct)}
                        className="p-1.5 rounded-md bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                      >
                        <Settings size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Event Log / Observability */}
            <GlassCard className="col-span-12 lg:col-span-7 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Terminal size={16} className="text-blue-400" />
                  Live Observability Feed
                </h3>
                <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded text-[10px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  STREAM_ACTIVE
                </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 hover:bg-slate-800/20 p-1 rounded group">
                    <span className="text-slate-600 shrink-0">{log.tS.split('T')[1].split('.')[0]}</span>
                    <span className="text-blue-400 font-bold shrink-0">{log.eNm}</span>
                    <span className="text-slate-400 truncate">
                      {JSON.stringify(log.dTls)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>

        {/* Footer / System Status Bar */}
        <footer className="h-8 border-t border-slate-800 bg-slate-900/50 flex items-center px-8 justify-between">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <CheckCircle2 size={12} className="text-emerald-500" />
               <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Auth_Protocol: Active</span>
             </div>
             <div className="flex items-center gap-2">
               <AlertTriangle size={12} className="text-amber-500" />
               <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Compliance_Scan: Scheduled</span>
             </div>
          </div>
          <div className="text-[10px] text-slate-600 font-mono uppercase">
            Build v2.5.1-aethernav • Node: NY-4-A
          </div>
        </footer>

        {/* Global Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white tracking-widest uppercase italic">Synthesizing AI Reasoning</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Predictive engine is querying Gemini Node 3...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
