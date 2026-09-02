import React, { useState } from 'react';
import { Activity, Server, Database, Box, Check, X, AlertCircle, Play } from 'lucide-react';

export function HealthDiagnosticPanel({ health, onRefresh }) {
  const [testLog, setTestLog] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const runConnectivityTest = async () => {
    setIsRunningTest(true);
    const results = [];
    const endpoints = [
      { name: 'Root API (GET /)', url: '/' },
      { name: 'Health Check (GET /health)', url: '/health' },
      { name: 'PostgreSQL DB Health (GET /health/db)', url: '/health/db' },
      { name: 'pgvector Extension (GET /health/vector)', url: '/health/vector' },
      { name: 'System Info (GET /api/v1/system/info)', url: '/api/v1/system/info' },
    ];

    for (const ep of endpoints) {
      const startTime = performance.now();
      try {
        const res = await fetch(ep.url);
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => null);
        results.push({
          name: ep.name,
          status: res.ok ? 'PASS' : 'WARN',
          statusCode: res.status,
          latencyMs: duration,
          data,
        });
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        results.push({
          name: ep.name,
          status: 'FAIL',
          statusCode: 0,
          latencyMs: duration,
          error: err.message,
        });
      }
    }

    setTestLog(results);
    setIsRunningTest(false);
    onRefresh();
  };

  const services = [
    {
      name: 'FastAPI Gateway',
      status: health?.services?.api || 'unknown',
      icon: Server,
      desc: 'High-throughput async Python 3.14/FastAPI core with Request-ID traceability',
    },
    {
      name: 'PostgreSQL Database',
      status: health?.services?.database || 'unknown',
      icon: Database,
      desc: 'Relational storage for standards, clauses, DNA, and evidence schemas',
    },
    {
      name: 'pgvector Extension',
      status: health?.services?.vector_store || 'unknown',
      icon: Box,
      desc: 'Vector embedding engine for clause-level semantic retrieval foundation',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            M0 Engineering Infrastructure & Connectivity Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time diagnostics validating API gateway, database connectivity, and pgvector extension readiness.
          </p>
        </div>
        <button
          onClick={runConnectivityTest}
          disabled={isRunningTest}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 shadow-md shadow-blue-900/30"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isRunningTest ? 'Executing Endpoint Pings...' : 'Run Diagnostics'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {services.map((svc) => {
          const isOk = svc.status === 'ok' || svc.status.includes('ready') || svc.status.includes('active');
          const isDegraded = svc.status === 'disabled' || svc.status === 'unavailable';

          return (
            <div
              key={svc.name}
              className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    isOk
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                      : isDegraded
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {svc.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{svc.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{svc.desc}</p>
            </div>
          );
        })}
      </div>

      {testLog.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Endpoint Verification Results:
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {testLog.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800"
              >
                <div className="flex items-center gap-2">
                  {t.status === 'PASS' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : t.status === 'WARN' ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-slate-200">{t.name}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{t.latencyMs}ms</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'PASS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    HTTP {t.statusCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
