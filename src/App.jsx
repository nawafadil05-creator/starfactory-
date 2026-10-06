import React, { useState } from 'react';
import { 
  Activity, Shield, Database, Users, Package, Sliders, 
  AlertTriangle, CheckCircle, Lock, Unlock, Play, Square,
  Thermometer, Gauge, Clock, ChevronRight, Menu, X, Star
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('machines');
  const [role, setRole] = useState('SUPERVISOR');
  const [isLocked, setIsLocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  // Machine state
  const [machines, setMachines] = useState([
    { id: 'M1', name: 'Main Cutter 01', type: 'Cutting Unit', worker: 'Ali Khan', status: 'RUNNING', speed: 85, temp: 42, alert: null },
    { id: 'M2', name: 'Packing Box 02', type: 'Packaging Unit', worker: 'Usman Raza', status: 'RUNNING', speed: 92, temp: 38, alert: null },
    { id: 'M3', name: 'Welder Station 03', type: 'Welding Unit', worker: 'Zohaib Hassan', status: 'STOPPED', speed: 0, temp: 25, alert: 'Heat Threshold' },
    { id: 'M4', name: 'Label Printer 04', type: 'Printing Unit', worker: 'Ahmed Noor', status: 'STANDBY', speed: 0, temp: 28, alert: null },
    { id: 'M5', name: 'Assembly Arm 05', type: 'Robotics', worker: 'Automated Bot A1', status: 'MAINTENANCE', speed: 0, temp: 22, alert: 'System Audit' },
  ]);

  // Inventory state
  const [inventory] = useState([
    { id: 'RAW-01', name: 'Steel Sheets (Grade A)', category: 'Raw Material', stock: 4200, unit: 'kg', status: 'OPTIMAL' },
    { id: 'CHEM-03', name: 'Industrial Adhesive', category: 'Chemicals', stock: 180, unit: 'Liters', status: 'LOW' },
    { id: 'FAST-08', name: 'Star-Bolt M8', category: 'Fasteners', stock: 12500, unit: 'units', status: 'OPTIMAL' },
    { id: 'BOX-02', name: 'Star Crate Alpha', category: 'Finished Goods', stock: 840, unit: 'boxes', status: 'OPTIMAL' },
    { id: 'FG-01', name: 'Star Panel Premium', category: 'Finished Goods', stock: 120, unit: 'units', status: 'LOW' },
  ]);

  // Worker Roster state
  const [workers] = useState([
    { id: 'W-101', name: 'Ali Khan', role: 'Machine Operator', shift: 'Morning (08:00 - 16:00)', assigned: 'Main Cutter 01', status: 'ON_DUTY' },
    { id: 'W-102', name: 'Usman Raza', role: 'Packaging Tech', shift: 'Morning (08:00 - 16:00)', assigned: 'Packing Box 02', status: 'ON_DUTY' },
    { id: 'W-103', name: 'Zohaib Hassan', role: 'Welding Specialist', shift: 'Morning (08:00 - 16:00)', assigned: 'Welder Station 03', status: 'ON_DUTY' },
    { id: 'W-104', name: 'Ahmed Noor', role: 'Quality Analyst', shift: 'Morning (08:00 - 16:00)', assigned: 'Label Printer 04', status: 'STANDBY' },
    { id: 'W-105', name: 'Sara Tariq', role: 'Shift Lead', shift: 'Morning (08:00 - 16:00)', assigned: 'Floor Supervisor', status: 'ON_DUTY' },
  ]);

  // Logs state
  const [logs] = useState([
    { id: 1, time: '13:14:10', type: 'INFO', message: 'Main Cutter 01 speed calibrated to 85% by operator Ali Khan' },
    { id: 2, time: '12:45:22', type: 'WARNING', message: 'Industrial Adhesive stock dipped below threshold (180 L)' },
    { id: 3, time: '11:02:00', type: 'SECURITY', message: 'Supervisor access permissions granted to user session' },
    { id: 4, time: '10:15:30', type: 'INFO', message: 'Welding safety protocol initiated - STOPPED' },
  ]);

  const toggleMachineStatus = (id) => {
    if (role === 'WORKER') return;
    setMachines(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
        return { ...m, status: nextStatus, speed: nextStatus === 'RUNNING' ? 75 : 0 };
      }
      return m;
    }));
  };

  const handleSpeedChange = (id, newSpeed) => {
    if (role === 'WORKER') return;
    setMachines(prev => prev.map(m => id === m.id ? { ...m, speed: Number(newSpeed) } : m));
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsLocked(false);
      setPasscode('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const activeMachinesCount = machines.filter(m => m.status === 'RUNNING').length;
  const avgEfficiency = Math.round(machines.reduce((acc, m) => acc + m.speed, 0) / machines.length);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-full text-amber-600 mb-3">
              <Star className="w-8 h-8 fill-amber-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">STAR FACTORY CONTROL</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">System Locked Security Mode</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Enter Passcode (1234)</label>
              <input
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              {error && <p className="text-xs text-red-600 mt-2 text-center">Invalid Security Passcode</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Unlock className="w-4 h-4" /> Unlock Console
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            Star Factory OS • Secure Access Control Architecture
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col max-w-4xl mx-auto border-x border-slate-200 shadow-sm">
      {/* Top Header */}
      <header className="bg-blue-950 border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-600">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className='text-amber-400'STAR FACTORY >STAR FACTORY</span> <span className="text-xs font-semibold text-amber-700 border border-amber-300 bg-amber-100 px-1.5 py-0.5 rounded">OS</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Industrial Monitoring & Automation Platform</p>
          </div>
        </div>

        {/* Role Switcher & Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 shadow-sm">
            <span className="text-slate-500">Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent text-amber-600 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="WORKER" className="bg-white text-slate-800">Worker (Read Only)</option>
              <option value="SUPERVISOR" className="bg-white text-slate-800">Supervisor</option>
              <option value="ADMIN" className="bg-white text-slate-800">Administrator</option>
            </select>
          </div>

          <button
            onClick={() => setIsLocked(true)}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
            title="Lock Console"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 space-y-6 bg-white">
        {/* KPI / Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Units</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{activeMachinesCount} <span className="text-xs text-slate-400 font-normal">/ {machines.length}</span></p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Floor Speed Avg</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{avgEfficiency}%</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-100 border border-amber-300 text-amber-700 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Stock Alerts</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">2 Attention</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('machines')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'machines'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" /> Machine Floor
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Materials & Stock
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'workers'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Worker Roster
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" /> Database Logs
          </button>
        </div>

        {/* Tab Content: Machines */}
        {activeTab === 'machines' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Machine Control Floor</h2>
              <span className="text-xs text-slate-500">Real-time telemetry, heat thresholds, and operational overrides</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machines.map((m) => (
                <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 relative overflow-hidden shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{m.id}</span>
                        <h3 className="font-semibold text-slate-900">{m.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{m.type} • Operator: <span className="text-slate-700 font-medium">{m.worker}</span></p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      m.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      m.status === 'STOPPED' ? 'bg-red-100 text-red-800 border border-red-300' :
                      m.status === 'STANDBY' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  {/* Telemetry data */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Operating Speed</span>
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-slate-900">{m.speed}%</span>
                        {role !== 'WORKER' && (
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={m.speed}
                            disabled={m.status !== 'RUNNING'}
                            onChange={(e) => handleSpeedChange(m.id, e.target.value)}
                            className="w-16 accent-amber-500 cursor-pointer disabled:opacity-30"
                          />
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Core Temp</span>
                        <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className={`text-lg font-bold ${m.temp > 40 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {m.temp}°C
                      </span>
                    </div>
                  </div>

                  {/* Control Button */}
                  <div className="pt-2 flex items-center justify-between">
                    {m.alert ? (
                      <span className="text-xs text-red-600 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> {m.alert}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Live Telemetry Active</span>
                    )}

                    {role !== 'WORKER' && (
                      <button
                        onClick={() => toggleMachineStatus(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                          m.status === 'RUNNING'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        {m.status === 'RUNNING' ? (
                          <><Square className="w-3 h-3 fill-current" /> Stop Unit</>
                        ) : (
                          <><Play className="w-3 h-3 fill-current" /> Start Unit</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Inventory & Stock Tracking</h2>
              <span className="text-xs text-slate-500">Raw materials and finished goods inventory logs</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Item ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Stock Quantity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-slate-500">{item.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-500">{item.category}</td>
                        <td className="p-3 font-medium text-slate-800">{item.stock} {item.unit}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Workers */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Shift Roster & Operators</h2>
              <span className="text-xs text-slate-500">Personnel assignments and active duty status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workers.map((w) => (
                <div key={w.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start justify-between shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm">{w.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{w.id}</span>
                    </div>
                    <p className="text-xs text-amber-700 font-medium">{w.role}</p>
                    <p className="text-xs text-slate-600">Assigned: <span className="text-slate-900 font-medium">{w.assigned}</span></p>
                    <p className="text-[11px] text-slate-500">{w.shift}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    w.status === 'ON_DUTY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Database Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">System Audit Logs</h2>
              <span className="text-xs text-slate-500">Historical records & automation events</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2 shadow-sm">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-2 border-b border-slate-200 last:border-none last:pb-0">
                  <span className="text-slate-400 shrink-0">[{log.time}]</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                    log.type === 'INFO' ? 'bg-blue-100 text-blue-800' :
                    log.type === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-700">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-blue-950 border-t border-slate-200 p-4 text-center text-xs text-slate-500 flex items-center justify-between">
        <span>STAR FACTORY CONTROL v2.4</span>
        <span className="flex items-center gap-1 font-medium text-emerald-700">
          <Shield className="w-3.5 h-3.5 text-emerald-600" /> System Online & Protected
        </span>
      </footer>
    </div>
  );
}