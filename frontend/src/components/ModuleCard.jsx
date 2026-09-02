import React from 'react';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, Clock } from 'lucide-react';

export function ModuleCard({ title, code, status, description, implementedItems, plannedItems }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
              {code}
            </span>
            <h3 className="text-base font-bold text-white mt-1.5">{title}</h3>
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>

        {implementedItems && implementedItems.length > 0 && (
          <div className="mb-3">
            <h4 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Implemented in M0:
            </h4>
            <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
              {implementedItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {plannedItems && plannedItems.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Planned for M1 / Future:
            </h4>
            <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc">
              {plannedItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Architectural Contract Verified</span>
        <span className="font-mono">P0 Ready</span>
      </div>
    </div>
  );
}
