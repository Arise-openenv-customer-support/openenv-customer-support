"use client";

import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:7860";

export default function Home() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionInput, setActionInput] = useState('{\n  "action_type": "classify_ticket",\n  "payload": { "classification": "refund" }\n}');
  const [logs, setLogs] = useState<any[]>([]);
  const [score, setScore] = useState<number | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/state`);
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetEnv = async () => {
    setLoading(true);
    setLogs([]);
    setScore(null);
    try {
      const res = await fetch(`${API_URL}/reset`);
      const data = await res.json();
      setState(data.state);
      setLogs([{ role: 'system', message: 'Environment Reset Successfully' }]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sendAction = async () => {
    setLoading(true);
    try {
      const actionObj = JSON.parse(actionInput);
      const res = await fetch(`${API_URL}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionObj)
      });
      const data = await res.json();
      setState(data.observation.state);
      setLogs(prev => [...prev, {
        role: 'agent', 
        message: `Executed: ${actionObj.action_type}`,
        info: `Reward: ${data.reward.value} | Done: ${data.done}`
      }]);
    } catch (e) {
      alert("Invalid JSON action format or Network Error.");
    }
    setLoading(false);
  };

  const runHardGrader = async () => {
    try {
      const res = await fetch(`${API_URL}/grader?task_id=task_hard_1`);
      const data = await res.json();
      setScore(data.score);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  return (
    <main className="container animate-slide">
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--foreground)' }}>
          OpenEnv <span style={{ color: 'var(--primary)' }}>Control Center</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Enterprise AI Customer Support Simulation & Monitoring</p>
      </header>

      <div className="layout-grid">
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Environment Instance</h2>
              <button className="btn btn-outline" onClick={resetEnv} disabled={loading}>
                {loading ? 'Initializing...' : 'Refresh Session'}
              </button>
            </div>

            {state ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Content</span>
                  <p style={{ marginTop: '0.75rem', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 }}>{state.ticket_text}</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>Sentiment</div>
                    <div className={`badge badge-${state.sentiment}`}>
                      {state.sentiment}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>Priority</div>
                    <div className={`badge ${state.priority ? `badge-${state.priority}` : 'badge-unassigned'}`}>
                      {state.priority || 'Unassigned'}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>Status</div>
                    <div className={`badge badge-${state.status}`}>
                      {state.status}
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ background: '#f8fafc' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Session Metrics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>Classification</div>
                      <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{state.classification || 'Pending Analysis'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600 }}>Processing Steps</div>
                      <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{state.steps_taken} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>/ 10</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
                No active environment. Initialize session to begin.
              </div>
            )}
          </div>

          <div className="glass-card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Control Input</h2>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)' }}>JSON</div>
              <textarea 
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                rows={6}
                style={{ fontSize: '0.9rem', lineHeight: 1.6, background: '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={sendAction} disabled={loading || !state || state.status === 'closed'} style={{ flex: 1 }}>
                Execute Command
              </button>
              <button className="btn btn-outline" onClick={runHardGrader} disabled={loading || !state} style={{ flex: 1, borderColor: 'var(--success)', color: 'var(--success)' }}>
                Verify Progress
              </button>
            </div>

            {score !== null && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46' }}>Evaluation Result</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>{(score * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

        </section>

        <section>
          <div className="glass-card" style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Activity Timeline</h2>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Waiting for activity logs...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`log-entry ${log.role === 'agent' ? 'log-agent' : 'log-customer'}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>{log.role}</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>{log.message}</div>
                    {log.info && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '6px' }}>{log.info}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
