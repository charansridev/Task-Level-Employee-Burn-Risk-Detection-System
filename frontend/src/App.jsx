import { useState, useEffect, useRef } from 'react';
import { Search, SortAsc, SortDesc, ShieldAlert, CheckCircle2, AlertTriangle, Send, Loader2, Upload } from 'lucide-react';
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

  const getRiskColor = (level) => {
    if (level === 'High') return '#ef4444';
    if (level === 'Medium') return '#eab308';
    return '#10b981';
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Burnout Risk Analyzer</h1>
      </header>

      <div className="dashboard-layout">
        <div className="main-panel">
          <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <div className="controls-bar" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Search Employee ID..."
                className="search-input"
                value={search}
                onChange={handleSearch}
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  accept=".csv" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button className="btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 size={18} className="spin-icon" /> : <Upload size={18} />}
                  Upload CSV
                </button>
                <button className="btn" onClick={toggleSort}>
                  {sortDesc ? <SortDesc size={18} /> : <SortAsc size={18} />}
                  Sort
                </button>
              </div>
            </div>

            <div className="table-container">
              {employees.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Upload size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>No data available. Please upload an employee CSV file to begin analysis.</p>
                </div>
              ) : (
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Workload</th>
                    <th>Risk Score</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr
                      key={emp.employee_id}
                      onClick={() => selectEmployee(emp)}
                      className={selectedEmp?.employee_id === emp.employee_id ? 'selected' : ''}
                    >
                      <td>#{emp.employee_id}</td>
                      <td>{emp.workload_score} pts</td>
                      <td>{emp.risk_score}</td>
                      <td>
                        <span className={`risk-badge risk-${emp.risk_level}`}>
                          {emp.risk_level === 'High' && <ShieldAlert size={14} />}
                          {emp.risk_level === 'Medium' && <AlertTriangle size={14} />}
                          {emp.risk_level === 'Low' && <CheckCircle2 size={14} />}
                          {emp.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <h3>Risk Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(() => {
                  const lowCount = employees.filter(e => e.risk_level === 'Low').length;
                  const mediumCount = employees.filter(e => e.risk_level === 'Medium').length;
                  const highCount = employees.filter(e => e.risk_level === 'High').length;
                  return [
                    { category: 'Low', count: lowCount },
                    { category: 'Medium', count: mediumCount },
                    { category: 'High', count: highCount },
                  ];
                })()}>
                  <XAxis dataKey="category" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: 'No. of Employees', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { fontSize: '0.85rem' } }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#eab308" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="glass-panel details-panel" style={{ marginBottom: '2rem' }}>
            {!selectedEmp ? (
              <div className="details-empty">
                <p>Select an employee to view details and AI recommendations.</p>
              </div>
            ) : (
              <div className="details-content">
                <h3>
                  Employee #{selectedEmp.employee_id}
                  <span className={`risk-badge risk-${selectedEmp.risk_level}`}>
                    {selectedEmp.risk_level}
                  </span>
                </h3>

                <div className="details-section">
                  <h4>Reasons</h4>
                  <ul className="details-list">
                    {selectedEmp.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="details-section">
                  <h4>AI Recommendations</h4>
                  <div className="ai-rec-box">
                    {loadingRec ? (
                      <div className="ai-rec-loading">
                        <Loader2 size={20} className="spin-icon" />
                        <span>Generating Specialized recommendations...</span>
                      </div>
                    ) : aiRecommendation ? (
                      <div className="ai-rec-content">
                        <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8' }}>Select an employee to see AI recommendations.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel chat-container" style={{ marginTop: '0' }}>
            <h3>AI HR Assistant</h3>
            <div className="chat-messages">
              {messages.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                  Ask me about employee burnout risk!
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`message msg-${m.sender}`}>
                  {m.sender === 'bot' ? (
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              ))}
              {loadingChat && <div className="message msg-bot">Analyzing...</div>}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Analyze employees..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button className="btn" onClick={sendChat} disabled={loadingChat}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
