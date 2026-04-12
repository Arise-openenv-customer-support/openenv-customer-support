"use client";

import { useState, useEffect } from 'react';

const API_URL = typeof window !== 'undefined' 
  ? (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') 
    ? 'http://127.0.0.1:7860' 
    : window.location.origin) 
  : "http://127.0.0.1:7860";

export default function Home() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [actionInput, setActionInput] = useState('{\n  "action_type": "classify_ticket",\n  "payload": { "classification": "refund" }\n}');
  const [logs, setLogs] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' | 'info') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const addLog = (message: string, role: string, info = '', status = '') => {
    setLogs(prev => [...prev.slice(-19), { role, message, info, status }]);
  };

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/state`);
      if (res.ok) {
        const data = await res.json();
        const obs = data.observation || data.state || data;
        if (obs && obs.status !== "session_complete") {
          setState(obs);
          setBooting(false);
          return true;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const resetEnv = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset`, { method: 'POST' });
      const data = await res.json();
      const obs = data.observation || data.state || data;
      setState(obs);
      setLogs([{ role: 'system', message: 'Enterprise Session Re-initialized' }]);
      showStatus("New ticket allocated.", "success");
      setBooting(false);
    } catch (e) {
      showStatus("Backend unreachable.", "error");
    }
    setLoading(false);
  };

  const boot = async () => {
    const success = await fetchState();
    if (success) {
      addLog('Connected to Environment Engine', 'system');
    } else {
      await resetEnv();
    }
  };

  const sendAction = async (overrideAction?: any) => {
    setLoading(true);
    try {
      const actionObj = overrideAction || JSON.parse(actionInput.trim());
      const res = await fetch(`${API_URL}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionObj)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Action rejected.");

      const obs = data.observation || data.state || data;
      setState(obs);

      if (obs?.status === "session_complete") {
        addLog('🏁 Queue processing complete', 'system');
        showStatus("Session archived.", "info");
      } else {
        const reward = data.reward ?? 0;
        const msg = data.info?.message || "Processed";
        addLog(`${actionObj.action_type}`, 'agent', `${msg} (Reward: ${reward.toFixed(2)})`, reward >= 0 ? "success" : "failed");
        showStatus(reward >= 0 ? "Action Accepted" : "Reward Deduction", reward >= 0 ? "success" : "error");
      }
    } catch (e: any) {
      showStatus(e.message || "Logic Error.", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    boot();
  }, []);

  return (
    <main className="container">
      <header className="main-header">
        <div>
          <h1>OpenEnv <span className="text-grad">Support Engine</span></h1>
          <p className="subtitle">High-Fidelity Agentic Decision System</p>
        </div>
        <div className="header-actions">
           <button className="btn btn-secondary" onClick={resetEnv} disabled={loading || booting}>New Session</button>
        </div>
      </header>

      {statusMsg && (
        <div className={`toast toast-${statusMsg.type}`}>
          {statusMsg.type === 'success' ? '⚡' : statusMsg.type === 'error' ? '💥' : '🧠'} {statusMsg.text}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column: State & Activity */}
        <div className="dashboard-col">
          <section className="card card-state">
            {booting ? (
              <div className="loader-box">
                <div className="spinner"></div>
                <p>Initializing Environment...</p>
              </div>
            ) : state && state.status !== "session_complete" ? (
              <div className="state-content">
                <div className="state-header">
                  <div className="ticket-badge">ACTIVE TICKET</div>
                  <div className="sla-tracker">
                    <span className="label">SLA Steps:</span>
                    <span className="value">{state.steps_taken || 0} / {state.sla_limit || 10}</span>
                  </div>
                </div>
                
                <h2 className="ticket-text">"{state.ticket_text}"</h2>

                <div className="metrics-row">
                  <div className="metric">
                    <span className="label">Sentiment</span>
                    <span className={`badge badge-${state.sentiment}`}>{state.sentiment?.toUpperCase()}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Priority</span>
                    <span className={`badge badge-${state.priority || 'none'}`}>{state.priority?.toUpperCase() || 'UNSET'}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Reward</span>
                    <span className="reward-value">{(state.total_reward || 0).toFixed(3)}</span>
                  </div>
                </div>
              </div>
            ) : state?.status === "session_complete" ? (
              <div className="complete-box">
                <div className="confetti">🎯</div>
                <h2>Queue Complete</h2>
                <div className="final-stats">
                  <div className="stat-unit"><span className="label">RESOLVED</span><span className="val">{state.resolved}</span></div>
                  <div className="stat-unit"><span className="label">SCORE</span><span className="val text-grad">{(state.total_reward || 0).toFixed(2)}</span></div>
                </div>
                <button className="btn btn-primary" onClick={resetEnv}>Next Queue</button>
              </div>
            ) : null}
          </section>

          {state?.kb_context && (
            <section className="card card-kb glow-edge">
              <div className="kb-header">📚 Knowledge Base Context</div>
              <div className="kb-body">{state.kb_context}</div>
            </section>
          )}

          <section className="card card-logs">
            <h3 className="section-title">Workflow History</h3>
            <div className="log-container">
              {logs.map((log, i) => (
                <div key={i} className={`log-entry log-${log.role}`}>
                  <div className="log-meta">{log.role.toUpperCase()}</div>
                  <div className="log-msg">{log.message}</div>
                  {log.info && <div className="log-info">{log.info}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Decisions & Controls */}
        <div className="dashboard-col">
          <section className="card card-controls">
            <div className="card-header">
              <h3 className="section-title">Decision Center</h3>
            </div>
            
            <div className="control-box">
              <textarea 
                className="code-editor"
                value={actionInput} 
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Action JSON payload..."
              />
              <div className="action-buttons">
                <button className="btn btn-primary btn-full" onClick={() => sendAction()} disabled={loading || !state}>Execute Step</button>
              </div>
            </div>

            <div className="quick-templates">
              <span className="label">Templates:</span>
              <div className="chip-row">
                <button className="chip" onClick={() => setActionInput('{\n  "action_type": "classify_ticket",\n  "payload": { "classification": "technical_issue" }\n}')}>Triage</button>
                <button className="chip" onClick={() => setActionInput('{\n  "action_type": "search_kb",\n  "payload": { "query": "refund policy" }\n}')}>Search KB</button>
                <button className="chip" onClick={() => setActionInput('{\n  "action_type": "resolve",\n  "payload": {} \n}')}>Resolve</button>
              </div>
            </div>
          </section>

          <section className="card card-schema">
             <h3 className="section-title">Environment Protocol</h3>
             <ul className="info-list">
               <li><strong>Step Limit:</strong> Sentiments decay over time.</li>
               <li><strong>Context:</strong> Vague tickets require <code>ask_clarification</code>.</li>
               <li><strong>Reward:</strong> Penalties for redundant or out-of-order actions.</li>
             </ul>
          </section>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg: #030712;
          --card: #0f172a;
          --card-border: rgba(255,255,255,0.08);
          --primary: #6366f1;
          --secondary: #94a3b8;
          --foreground: #f8fafc;
          --muted: #64748b;
          --success: #10b981;
          --danger: #ef4444;
          --warn: #f59e0b;
        }

        body {
          background-color: var(--bg);
          color: var(--foreground);
          font-family: 'Inter', -apple-system, sans-serif;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
        }

        .text-grad {
          background: linear-gradient(to right, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--card-border);
        }

        h1 { font-size: 2.25rem; font-weight: 800; margin: 0; }
        .subtitle { color: var(--muted); margin-top: 0.5rem; font-weight: 500; }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2rem;
        }

        .dashboard-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .card-state { border-left: 4px solid var(--primary); }
        .glow-edge { border: 1px solid #c084fc; box-shadow: 0 0 20px rgba(192, 132, 252, 0.1); }

        .ticket-badge { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; }
        .state-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .ticket-text { font-size: 1.75rem; font-weight: 700; line-height: 1.3; margin: 0; }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .metric .label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 0.5rem; }
        .reward-value { font-size: 1.5rem; font-weight: 900; color: var(--primary); }

        .log-container { height: 300px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 0.75rem; padding-right: 0.5rem; }
        .log-entry { padding: 1rem; border-radius: 1rem; border: 1px solid var(--card-border); position: relative; overflow: hidden; }
        .log-agent { background: rgba(99, 102, 241, 0.05); }
        .log-system { background: rgba(255, 255, 255, 0.03); color: var(--muted); border-style: dashed; }
        
        .log-meta { font-size: 0.6rem; font-weight: 800; margin-bottom: 0.25rem; opacity: 0.5; }
        .log-msg { font-weight: 600; font-size: 0.9rem; }
        .log-info { font-size: 0.75rem; color: var(--primary); margin-top: 0.25rem; }

        .code-editor {
          width: 100%;
          background: #020617;
          border: 1px solid var(--card-border);
          border-radius: 1rem;
          color: #94a3b8;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          padding: 1rem;
          resize: none;
          margin-bottom: 1.5rem;
          box-sizing: border-box;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: #4f46e5; transform: translateY(-2px); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--card-border); }
        .btn-ai { background: linear-gradient(to right, #818cf8, #c084fc); color: white; border: none; padding: 0.4rem 1rem; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }

        .chip-row { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .chip { background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--muted); padding: 0.4rem 0.8rem; border-radius: 9999px; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
        .chip:hover { border-color: var(--primary); color: var(--primary); }

        .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 0.5rem; font-weight: 800; font-size: 0.7rem; }
        .badge-angry, .badge-high { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .badge-happy, .badge-low { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .badge-neutral { background: rgba(148, 163, 184, 0.1); color: var(--secondary); }

        .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; border-radius: 1rem; color: white; font-weight: 800; z-index: 1000; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); animation: slideUp 0.3s ease-out; }
        .toast-success { background: var(--success); }
        .toast-error { background: var(--danger); }
        .toast-info { background: var(--primary); }

        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </main>
  );
}
