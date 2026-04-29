import { useState, useEffect, useRef } from 'react';
import { Loader2, SortAsc, SortDesc } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';

function App() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [search, setSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  // AI Recommendation state
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAllEmployees = async () => {
    try {
      const res = await fetch('http://localhost:8000/analyze_all');
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 && data.detail === "No data uploaded") {
          setEmployees([]);
          setFilteredEmployees([]);
          return;
        }
        throw new Error(data.detail || 'Failed to fetch');
      }
      setEmployees(data);
      handleSortAndFilter(data, search, sortDesc);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      
      alert(data.message);
      await fetchAllEmployees();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
        body: JSON.stringify({ query: `Give 5 detailed recommendations for employee ${employeeId} based on their workload, time taken, and number of tasks solved.` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Server error');
      setAiRecommendation(data.response);
    } catch (err) {
      setAiRecommendation(`Error fetching recommendations: ${err.message}`);
    } finally {
      setLoadingRec(false);
    }
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
      if (!res.ok) {
        throw new Error(data.detail || 'Server error');
      }
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: `Error: ${err.message}`, sender: 'bot' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const chartData = [
    { category: 'Low', count: employees.filter(e => e.risk_level === 'Low').length },
    { category: 'Medium', count: employees.filter(e => e.risk_level === 'Medium').length },
    { category: 'High', count: employees.filter(e => e.risk_level === 'High').length },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center h-16 px-8">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-on-surface uppercase font-headline-md leading-none">RiskIntel</h1>
              <p className="text-[10px] text-on-surface-variant font-label-md">Enterprise Analytics</p>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
            <span className="text-xl font-extrabold text-on-surface font-headline-md shrink-0">Dashboard</span>
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm transition-all text-on-surface"
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
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-symbols-outlined text-sm">upload</span>}
                Upload CSV
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-all"
                onClick={toggleSort}
              >
                {sortDesc ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                Sort
              </button>
              <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">notifications</span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all">account_circle</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-12 gap-8 animate-fade-in">
          {/* Left Side: Distribution & Table */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* Risk Distribution Bento */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-headline-md text-on-surface">Burnout Risk Distribution</h2>
                <span className="text-xs text-on-surface-variant font-label-md uppercase tracking-widest">Aggregate Data</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="category" stroke="#76777d" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e2124', border: '1px solid #45464d', borderRadius: '8px' }}
                      itemStyle={{ color: '#f7f9fb' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.category === 'High' ? '#ef4444' : 
                            entry.category === 'Medium' ? '#eab308' : 
                            '#22c55e'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline-md text-on-surface">Employee Assessment</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full">All Teams</span>
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full">Real-time</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-4 text-xs text-on-surface-variant font-bold uppercase tracking-wider">Workload (pts)</th>
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
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{emp.workload_score}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{emp.risk_score}</td>
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
                          No employees found. Please upload a CSV to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {employees.length > 0 && (
                <div className="p-4 bg-surface-container-lowest border-t border-outline-variant text-center">
                  <button className="text-sm text-secondary font-semibold hover:underline">View All {employees.length} Employees</button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Employee Details & AI Chat */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            {/* Employee Profile Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xl">
              {!selectedEmp ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">account_circle</span>
                  <p className="text-on-surface-variant text-sm">Select an employee to view details</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-on-surface-variant text-4xl">account_circle</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-headline-md text-on-surface">Employee #{selectedEmp.employee_id}</h3>
                      <p className="text-sm text-on-surface-variant">
                        Risk Level: <span className={
                          selectedEmp.risk_level === 'High' ? 'text-red-500' : 
                          selectedEmp.risk_level === 'Medium' ? 'text-yellow-500' : 
                          'text-green-500'
                        }>{selectedEmp.risk_level}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Risk Indicators</h4>
                      <ul className="space-y-2">
                        {selectedEmp.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-surface-container-high rounded-lg text-sm text-on-surface">
                            <span className={`material-symbols-outlined text-[18px] ${
                              selectedEmp.risk_level === 'High' ? 'text-red-500' : 
                              selectedEmp.risk_level === 'Medium' ? 'text-yellow-500' : 
                              'text-green-500'
                            }`}>analytics</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* AI Recommendations */}
                    <div className="p-6 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">AI Insights</h4>
                        </div>
                        <div className="text-sm leading-relaxed text-on-surface prose prose-invert max-h-64 overflow-y-auto custom-scrollbar">
                          {loadingRec ? (
                            <div className="flex items-center gap-2 py-4">
                              <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                              <span>Generating insights...</span>
                            </div>
                          ) : aiRecommendation ? (
                            <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
                          ) : (
                            <p>Loading recommendations...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* AI HR Assistant Widget */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xl flex-1 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold font-headline-md text-on-surface">HR Assistant</h3>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">more_horiz</span>
              </div>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="bg-surface-container p-4 rounded-xl rounded-bl-none text-sm text-on-surface max-w-[85%] self-start border border-outline-variant">
                    How can I help you analyze the team's health today?
                  </div>
                )}
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl text-sm max-w-[85%] border ${
                      m.sender === 'bot' 
                        ? 'bg-surface-container text-on-surface self-start rounded-bl-none border-outline-variant' 
                        : 'bg-secondary/20 text-secondary self-end rounded-br-none border-secondary/20'
                    }`}
                  >
                    {m.sender === 'bot' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                  </div>
                ))}
                {loadingChat && (
                  <div className="bg-surface-container p-4 rounded-xl rounded-bl-none text-sm text-on-surface max-w-[85%] self-start border border-outline-variant flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
              <div className="relative mt-auto">
                <input
                  className="w-full pl-4 pr-12 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm text-on-surface"
                  placeholder="Ask a question..."
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary-fixed transition-colors"
                  onClick={sendChat}
                  disabled={loadingChat}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}

export default App;
