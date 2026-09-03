import React from 'react';

const STATUS_CONFIGS = {
  // Compliance statuses
  SATISFIED: {
    bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    dot: 'bg-emerald-400',
    label: 'SATISFIED',
  },
  POTENTIALLY_SATISFIED: {
    bg: 'bg-teal-950/80 text-teal-300 border-teal-700/60',
    dot: 'bg-teal-400',
    label: 'POTENTIALLY SATISFIED',
  },
  MISSING_EVIDENCE: {
    bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    dot: 'bg-amber-400',
    label: 'MISSING EVIDENCE',
  },
  MORE_INFORMATION_REQUIRED: {
    bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    dot: 'bg-blue-400',
    label: 'CLARIFICATION NEEDED',
  },
  POTENTIAL_GAP: {
    bg: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    dot: 'bg-rose-400',
    label: 'POTENTIAL GAP',
  },
  NOT_APPLICABLE: {
    bg: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
    dot: 'bg-slate-500',
    label: 'NOT APPLICABLE',
  },
  CONFLICTING_EVIDENCE: {
    bg: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    dot: 'bg-purple-400',
    label: 'CONFLICTING EVIDENCE',
  },
  REQUIRES_EXPERT_REVIEW: {
    bg: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
    dot: 'bg-orange-400',
    label: 'EXPERT REVIEW',
  },
  // Applicability statuses
  LIKELY_APPLICABLE: {
    bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    dot: 'bg-indigo-400',
    label: 'LIKELY APPLICABLE',
  },
  POSSIBLY_APPLICABLE: {
    bg: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
    dot: 'bg-sky-400',
    label: 'POSSIBLY APPLICABLE',
  },
  // General
  READY: {
    bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    dot: 'bg-blue-400',
    label: 'FOUNDATION READY',
  },
  PLANNED_FOR_M1: {
    bg: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
    dot: 'bg-slate-500',
    label: 'PLANNED FOR M1',
  },
};

export function StatusBadge({ status, customLabel }) {
  const config = STATUS_CONFIGS[status] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    label: status || 'UNKNOWN',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {customLabel || config.label}
    </span>
  );
}
