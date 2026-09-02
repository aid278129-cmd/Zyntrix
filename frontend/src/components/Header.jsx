import React from 'react';
import { ShieldCheck, Database, Layers, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export function Header({ health, isRefreshing, onRefresh }) {
  const getStatusPill = () => {
    if (!health) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-700/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Checking Connection...
        </span>
      );
    }
    if (health.status === 'ok') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Backend Live & Operational
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-950/80 text-rose-300 border border-rose-700/50">
        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
        API Active (Database Degraded)
      </span>
    );
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">BIS Compliance Compiler</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Team Zyntrix
              </span>
            </div>
            <p className="text-xs text-slate-400">
              SIH Problem Statement 26107 &bull; Smart Automation &bull; Evidence-Backed Compliance Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {getStatusPill()}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
            title="Refresh System Health"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
