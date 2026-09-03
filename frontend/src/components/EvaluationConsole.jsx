import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sliders,
  ShieldAlert,
  AlertCircle,
  FileCheck2,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  Scale,
} from 'lucide-react';

export function EvaluationConsole() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvaluationReport();
  }, []);

  const fetchEvaluationReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/assessments/evaluation/m5');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.warn('Evaluation report error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !report) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-400" />
        <p className="text-xs">Computing empirical metrics across N=30 stratified benchmark cases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-slate-200 font-sans">
      {/* Console Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Audit & Governance
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] font-mono text-slate-400">N=30 Stratified Ground Truth</span>
          </div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Evaluation Console & LLM Authority Audit
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Empirical multi-dimensional accuracy measurements, retrieval ablation comparisons, and compliance decision authority validation.
          </p>
        </div>

        <button
          onClick={fetchEvaluationReport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-evaluate Suite
        </button>
      </div>

      {/* Critical LLM Authority Audit Banner */}
      <div className="p-5 rounded-xl bg-slate-950 border border-emerald-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-white text-sm">LLM Compliance Decision Authority Audit:</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                0 (0.00%) &bull; STRICT ZERO
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every compliance gap verdict is computed by the deterministic Declarative Rule Engine and Requirement Comparator. The LLM operates strictly in explanatory and extraction capacity without decision power.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right font-mono text-xs shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Deterministic Decisions</span>
            <strong className="text-emerald-400 text-base">{report.llm_authority_audit.deterministic_rule_decisions}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">LLM Decisions</span>
            <strong className="text-rose-400 text-base">{report.llm_authority_audit.llm_compliance_decisions}</strong>
          </div>
        </div>
      </div>

      {/* 9-Dimension Metric Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Multi-Dimensional Empirical Measurements (Individual Dimension Scores)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            report.product_dna_evaluation,
            report.attribute_normalization_evaluation,
            report.clarification_evaluation,
            report.standard_identification_evaluation,
            report.retrieval_evaluation,
            report.evidence_extraction_evaluation,
            report.citation_validity_evaluation,
            report.gap_classification_evaluation,
            report.unsupported_claim_blocking,
          ].map((dim, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{dim.dataset_type.split(' ')[0]}</span>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {(dim.accuracy_or_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1">{dim.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Method: {dim.method}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[9px] text-amber-300/80 italic">
                Limitation: {dim.limitations}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retrieval Strategy Ablation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Formal Retrieval Strategy Ablation Study
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Benchmark Sample N=30</span>
        </div>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Strategy Architecture</th>
                <th className="p-3">Recall@1</th>
                <th className="p-3">Recall@3</th>
                <th className="p-3">Recall@5</th>
                <th className="p-3">MRR</th>
                <th className="p-3">Avg Latency (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-200">
              {report.retrieval_ablation.map((row, idx) => (
                <tr key={idx} className={row.strategy.includes('DEFAULT') ? 'bg-blue-950/30' : ''}>
                  <td className="p-3 font-bold text-white">
                    {row.strategy}
                  </td>
                  <td className="p-3">{(row.recall_at_1 * 100).toFixed(0)}%</td>
                  <td className="p-3 font-bold text-emerald-400">{(row.recall_at_3 * 100).toFixed(0)}%</td>
                  <td className="p-3">{(row.recall_at_5 * 100).toFixed(0)}%</td>
                  <td className="p-3 text-blue-400">{row.mrr.toFixed(2)}</td>
                  <td className="p-3 text-slate-400">{row.avg_latency_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retrieval Error Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Categorized Retrieval Error Analysis & Miss Classification
        </h3>
        <div className="space-y-2">
          {report.retrieval_error_analysis.map((err, idx) => (
            <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-blue-400">{err.case_id}:</span>{' '}
                <span className="text-slate-300 font-sans">{err.notes}</span>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Expected: {err.expected_clauses.join(', ') || 'None'} &bull; Retrieved: {err.retrieved_clauses.join(', ') || 'None'}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                {err.error_type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers & Limitations */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <strong className="text-slate-300 uppercase tracking-wider block">Empirical Measurement Honesty Disclaimer:</strong>
        <p>{report.disclaimer}</p>
      </div>
    </div>
  );
}
