import { useState, useEffect, useRef } from 'react';
import { Loader2, SortAsc, SortDesc, User, Briefcase, ChevronLeft, Send, Upload, Bell, Search, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';

// --- Home Component ---
function Home({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter text-on-surface uppercase font-headline-md">
            Risk<span className="text-secondary">Intel</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-medium">Enterprise Employee Burnout Analytics & Prevention</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => onSelectRole('employee')}
            className="group relative bg-surface-container-lowest border-2 border-outline-variant hover:border-secondary p-10 rounded-3xl transition-all duration-300 text-left overflow-hidden shadow-xl hover:shadow-secondary/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
            <User className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-on-surface mb-2">Login as Employee</h3>
            <p className="text-on-surface-variant">Log your daily work metrics and get instant burnout risk analysis and personal recommendations.</p>
          </button>

          <button 
            onClick={() => onSelectRole('manager')}
            className="group relative bg-surface-container-lowest border-2 border-outline-variant hover:border-primary p-10 rounded-3xl transition-all duration-300 text-left overflow-hidden shadow-xl hover:shadow-primary/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <Briefcase className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-on-surface mb-2">Login as Manager</h3>
            <p className="text-on-surface-variant">Access team-wide burnout distribution, detailed individual assessments, and AI-powered HR insights.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Employee Dashboard ---
function EmployeeDashboard({ onBack }) {
  const [employeeId, setEmployeeId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    easy_tasks: 0,
    medium_tasks: 0,
    hard_tasks: 0,
    context_switches: 0,
    work_hours: 8,
    after_hours_work: 0,
    weekend_work: false
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (employeeId) setIsLoggedIn(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, employee_id: parseInt(employeeId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Submission failed');
      setResult(data);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8 animate-fade-in">
        <div className="bg-surface-container-lowest border border-outline-variant p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8">
          <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-on-surface tracking-tight">Employee Login</h2>
            <p className="text-on-surface-variant">Enter your ID to start your daily entry.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Employee ID</label>
              <input 
                type="number" 
                required 
                className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-on-surface"
                placeholder="e.g. 1"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-secondary text-on-secondary font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-secondary/20">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 font-body-md">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <ChevronLeft className="w-4 h-4" /> Logout
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-on-surface">Employee #{employeeId}</h2>
            <p className="text-sm text-on-surface-variant">Daily Progress Tracking</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-3xl shadow-xl space-y-8">
            <h3 className="text-xl font-bold text-on-surface border-b border-outline-variant pb-4">Daily Work Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Easy Tasks</label>
                  <input type="number" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface" value={formData.easy_tasks} onChange={e => setFormData({...formData, easy_tasks: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Med Tasks</label>
                  <input type="number" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface" value={formData.medium_tasks} onChange={e => setFormData({...formData, medium_tasks: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Hard Tasks</label>
                  <input type="number" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface" value={formData.hard_tasks} onChange={e => setFormData({...formData, hard_tasks: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Context Switches</label>
                  <input type="number" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface" value={formData.context_switches} onChange={e => setFormData({...formData, context_switches: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Work Hours</label>
                  <input type="number" step="0.5" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface" value={formData.work_hours} onChange={e => setFormData({...formData, work_hours: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">After Hours</label>
                  <input type="number" step="0.5" className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface" value={formData.after_hours_work} onChange={e => setFormData({...formData, after_hours_work: parseFloat(e.target.value)})} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary/20" checked={formData.weekend_work} onChange={e => setFormData({...formData, weekend_work: e.target.checked})} />
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface">Weekend Work</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-secondary text-on-secondary font-bold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4" />}
                Analyze My Risk
              </button>
            </form>
          </div>

          <div className="space-y-8 animate-fade-in">
            {!result ? (
              <div className="h-full bg-surface-container border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center p-12 text-center text-on-surface-variant space-y-4">
                <Info className="w-12 h-12 opacity-20" />
                <p>Complete the form to see your real-time burnout analysis and recommendations.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className={`p-8 rounded-3xl border shadow-xl flex items-center justify-between ${
                  result.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' : 
                  result.risk_level === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' : 
                  'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-70">Current Risk Level</p>
                    <h4 className={`text-5xl font-black ${
                      result.risk_level === 'High' ? 'text-red-500' : 
                      result.risk_level === 'Medium' ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>{result.risk_level}</h4>
                  </div>
                  {result.risk_level === 'High' ? <AlertTriangle className="w-16 h-16 text-red-500" /> : <CheckCircle className="w-16 h-16 text-green-500" />}
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-3xl shadow-xl space-y-6">
                  <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                    <h4 className="text-xl font-bold text-on-surface">Assessment Details</h4>
                    <span className="text-3xl font-black text-secondary">{result.risk_score}<span className="text-sm font-normal text-on-surface-variant ml-1">/100</span></span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Factors Detected:</p>
                    <ul className="space-y-3">
                      {result.reasons.map((reason, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-surface-container rounded-xl text-sm font-medium">
                          <div className={`w-2 h-2 rounded-full ${
                            result.risk_level === 'High' ? 'bg-red-500' : 
                            result.risk_level === 'Medium' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}></div>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-outline-variant">
                    <p className="text-sm font-bold text-secondary uppercase tracking-wider">Recommendations:</p>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 border border-secondary/20 bg-secondary/5 rounded-xl text-sm italic">
                          <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Manager Dashboard ---
function ManagerDashboard({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [search, setSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAllEmployees = async () => {
    try {
      const res = await fetch('http://localhost:8000/latest');
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch');
      setEmployees(data);
      handleSortAndFilter(data, search, sortDesc);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
    const interval = setInterval(fetchAllEmployees, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      alert(data.message);
      await fetchAllEmployees();
    } catch (err) { alert(`Error: ${err.message}`); } finally { setUploading(false); }
  };

  const handleSortAndFilter = (data, searchVal, isDesc) => {
    let filtered = data.filter(e => e.employee_id.toString().includes(searchVal));
    filtered.sort((a, b) => isDesc ? b.risk_score - a.risk_score : a.risk_score - b.risk_score);
    setFilteredEmployees(filtered);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    handleSortAndFilter(employees, e.target.value, sortDesc);
  };

  const toggleSort = () => {
    const newSort = !sortDesc;
    setSortDesc(newSort);
    handleSortAndFilter(employees, search, newSort);
  };

  const selectEmployee = (emp) => {
    setSelectedEmp(emp);
    fetchAiRecommendation(emp.employee_id);
  };

  const fetchAiRecommendation = async (employeeId) => {
    setAiRecommendation('');
    setLoadingRec(true);
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Give 5 detailed recommendations for employee ${employeeId} based on their workload and risk factors.` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Server error');
      setAiRecommendation(data.response);
    } catch (err) {
      setAiRecommendation(`Error: ${err.message}`);
    } finally { setLoadingRec(false); }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { text: chatInput, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoadingChat(true);
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Server error');
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: `Error: ${err.message}`, sender: 'bot' }]);
    } finally { setLoadingChat(false); }
  };

  const chartData = [
    { category: 'Low', count: employees.filter(e => e.risk_level === 'Low').length },
    { category: 'Medium', count: employees.filter(e => e.risk_level === 'Medium').length },
    { category: 'High', count: employees.filter(e => e.risk_level === 'High').length },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center h-16 px-8">
          <div className="flex items-center gap-8 flex-1">
            <button onClick={onBack} className="flex flex-col text-left">
              <h1 className="text-lg font-bold tracking-tight text-on-surface uppercase font-headline-md leading-none">RiskIntel</h1>
              <p className="text-[10px] text-on-surface-variant font-label-md">Manager Portal</p>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all text-on-surface"
                  placeholder="Search employee IDs..."
                  type="text"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import CSV
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-all"
                onClick={toggleSort}
              >
                {sortDesc ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                Sort
              </button>
              <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
              <div className="flex gap-4 text-on-surface-variant">
                <Bell className="w-5 h-5 cursor-pointer hover:text-primary transition-all" />
                <User className="w-5 h-5 cursor-pointer hover:text-primary transition-all" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-12 gap-8 animate-fade-in">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-headline-md text-on-surface">Team Health Overview</h2>
                <span className="text-xs text-on-surface-variant font-label-md uppercase tracking-widest">Latest Entries Only</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="category" stroke="#76777d" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e2124', border: '1px solid #45464d', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.category === 'High' ? '#ef4444' : entry.category === 'Medium' ? '#eab308' : '#22c55e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline-md text-on-surface">Employee Roster</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full uppercase tracking-widest">Live Sync</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">Risk Score</th>
                      <th className="px-6 py-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                      <tr 
                        key={emp.employee_id} 
                        className={`hover:bg-surface-container transition-colors cursor-pointer group ${selectedEmp?.employee_id === emp.employee_id ? 'bg-surface-container' : ''}`}
                        onClick={() => selectEmployee(emp)}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-on-surface">#{emp.employee_id}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{emp.last_updated}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant font-bold">{emp.risk_score}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                            emp.risk_level === 'High' ? 'bg-red-500/20 text-red-500' : 
                            emp.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {emp.risk_level}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant">
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xl">
              {!selectedEmp ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
                  <User className="w-12 h-12 opacity-20 mb-4" />
                  <p className="text-sm">Select an employee for details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                      <User className="text-on-surface-variant" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">Employee #{selectedEmp.employee_id}</h3>
                      <p className="text-xs text-on-surface-variant">Last entry: {selectedEmp.last_updated}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Risk Indicators</h4>
                    <ul className="space-y-2">
                      {selectedEmp.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-on-surface bg-surface-container p-3 rounded-lg">
                          <Info className={`w-4 h-4 shrink-0 mt-0.5 ${
                            selectedEmp.risk_level === 'High' ? 'text-red-500' : 
                            selectedEmp.risk_level === 'Medium' ? 'text-yellow-500' : 
                            'text-green-500'
                          }`} />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-secondary" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary">AI Insight Engine</h4>
                    </div>
                    <div className="text-sm prose prose-invert max-h-64 overflow-y-auto custom-scrollbar">
                      {loadingRec ? <Loader2 className="w-4 h-4 animate-spin" /> : <ReactMarkdown>{aiRecommendation}</ReactMarkdown>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xl flex-1 flex flex-col min-h-[400px]">
              <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" /> Assistant
              </h3>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-6 pr-2 custom-scrollbar text-sm">
                {messages.map((m, i) => (
                  <div key={i} className={`p-4 rounded-2xl max-w-[90%] ${m.sender === 'bot' ? 'bg-surface-container self-start rounded-bl-none' : 'bg-primary/20 text-primary self-end rounded-br-none'}`}>
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ))}
                {loadingChat && <Loader2 className="animate-spin w-4 h-4" />}
              </div>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-12 py-3 bg-surface-container border border-outline-variant rounded-xl text-sm"
                  placeholder="Ask about team health..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                />
                <button onClick={sendChat} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [view, setView] = useState('home'); // 'home', 'employee', 'manager'

  switch(view) {
    case 'employee':
      return <EmployeeDashboard onBack={() => setView('home')} />;
    case 'manager':
      return <ManagerDashboard onBack={() => setView('home')} />;
    default:
      return <Home onSelectRole={setView} />;
  }
}

export default App;
