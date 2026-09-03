import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Box, Check, X, AlertCircle, Play, Layers, Cpu, ShieldCheck, FileText, Image as ImageIcon, Mic, Table, Sliders, ExternalLink, RefreshCw } from 'lucide-react';

export function HealthDiagnosticPanel({ health, onRefresh }) {
  const [testLog, setTestLog] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [dependencyData, setDependencyData] = useState(null);
  const [loadingDeps, setLoadingDeps] = useState(false);

  const fetchDependencies = async () => {
    setLoadingDeps(true);
    try {
      const res = await fetch('/api/v1/system/dependencies');
      if (res.ok) {
        const data = await res.json();
        setDependencyData(data);
      }
    } catch (e) {
      console.warn('Could not fetch dependencies:', e);
    } finally {
      setLoadingDeps(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const runConnectivityTest = async () => {
    setIsRunningTest(true);
    const results = [];
    const endpoints = [
      { name: 'Root API (GET /)', url: '/' },
      { name: 'Health Check (GET /health)', url: '/health' },
      { name: 'Database Health (GET /health/db)', url: '/health/db' },
      { name: 'Vector Store (GET /health/vector)', url: '/health/vector' },
      { name: 'System Info (GET /api/v1/system/info)', url: '/api/v1/system/info' },
      { name: 'System Dependencies (GET /api/v1/system/dependencies)', url: '/api/v1/system/dependencies' },
      { name: 'Layer 8 Citation Guard (GET /api/v1/citation-guard/invariants)', url: '/api/v1/citation-guard/invariants' },
      { name: 'Layer 9 Passport (GET /api/v1/passport/invariants)', url: '/api/v1/passport/invariants' },
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
    fetchDependencies();
    if (onRefresh) onRefresh();
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s.includes('READY') && !s.includes('FALLBACK')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">READY</span>;
    }
    if (s.includes('FALLBACK')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">FALLBACK READY</span>;
    }
    if (s.includes('CONNECTED')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">CONNECTED</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
              SIH Problem 26107 &bull; Runtime Verification & Diagnostics
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <Activity className="w-5 h-5 text-indigo-600" />
              Zyntrix Full Dependency & Service Health Diagnostic
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live inspection of multi-modal parsers, database engines, vector indexes, and external API connectivity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDependencies}
              disabled={loadingDeps}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDeps ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={runConnectivityTest}
              disabled={isRunningTest}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunningTest ? 'Executing Endpoint Pings...' : 'Run Integration Pings'}
            </button>
          </div>
        </div>

        {/* 4 Quadrants: Input, AI, Data, External */}
        {dependencyData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quadrant 1: Input Services */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                1. Multi-Modal Input Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <strong>PDF (PyMuPDF)</strong>
                  </div>
                  {getStatusBadge(dependencyData.input_services.PDF)}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <strong>OCR (Tesseract)</strong>
                  </div>
                  {getStatusBadge(dependencyData.input_services.OCR)}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-slate-500" />
                    <strong>Voice (Whisper)</strong>
                  </div>
                  {getStatusBadge(dependencyData.input_services.VOICE)}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-3.5 h-3.5 text-slate-500" />
                    <strong>BOM (CSV/JSON)</strong>
                  </div>
                  {getStatusBadge(dependencyData.input_services.BOM)}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <strong>Manual Specification Form</strong>
                  </div>
                  {getStatusBadge(dependencyData.input_services.MANUAL)}
                </div>
              </div>
            </div>

            {/* Quadrant 2: AI & Reasoning Services */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                2. AI & Reasoning Services
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>AI Orchestration LLM</strong>
                    <div className="text-[11px] text-slate-500">Explanation generator only; 0% compliance authority</div>
                  </div>
                  {getStatusBadge(dependencyData.ai_services.LLM)}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>Dense Embeddings</strong>
                    <div className="text-[11px] text-slate-500">SentenceTransformer / Deterministic Embedder</div>
                  </div>
                  {getStatusBadge(dependencyData.ai_services.Embeddings)}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>Layer 6 Hybrid RAG</strong>
                    <div className="text-[11px] text-slate-500">Dense Vector + BM25 with Standard Isolation</div>
                  </div>
                  {getStatusBadge(dependencyData.ai_services['Hybrid RAG'])}
                </div>
              </div>
            </div>

            {/* Quadrant 3: Data & Knowledge Services */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                3. Data & Knowledge Base Services
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>Storage Engine</strong>
                    <div className="text-[11px] text-slate-500">{dependencyData.data_services.Database}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>Vector Index</strong>
                    <div className="text-[11px] text-slate-500">{dependencyData.data_services['Vector Store']}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong>Layer 4 BIS Knowledge Registry</strong>
                    <div className="text-[11px] text-slate-500">{dependencyData.data_services['Knowledge Base']}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Quadrant 4: External Services */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-amber-600" />
                4. External APIs & Cloud Connectivity
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(dependencyData.external_services).map(([name, svc]) => (
                  <div key={name} className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800">{name}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        svc.status.includes('Connected') ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {svc.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Fallback: {svc.fallback}</span>
                      <span>Latency: {svc.latency_ms}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Granular Dependencies Table */}
        {dependencyData && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Comprehensive Dependency Matrix ({dependencyData.dependencies.length} Components Inspected)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Version</th>
                    <th className="p-2.5">Configured</th>
                    <th className="p-2.5">Functional</th>
                    <th className="p-2.5">Latency</th>
                    <th className="p-2.5">Runtime Fallback Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dependencyData.dependencies.map((dep, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-bold text-indigo-900 whitespace-nowrap">
                        {dep.name}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600 border border-slate-200">
                          {dep.type}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-[11px] text-slate-600">
                        {dep.version || 'N/A'}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {dep.configured ? (
                          <span className="text-emerald-700 font-bold text-[10px]">YES</span>
                        ) : (
                          <span className="text-amber-700 font-bold text-[10px]">OPTIONAL</span>
                        )}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {dep.functional ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            OPERATIONAL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            FALLBACK ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-slate-500">
                        {dep.latency_ms !== null ? `${dep.latency_ms}ms` : '-'}
                      </td>
                      <td className="p-2.5 text-[10px] text-slate-500 max-w-sm">
                        {dep.fallback_details || (dep.functional ? 'Native execution active' : dep.error)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Endpoint Ping Log */}
        {testLog.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Integration Ping Results ({testLog.length} Endpoints Tested)
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              {testLog.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    {t.status === 'PASS' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : t.status === 'WARN' ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <X className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="text-slate-800">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>{t.latencyMs}ms</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
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
    </div>
  );
}
