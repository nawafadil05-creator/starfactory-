import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Activity, Shield, Database, Users, Package, Sliders, 
  AlertTriangle, Lock, Play, Square, Thermometer, Gauge, 
  X, Star, Settings, UserPlus, Key, Eye, Phone, Home, User, 
  ShoppingCart, Calendar, MapPin, History, FileText, StickyNote,
  Video, Camera, Radio, BookOpen, PlusCircle, DollarSign
} from 'lucide-react';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''; 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('khata');
  const [role, setRole] = useState('ADMIN');
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  // --- Settings & User Management State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('1234');
  const [newAdminPassInput, setNewAdminPassInput] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);

  // Users State (from Supabase)
  const [usersList, setUsersList] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('SUPERVISOR');
  const [newUserCode, setNewUserCode] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  // --- Khata Security State ---
  const [isKhataUnlocked, setIsKhataUnlocked] = useState(false);
  const [khataPasscode, setKhataPasscode] = useState('7890');
  const [inputKhataCode, setInputKhataCode] = useState('');
  const [khataAuthError, setKhataAuthError] = useState(false);
  
  // Pending Navigation State
  const [pendingTabSwitch, setPendingTabSwitch] = useState(null);
  const [showExitCodeModal, setShowExitCodeModal] = useState(false);
  const [exitCodeInput, setExitCodeInput] = useState('');
  const [exitCodeError, setExitCodeError] = useState(false);

  // Reminders State
  const [reminderNote, setReminderNote] = useState('Night shift Maintenance Audit at 11:00 PM');

  // Khata Modals & Data State (from Supabase)
  const [selectedKhataEntry, setSelectedKhataEntry] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaidQty, setNewPaidQty] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [saveAuthCodeInput, setSaveAuthCodeInput] = useState('');
  const [saveCodeError, setSaveCodeError] = useState(false);

  const [khataLedger, setKhataLedger] = useState([]);

  // Sub-tabs State
  const [inventorySubTab, setInventorySubTab] = useState('raw');
  const [workerShiftTab, setWorkerShiftTab] = useState('DAY');
  const [ordersSubTab, setOrdersSubTab] = useState('orders_made');

  // Selected Detail Modals
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState(null);

  // Orders Management Data State (from Supabase)
  const [ordersMade, setOrdersMade] = useState([]);
  const [ordersReceived, setOrdersReceived] = useState([]);

  // CCTV State (from Supabase)
  const [cctvCameras, setCctvCameras] = useState([]);

  // Machine Floor State (from Supabase)
  const [machines, setMachines] = useState([]);

  // Inventory / Raw Materials & Made Items State (from Supabase)
  const [rawMaterials, setRawMaterials] = useState([]);
  const [madeItems, setMadeItems] = useState([]);

  // Worker & Attendance State (from Supabase)
  const [workersList, setWorkersList] = useState([]);

  // Logs State (from Supabase)
  const [logs, setLogs] = useState([]);

  // Loading & Error states for DB fetches
  const [isLoading, setIsLoading] = useState(true);

  // --- SUPABASE FETCH EFFECT ---
  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      try {
        const [
          { data: users },
          { data: khata },
          { data: madeOrders },
          { data: receivedOrders },
          { data: cctv },
          { data: machineData },
          { data: rawMat },
          { data: madeItms },
          { data: workers },
          { data: systemLogs }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('khata_ledger').select('*'),
          supabase.from('orders_made').select('*'),
          supabase.from('orders_received').select('*'),
          supabase.from('cctv_cameras').select('*'),
          supabase.from('machines').select('*'),
          supabase.from('raw_materials').select('*'),
          supabase.from('made_items').select('*'),
          supabase.from('workers').select('*'),
          supabase.from('logs').select('*')
        ]);

        if (users) setUsersList(users);
        if (khata) setKhataLedger(khata);
        if (madeOrders) setOrdersMade(madeOrders);
        if (receivedOrders) setOrdersReceived(receivedOrders);
        if (cctv) setCctvCameras(cctv);
        if (machineData) setMachines(machineData);
        if (rawMat) setRawMaterials(rawMat);
        if (madeItms) setMadeItems(madeItms);
        if (workers) setWorkersList(workers);
        if (systemLogs) setLogs(systemLogs);
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // --- HANDLERS & CALCULATIONS ---
  const activeMachinesCount = machines.filter(m => m.status === 'RUNNING').length;
  const avgEfficiency = machines.length > 0 
    ? Math.round(machines.reduce((acc, m) => acc + (m.speed || 0), 0) / machines.length)
    : 0;

  const handleKhataUnlock = (e) => {
    e.preventDefault();
    if (inputKhataCode === khataPasscode) {
      setIsKhataUnlocked(true);
      setKhataAuthError(false);
      setInputKhataCode('');
    } else {
      setKhataAuthError(true);
    }
  };

  const handleTabChange = (targetTab) => {
    if (activeTab === 'khata' && isKhataUnlocked) {
      setPendingTabSwitch(targetTab);
      setShowExitCodeModal(true);
    } else {
      setActiveTab(targetTab);
    }
  };

  const confirmKhataExit = (e) => {
    e.preventDefault();
    if (exitCodeInput === khataPasscode) {
      setIsKhataUnlocked(false);
      setShowExitCodeModal(false);
      setExitCodeError(false);
      setExitCodeInput('');
      if (pendingTabSwitch) {
        setActiveTab(pendingTabSwitch);
        setPendingTabSwitch(null);
      }
    } else {
      setExitCodeError(true);
    }
  };

  const handleAddPaymentTransaction = async (e) => {
    e.preventDefault();
    if (saveAuthCodeInput !== khataPasscode) {
      setSaveCodeError(true);
      return;
    }

    if (!selectedKhataEntry || !newPaymentAmount) return;

    const addedAmount = Number(newPaymentAmount);
    const addedQty = Number(newPaidQty || 0);

    const updatedLedger = khataLedger.map(entry => {
      if (entry.orderId === selectedKhataEntry.orderId) {
        return {
          ...entry,
          totalPaidAmount: (entry.totalPaidAmount || 0) + addedAmount,
          quantityPaidFor: (entry.quantityPaidFor || 0) + addedQty,
          transactions: [
            ...(entry.transactions || []),
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Payment Received',
              amount: addedAmount,
              paidQty: addedQty,
              note: paymentNote || 'New Purchase Payment'
            }
          ]
        };
      }
      return entry;
    });

    setKhataLedger(updatedLedger);

    // Sync back to Supabase
    const targetEntry = updatedLedger.find(e => e.orderId === selectedKhataEntry.orderId);
    if (targetEntry) {
      await supabase
        .from('khata_ledger')
        .update({
          totalPaidAmount: targetEntry.totalPaidAmount,
          quantityPaidFor: targetEntry.quantityPaidFor,
          transactions: targetEntry.transactions
        })
        .eq('orderId', targetEntry.orderId);
    }

    setNewPaymentAmount('');
    setNewPaidQty('');
    setPaymentNote('');
    setSaveAuthCodeInput('');
    setSaveCodeError(false);
    setShowAddPaymentModal(false);
    setSelectedKhataEntry(null);
  };

  const markWorkerAttendance = async (workerId, newStatus) => {
    if (role === 'WORKER') return;
    const updated = workersList.map(w => {
      if (w.id === workerId) {
        const updatedAttendance = [...(w.attendance || [])];
        updatedAttendance[updatedAttendance.length - 1] = newStatus;
        return { ...w, todayStatus: newStatus, attendance: updatedAttendance };
      }
      return w;
    });
    setWorkersList(updated);

    const target = updated.find(w => w.id === workerId);
    if (target) {
      await supabase.from('workers').update({
        todayStatus: target.todayStatus,
        attendance: target.attendance
      }).eq('id', workerId);
    }
  };

  const adjustOvertime = async (workerId, adjustment) => {
    if (role === 'WORKER') return;
    const updated = workersList.map(w => {
      if (w.id === workerId) {
        return { ...w, overtimeHours: Math.max(0, (w.overtimeHours || 0) + adjustment) };
      }
      return w;
    });
    setWorkersList(updated);

    const target = updated.find(w => w.id === workerId);
    if (target) {
      await supabase.from('workers').update({
        overtimeHours: target.overtimeHours
      }).eq('id', workerId);
    }
  };

  const adjustPay = async (workerId, adjustment) => {
    if (role === 'WORKER') return;
    const updated = workersList.map(w => {
      if (w.id === workerId) {
        return { ...w, payAdjustment: (w.payAdjustment || 0) + adjustment };
      }
      return w;
    });
    setWorkersList(updated);

    const target = updated.find(w => w.id === workerId);
    if (target) {
      await supabase.from('workers').update({
        payAdjustment: target.payAdjustment
      }).eq('id', workerId);
    }
  };

  const toggleMachineStatus = async (id) => {
    if (role === 'WORKER') return;
    const updated = machines.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
        return { ...m, status: nextStatus, speed: nextStatus === 'RUNNING' ? 75 : 0 };
      }
      return m;
    });
    setMachines(updated);

    const target = updated.find(m => m.id === id);
    if (target) {
      await supabase.from('machines').update({
        status: target.status,
        speed: target.speed
      }).eq('id', id);
    }
  };

  const handleSpeedChange = async (id, newSpeed) => {
    if (role === 'WORKER') return;
    const speedVal = Number(newSpeed);
    const updated = machines.map(m => id === m.id ? { ...m, speed: speedVal } : m);
    setMachines(updated);

    await supabase.from('machines').update({ speed: speedVal }).eq('id', id);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    let correctPasscode = selectedRole === 'ADMIN' ? adminPasscode : selectedRole === 'SUPERVISOR' ? '5678' : '9012';
    if (passcode === correctPasscode) {
      setRole(selectedRole);
      setIsLocked(false);
      setError(false);
      setPasscode('');
    } else {
      setError(true);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserCode || !newUserPass) return;
    
    const newUserObj = {
      name: newUserName,
      role: newUserRole,
      secretCode: newUserCode,
      secretPassword: newUserPass
    };

    const { data, error } = await supabase.from('users').insert([newUserObj]).select();

    if (data && data.length > 0) {
      setUsersList(prev => [...prev, data[0]]);
    } else {
      setUsersList(prev => [...prev, { ...newUserObj, id: Date.now() }]);
    }

    setNewUserName('');
    setNewUserCode('');
    setNewUserPass('');
  };

  const handleChangeAdminPass = (e) => {
    e.preventDefault();
    if (newAdminPassInput.trim()) {
      setAdminPasscode(newAdminPassInput);
      setNewAdminPassInput('');
      setPassChangeSuccess(true);
      setTimeout(() => setPassChangeSuccess(false), 3000);
    }
  };

  const calculateEarnings = (attendanceArr = [], rate = 0, otHours = 0, payAdjust = 0) => {
    const presentDays = attendanceArr.filter(day => day === 'P' || day === 'OT').length;
    const otBonus = otHours * 100;
    return (presentDays * rate) + otBonus + payAdjust;
  };

  const filteredWorkers = workersList.filter(w => w.shiftType === workerShiftTab || workerShiftTab === 'OVERTIME');

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
              <label className="block text-xs font-medium text-slate-500 mb-1">Select Access Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700 outline-none"
              >
                <option value="ADMIN">Administrator</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="WORKER">Worker (Read Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Passcode:</label>
              <input
                type="password"
                placeholder="Enter Access Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">Invalid Passcode for selected role.</p>}

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg">
              Unlock Access
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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-blue-950 border-b border-blue-900 px-6 py-3.5 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-600 shadow-sm">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-400">STAR FACTORY</span> 
              <span className="text-[10px] font-semibold text-amber-700 border border-amber-300 bg-amber-100 px-1.5 py-0.5 rounded">OS</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-blue-900 border border-blue-800 rounded-lg px-3 py-1 text-xs flex items-center gap-2 text-slate-200 font-medium">
            <span className="text-slate-400">Role:</span>
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              {role === 'ADMIN' ? 'Administrator' : role === 'SUPERVISOR' ? 'Supervisor' : 'Worker'}
            </span>
          </div>

          <button
            onClick={() => {
              if (role === 'ADMIN') {
                setIsSettingsOpen(true);
              } else {
                alert('Only Administrator can access Control Settings.');
              }
            }}
            className="p-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-700 rounded-lg text-amber-400 text-xs font-semibold flex items-center gap-1"
            title="Admin Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button onClick={() => setIsLocked(true)} className="p-1.5 bg-red-950 hover:bg-red-900 border border-red-800 rounded-lg text-red-300">
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-60 bg-slate-900 border-r border-slate-800 p-3 flex flex-col justify-between shrink-0 shadow-inner">
          <div className="space-y-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Navigation Menu</div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabChange('khata')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'khata' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <BookOpen className="w-4 h-4" /> Khata Ledger
              </button>

              <button
                onClick={() => handleTabChange('orders')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'orders' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <ShoppingCart className="w-4 h-4" /> Orders Management
              </button>

              <button
                onClick={() => handleTabChange('machines')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'machines' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Sliders className="w-4 h-4" /> Machine Floor
              </button>

              <button
                onClick={() => handleTabChange('inventory')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Package className="w-4 h-4" /> Materials & Stock
              </button>

              <button
                onClick={() => handleTabChange('attendance')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'attendance' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Calendar className="w-4 h-4" /> Attendance & Overtime
              </button>

              <button
                onClick={() => handleTabChange('cctv')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'cctv' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Video className="w-4 h-4" /> CCTV Surveillance
              </button>

              <button
                onClick={() => handleTabChange('workers')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'workers' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Users className="w-4 h-4" /> Worker Roster
              </button>

              {role === 'ADMIN' && (
                <button
                  onClick={() => handleTabChange('logs')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeTab === 'logs' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <Database className="w-4 h-4" /> Database Logs
                </button>
              )}
            </nav>
          </div>

          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-[10px]">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold"><Shield className="w-3.5 h-3.5" /> Security Guarded</div>
            <p className="mt-1">Khata Code: <span className="text-amber-400 font-mono font-bold">Protected ({khataPasscode})</span></p>
          </div>
        </aside>

        {/* Dashboard Main Display */}
        <main className="flex-1 p-5 space-y-5 bg-white overflow-y-auto">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button 
              onClick={() => handleTabChange('khata')}
              className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center gap-2.5 text-left shadow-sm"
            >
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0"><BookOpen className="w-4 h-4" /></div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Khata Ledger</p>
                <p className="text-sm font-black text-slate-900">Rs 570,000 Due</p>
              </div>
            </button>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0"><Activity className="w-4 h-4" /></div>
              <div className="truncate">
                <p className="text-[10px] font-medium text-slate-500">Active Units</p>
                <p className="text-sm font-bold text-slate-900">{activeMachinesCount} / {machines.length}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0"><AlertTriangle className="w-4 h-4" /></div>
              <div className="truncate">
                <p className="text-[10px] font-medium text-slate-500">Floor Speed</p>
                <p className="text-sm font-bold text-slate-900">{avgEfficiency}%</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0"><Users className="w-4 h-4" /></div>
              <div className="truncate">
                <p className="text-[10px] font-medium text-slate-500">Attendance</p>
                <p className="text-sm font-bold text-indigo-900">42 / 50</p>
              </div>
            </div>

            <button 
              onClick={() => handleTabChange('orders')}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-300 p-3 rounded-xl flex items-center gap-2.5 text-left transition-all"
            >
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0"><ShoppingCart className="w-4 h-4" /></div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-amber-800 uppercase">Today's Orders</p>
                <p className="text-sm font-black text-slate-900">Active →</p>
              </div>
            </button>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <StickyNote className="w-3 h-3 text-amber-500" /> Reminder
              </span>
              <input 
                type="text" 
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                className="text-[11px] font-medium bg-transparent text-slate-800 border-b border-transparent hover:border-slate-300 outline-none w-full truncate"
              />
            </div>
          </div>

          {/* TAB: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-slate-800 uppercase">Factory Orders Center</h2>
                <span className="text-[11px] text-slate-500">All Client & Vendor Shipments</span>
              </div>

              <div className="flex border-b border-slate-200 gap-4">
                <button 
                  onClick={() => setOrdersSubTab('orders_made')} 
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${ordersSubTab === 'orders_made' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Orders I Made (Purchases)
                </button>
                <button 
                  onClick={() => setOrdersSubTab('orders_received')} 
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${ordersSubTab === 'orders_received' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Orders I Received (Sales)
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5 w-1/6">Order ID</th>
                      <th className="p-2.5 w-1/4">Order / Item Name</th>
                      <th className="p-2.5 w-1/6">Quantity</th>
                      <th className="p-2.5 w-1/6">City</th>
                      <th className="p-2.5 text-center w-28">View Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {(ordersSubTab === 'orders_made' ? ordersMade : ordersReceived).map((ord) => (
                      <tr key={ord.orderId} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-800">{ord.orderId}</td>
                        <td className="p-2.5 font-semibold text-slate-900 truncate">{ord.itemName}</td>
                        <td className="p-2.5 font-mono text-slate-800">{ord.quantity}</td>
                        <td className="p-2.5 text-amber-700 font-medium">{ord.city}</td>
                        <td className="p-2.5 text-center">
                          <button 
                            onClick={() => setSelectedOrderDetail(ord)} 
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1 mx-auto shadow-sm"
                          >
                            <FileText className="w-3 h-3" /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: WORKER ROSTER */}
          {activeTab === 'workers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-800 uppercase">Worker Shift Roster</h2>
                <span className="text-[11px] text-slate-500">Structured personnel roster and assignees</span>
              </div>

              <div className="flex border-b border-slate-200 gap-4">
                <button
                  onClick={() => setWorkerShiftTab('DAY')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${workerShiftTab === 'DAY' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Day Shift
                </button>
                <button
                  onClick={() => setWorkerShiftTab('NIGHT')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${workerShiftTab === 'NIGHT' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Night Shift
                </button>
                <button
                  onClick={() => setWorkerShiftTab('OVERTIME')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${workerShiftTab === 'OVERTIME' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Overtime
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5 w-1/4">Worker Name</th>
                      <th className="p-2.5 w-1/4">Designation</th>
                      <th className="p-2.5 w-1/4">Assigned Unit</th>
                      <th className="p-2.5 text-center w-28">Employee Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {filteredWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-900">{w.name}</td>
                        <td className="p-2.5 text-slate-600">{w.role}</td>
                        <td className="p-2.5 text-amber-700 font-medium">{w.assigned}</td>
                        <td className="p-2.5 text-center">
                          <button 
                            onClick={() => setSelectedWorkerDetail(w)} 
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MACHINE FLOOR */}
          {activeTab === 'machines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Machine Control Floor</h2>
                <span className="text-[11px] text-slate-500">Real-time telemetry and operational overrides</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {machines.map((m) => (
                  <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{m.id}</span>
                          <h3 className="font-semibold text-slate-900 text-xs">{m.name}</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{m.type} • Operator: <span className="text-slate-700 font-medium">{m.worker}</span></p>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        m.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        m.status === 'STOPPED' ? 'bg-red-100 text-red-800 border border-red-300' :
                        m.status === 'STANDBY' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>Operating Speed</span>
                          <Gauge className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-base font-bold text-slate-900">{m.speed}%</span>
                          {role !== 'WORKER' && (
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={m.speed}
                              disabled={m.status !== 'RUNNING'}
                              onChange={(e) => handleSpeedChange(m.id, e.target.value)}
                              className="w-14 accent-amber-500 cursor-pointer disabled:opacity-30"
                            />
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>Core Temp</span>
                          <Thermometer className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className={`text-base font-bold ${m.temp > 40 ? 'text-amber-600' : 'text-slate-900'}`}>
                          {m.temp}°C
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      {m.alert ? (
                        <span className="text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3" /> {m.alert}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Live Telemetry Active</span>
                      )}

                      {role !== 'WORKER' && (
                        <button
                          onClick={() => toggleMachineStatus(m.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm ${
                            m.status === 'RUNNING'
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                          }`}
                        >
                          {m.status === 'RUNNING' ? (
                            <><Square className="w-3 h-3 fill-current" /> Stop</>
                          ) : (
                            <><Play className="w-3 h-3 fill-current" /> Start</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MATERIALS & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase">Materials & Stock Inventory</h2>

              <div className="flex border-b border-slate-200 gap-4">
                <button
                  onClick={() => setInventorySubTab('raw')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${inventorySubTab === 'raw' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Raw Materials
                </button>
                <button
                  onClick={() => setInventorySubTab('made')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 ${inventorySubTab === 'made' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-slate-500'}`}
                >
                  Made Items (Inventory)
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Item ID / Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 font-mono">Stock Quantity</th>
                      <th className="p-3 font-mono">Pre-ordered Stock</th>
                      <th className="p-3 font-mono">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {inventorySubTab === 'raw' ? (
                      rawMaterials.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                          </td>
                          <td className="p-3 text-slate-500">{item.category}</td>
                          <td className="p-3 font-mono font-bold text-emerald-700">{item.stock} {item.unit}</td>
                          <td className="p-3 font-mono font-bold text-amber-600">{item.preOrdered} {item.unit}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              item.status === 'LOW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      madeItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                          </td>
                          <td className="p-3 text-slate-500">{item.category}</td>
                          <td className="p-3 font-mono font-bold text-emerald-700">{item.stock} {item.unit}</td>
                          <td className="p-3 font-mono text-slate-400">-</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE & OVERTIME */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-800 uppercase">Worker Attendance & Overtime Tracker</h2>
                <span className="text-[11px] text-slate-500">
                  {role === 'WORKER' ? 'Showing Your 7-Day Attendance History' : 'Full Month (30-Day) System Attendance Ledger'}
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Worker Name</th>
                        <th className="p-3">Shift</th>
                        <th className="p-3 text-center">
                          {role === 'WORKER' ? '7-Day Record' : '30-Day Attendance Grid'}
                        </th>
                        <th className="p-3 text-center">Overtime</th>
                        {(role === 'ADMIN' || role === 'SUPERVISOR') && <th className="p-3 text-center">Mark Status</th>}
                        {(role === 'ADMIN' || role === 'SUPERVISOR') && <th className="p-3 text-center">Overtime (+ / -)</th>}
                        {(role === 'ADMIN' || role === 'SUPERVISOR') && <th className="p-3 text-center">Pay Adjustment</th>}
                        {(role === 'ADMIN' || role === 'SUPERVISOR') && <th className="p-3">Total Earnings</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {workersList.map((w) => {
                        const isWorkerRole = role === 'WORKER';
                        const attendanceData = (isWorkerRole ? w.attendance : w.monthlyAttendance) || [];
                        const totalEarnings = calculateEarnings(w.attendance, w.dailyRate, w.overtimeHours, w.payAdjustment);

                        return (
                          <tr key={w.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">{w.name}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{w.shiftType}</span></td>
                            <td className="p-3">
                              <div className="flex justify-center flex-wrap gap-1 max-w-xs mx-auto">
                                {attendanceData.map((st, i) => (
                                  <span key={i} className={`w-3.5 h-3.5 flex items-center justify-center rounded text-[8px] font-bold ${st === 'P' ? 'bg-emerald-100 text-emerald-800' : st === 'OT' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'}`}>
                                    {st}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-purple-700">{w.overtimeHours} hrs</td>
                            
                            {(role === 'ADMIN' || role === 'SUPERVISOR') && (
                              <td className="p-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => markWorkerAttendance(w.id, 'P')} className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]">P</button>
                                  <button onClick={() => markWorkerAttendance(w.id, 'A')} className="px-2 py-1 bg-red-600 text-white font-bold rounded text-[10px]">A</button>
                                </div>
                              </td>
                            )}

                            {(role === 'ADMIN' || role === 'SUPERVISOR') && (
                              <td className="p-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => adjustOvertime(w.id, 1)} className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded hover:bg-purple-200 text-[10px]">+OT</button>
                                  <button onClick={() => adjustOvertime(w.id, -1)} className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded hover:bg-purple-200 text-[10px]">-OT</button>
                                </div>
                              </td>
                            )}

                            {(role === 'ADMIN' || role === 'SUPERVISOR') && (
                              <td className="p-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => adjustPay(w.id, 100)} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded hover:bg-emerald-200 text-[10px]">+Pay</button>
                                  <button onClick={() => adjustPay(w.id, -100)} className="px-1.5 py-0.5 bg-red-100 text-red-800 font-bold rounded hover:bg-red-200 text-[10px]">-Pay</button>
                                </div>
                              </td>
                            )}

                            {(role === 'ADMIN' || role === 'SUPERVISOR') && (
                              <td className="p-3 font-bold font-mono text-emerald-700">Rs {totalEarnings}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: KHATA */}
          {activeTab === 'khata' && (
            <div className="space-y-4">
              {!isKhataUnlocked ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto text-center shadow-2xl my-8">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-amber-500 mb-3">
                    <Key className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wide">Khata Authorization Guard</h2>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Enter security verification code to access financial ledger & order balances.</p>

                  <form onSubmit={handleKhataUnlock} className="space-y-3">
                    <input
                      type="password"
                      placeholder={`Enter Khata Passcode (${khataPasscode})`}
                      value={inputKhataCode}
                      onChange={(e) => setInputKhataCode(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg text-sm text-center font-mono focus:border-amber-500 outline-none"
                    />
                    {khataAuthError && <p className="text-xs text-red-400 font-medium">Incorrect Authorization Code. Try {khataPasscode}.</p>}
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg text-xs">
                      Verify & Access Khata
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h2 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-600" /> Linked Order Khata Ledger
                      </h2>
                      <p className="text-[11px] text-slate-500">Track shipments, advances, and outstanding balances</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs rounded">Protected Active</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                          <tr>
                            <th className="p-3">Order ID & Name</th>
                            <th className="p-3">Seller / Customer</th>
                            <th className="p-3 font-mono">Shipped Qty</th>
                            <th className="p-3 font-mono">Paid Qty</th>
                            <th className="p-3 font-mono">Total Order</th>
                            <th className="p-3 font-mono">Advance Paid</th>
                            <th className="p-3 font-mono">Total Paid</th>
                            <th className="p-3 font-mono">Remaining Due</th>
                            <th className="p-3 text-center">Add Payment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                          {khataLedger.map((account) => {
                            const remainingBalance = account.totalOrderAmount - account.totalPaidAmount;
                            return (
                              <tr key={account.orderId} className="hover:bg-slate-50">
                                <td className="p-3">
                                  <span className="font-mono font-bold text-slate-900 block">{account.orderId}</span>
                                  <span className="text-slate-500 font-medium">{account.orderName}</span>
                                </td>
                                <td className="p-3 font-semibold text-slate-800">{account.sellerName}</td>
                                <td className="p-3 font-mono font-bold">{account.totalQuantityShipped} units</td>
                                <td className="p-3 font-mono text-emerald-700 font-bold">{account.quantityPaidFor} units</td>
                                <td className="p-3 font-mono font-bold">Rs {account.totalOrderAmount.toLocaleString()}</td>
                                <td className="p-3 font-mono text-blue-700 font-bold">Rs {account.advanceGiven.toLocaleString()}</td>
                                <td className="p-3 font-mono text-emerald-700 font-bold">Rs {account.totalPaidAmount.toLocaleString()}</td>
                                <td className="p-3 font-mono text-red-600 font-bold">Rs {remainingBalance.toLocaleString()}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedKhataEntry(account);
                                      setShowAddPaymentModal(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1 mx-auto shadow-sm"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" /> Log Payment
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CCTV */}
          {activeTab === 'cctv' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-600 animate-pulse" /> Live Factory Floor CCTV Surveillance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cctvCameras.map((cam) => (
                  <div key={cam.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between relative">
                    <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-10">
                      <span className="text-xs font-bold text-white font-mono">{cam.id}: {cam.location}</span>
                      <span className="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 rounded text-[9px] font-bold tracking-wider animate-pulse">● REC</span>
                    </div>
                    <div className="h-48 bg-slate-900 relative flex flex-col items-center justify-center p-4">
                      <Camera className="w-12 h-12 text-slate-700 mb-2 stroke-1" />
                      <p className="text-xs font-mono text-slate-400 text-center">[IP Stream: {cam.ip}]</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LOGS */}
          {activeTab === 'logs' && role === 'ADMIN' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase">System Audit Logs (Admin Only)</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-2 border-b border-slate-200">
                    <span className="text-slate-400">[{log.time}]</span>
                    <span className="font-bold text-blue-800">{log.type}</span>
                    <span className="text-slate-700">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- ALL WORKING MODALS --- */}

      {/* 1. VIEW ORDER DETAILS MODAL */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> Order Details & History
              </h2>
              <button onClick={() => setSelectedOrderDetail(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p><span className="text-slate-500 font-medium">Order ID:</span> <strong className="font-mono text-slate-900">{selectedOrderDetail.orderId}</strong></p>
                <p><span className="text-slate-500 font-medium">Item Name:</span> <strong className="text-slate-800">{selectedOrderDetail.itemName}</strong></p>
                <p><span className="text-slate-500 font-medium">Quantity Shipped:</span> <strong>{selectedOrderDetail.quantity}</strong></p>
                <p><span className="text-slate-500 font-medium">Shipment Status:</span> <strong className="text-amber-700">{selectedOrderDetail.status}</strong></p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <p><span className="text-slate-500 font-medium">Party / Vendor Name:</span> <strong className="text-slate-900">{selectedOrderDetail.supplierName || selectedOrderDetail.customerName || selectedOrderDetail.clientName}</strong></p>
                <p><span className="text-slate-500 font-medium">Contact Phone:</span> <strong className="font-mono text-slate-800">{selectedOrderDetail.contactPhone || selectedOrderDetail.clientPhone}</strong></p>
                <p><span className="text-slate-500 font-medium">City:</span> <strong className="text-amber-700">{selectedOrderDetail.city}</strong></p>
                <p><span className="text-slate-500 font-medium">Address:</span> <span className="text-slate-700">{selectedOrderDetail.address}</span></p>
                <p><span className="text-slate-500 font-medium">Total Order Valuation:</span> <strong className="text-emerald-700 font-mono text-sm">{selectedOrderDetail.totalAmount}</strong></p>
              </div>

              {selectedOrderDetail.previousOrders && selectedOrderDetail.previousOrders.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-600" /> Previous Order History
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2">Past Order ID</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Quantity</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedOrderDetail.previousOrders.map((prev, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono text-slate-800">{prev.id}</td>
                            <td className="p-2 text-slate-600">{prev.date}</td>
                            <td className="p-2 font-mono font-medium">{prev.qty}</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">{prev.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelectedOrderDetail(null)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW WORKER / EMPLOYEE DETAILS MODAL */}
      {selectedWorkerDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" /> Employee Profile & Roster Details
              </h2>
              <button onClick={() => setSelectedWorkerDetail(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p><span className="text-slate-500 font-medium">Full Employee Name:</span> <strong className="text-slate-900 text-sm">{selectedWorkerDetail.name}</strong></p>
                <p><span className="text-slate-500 font-medium">Designation / Role:</span> <strong className="text-slate-800">{selectedWorkerDetail.role}</strong></p>
                <p><span className="text-slate-500 font-medium">Assigned Work Station:</span> <strong className="text-amber-700">{selectedWorkerDetail.assigned}</strong></p>
                <p><span className="text-slate-500 font-medium">Shift Type:</span> <span className="font-bold">{selectedWorkerDetail.shiftType} SHIFT</span></p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p>
                  <span className="text-slate-500 font-medium">Phone Number:</span>{' '}
                  {role === 'ADMIN' || role === 'SUPERVISOR' ? (
                    <strong className="font-mono text-slate-800">{selectedWorkerDetail.phone}</strong>
                  ) : (
                    <span className="text-slate-400 italic">[Restricted to Admin & Supervisor]</span>
                  )}
                </p>
                <p>
                  <span className="text-slate-500 font-medium">Guardian / Father Name:</span>{' '}
                  {role === 'ADMIN' ? (
                    <strong className="text-slate-800">{selectedWorkerDetail.guardianName}</strong>
                  ) : (
                    <span className="text-slate-400 italic">[Restricted - Admin Only]</span>
                  )}
                </p>
                <p>
                  <span className="text-slate-500 font-medium">Residential Address:</span>{' '}
                  {role === 'ADMIN' ? (
                    <span className="text-slate-700">{selectedWorkerDetail.address}</span>
                  ) : (
                    <span className="text-slate-400 italic">[Restricted - Admin Only]</span>
                  )}
                </p>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                <p><span className="text-slate-600 font-medium">Base Daily Rate:</span> <strong className="font-mono">Rs {selectedWorkerDetail.dailyRate}/day</strong></p>
                <p><span className="text-slate-600 font-medium">Overtime Logged:</span> <strong className="text-purple-700 font-mono">{selectedWorkerDetail.overtimeHours} Hours</strong></p>
                <p>
                  <span className="text-slate-600 font-medium">Net Earnings (This Week):</span>{' '}
                  {role === 'ADMIN' || role === 'SUPERVISOR' ? (
                    <strong className="text-emerald-700 font-mono text-sm">
                      Rs {calculateEarnings(selectedWorkerDetail.attendance, selectedWorkerDetail.dailyRate, selectedWorkerDetail.overtimeHours, selectedWorkerDetail.payAdjustment)}
                    </strong>
                  ) : (
                    <span className="text-slate-400 italic">[Restricted]</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelectedWorkerDetail(null)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. LOG KHATA PAYMENT MODAL */}
      {showAddPaymentModal && selectedKhataEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" /> Log Khata Payment Transaction
              </h2>
              <button onClick={() => setShowAddPaymentModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddPaymentTransaction} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <p><span className="text-slate-500">Order ID:</span> <strong className="font-mono">{selectedKhataEntry.orderId}</strong></p>
                <p><span className="text-slate-500">Seller / Client:</span> <strong className="text-slate-800">{selectedKhataEntry.sellerName}</strong></p>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Payment Amount Received (Rs):</label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Quantity Paid For (Units):</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  value={newPaidQty}
                  onChange={(e) => setNewPaidQty(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Transaction Note / Description:</label>
                <input
                  type="text"
                  placeholder="e.g. Received partial payment for batch 3 shipment"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">Enter Security Code To Save ({khataPasscode}):</label>
                <input
                  type="password"
                  placeholder="Enter Code to Authorize"
                  value={saveAuthCodeInput}
                  onChange={(e) => setSaveAuthCodeInput(e.target.value)}
                  className="w-full px-3 py-1.5 border border-amber-300 bg-amber-50/50 rounded-lg font-mono text-center font-bold"
                  required
                />
                {saveCodeError && <p className="text-xs text-red-500 font-medium mt-1">Invalid Code! Enter {khataPasscode} to authorize save.</p>}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Confirm & Update Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. KHATA EXIT SECURITY CODE MODAL */}
      {showExitCodeModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <Shield className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h2 className="text-sm font-bold text-slate-900 uppercase">Khata Exit Code Verification</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">Navigating away from financial records. Enter authorization code to confirm exit.</p>

            <form onSubmit={confirmKhataExit} className="space-y-3">
              <input
                type="password"
                placeholder={`Enter Code (${khataPasscode})`}
                value={exitCodeInput}
                onChange={(e) => setExitCodeInput(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-center font-mono"
                required
              />
              {exitCodeError && <p className="text-xs text-red-500 font-medium">Incorrect exit authorization code. Enter {khataPasscode}.</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitCodeModal(false)}
                  className="w-1/2 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Stay in Khata
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Authorize Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADMIN CONTROL CENTER SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2 text-slate-900">
                <Settings className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">Admin Control Center Settings</h2>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" /> Change Administrator Passcode
                </h3>
                <form onSubmit={handleChangeAdminPass} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Enter new admin passcode"
                    value={newAdminPassInput}
                    onChange={(e) => setNewAdminPassInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs"
                  >
                    Update
                  </button>
                </form>
                {passChangeSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    Admin passcode updated successfully!
                  </p>
                )}
                <p className="text-[11px] text-slate-500">Current Admin Passcode: <span className="font-mono font-bold text-slate-800">{adminPasscode}</span></p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" /> Add New Role / User Account
                </h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">User Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Administrator Number 2"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">Role Type</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white font-medium"
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="WORKER">Worker</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">Secret Code</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-002"
                      value={newUserCode}
                      onChange={(e) => setNewUserCode(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">Secret Password</label>
                    <input
                      type="text"
                      placeholder="e.g. mysecretpass123"
                      value={newUserPass}
                      onChange={(e) => setNewUserPass(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2 rounded-lg text-xs"
                    >
                      Save New User
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-700">Existing Authorized Users</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Secret Code</th>
                        <th className="p-2.5">Secret Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900">{u.name}</td>
                          <td className="p-2.5"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">{u.role}</span></td>
                          <td className="p-2.5 font-mono text-slate-600">{u.secretCode}</td>
                          <td className="p-2.5 font-mono text-slate-800 font-bold">{u.secretPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-blue-950 border-t border-blue-900 p-4 text-center text-xs text-slate-500 flex items-center justify-between">
        <span>STAR FACTORY CONTROL v2.4</span>
        <span className="flex items-center gap-1 font-medium text-emerald-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> System Online & Protected
        </span>
      </footer>
    </div>
  );
}