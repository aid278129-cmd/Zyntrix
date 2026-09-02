import React, { useState } from 'react';
import {
  Dna,
  Search,
  Sparkles,
  Layers,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { EvidenceGraphCanvas } from './EvidenceGraphCanvas';

export function ProductWorkspace() {
  const [description, setDescription] = useState(
    'We manufacture a 750 ml double-walled vacuum insulated flask with stainless steel 304 food contact liner for domestic drinking use.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [clarificationAnswers, setClarificationAnswers] = useState({});
  const [authoritativeMode, setAuthoritativeMode] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/v1/products/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description,
          authoritative_mode: authoritativeMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (err) {
      console.warn('Product analysis API error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswerClarification = async (attributeName, value) => {
    if (!analysisResult?.product_id) return;
    try {
      const res = await fetch(`/api/v1/products/${analysisResult.product_id}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attribute: attributeName,
          value: value,
          source: 'USER',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAnalysisResult(updated);
      }
    } catch (err) {
      console.warn('Clarification API error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dna className="w-5 h-5 text-blue-400" />
              Product DNA & Deterministic Compliance Workspace (M2)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Extract structured technical attributes, resolve blocking clarifications, evaluate deterministic rules, and trace evidence graph.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={authoritativeMode}
                onChange={(e) => setAuthoritativeMode(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Authoritative Mode (Verified Only)</span>
            </label>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
              LLM Decision Authority: 0
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Product Specification Description:
          </label>
          <div className="flex gap-3">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description (e.g. materials, dimensions, capacity, voltage, intended use)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Tip: Describe materials (Grade 304 SS), capacity (750 ml), and intended application for accurate rule matching.
            </span>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Extracting & Evaluating...' : 'Analyze Compliance'}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Top Row: Extracted DNA + Clarification Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Extracted DNA Attributes */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Dna className="w-4 h-4 text-blue-400" />
                  Extracted Product DNA
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Category: <strong className="text-blue-300">{analysisResult.product_dna.category}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Identified Product:</span>
                  <div className="font-bold text-white">{analysisResult.product_dna.product_name}</div>
                  <div className="text-slate-400 text-[11px]">Sub-category: {analysisResult.product_dna.sub_category || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Normalized Materials:</span>
                  <div className="font-mono text-blue-300">
                    {analysisResult.product_dna.materials.join(', ') || 'Unspecified'}
                  </div>
                  <div className="text-slate-400 text-[11px]">Intended Use: {analysisResult.product_dna.intended_use || 'General'}</div>
                </div>
              </div>

              {/* Dynamic Extracted Attributes Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2 font-semibold">Attribute</th>
                      <th className="pb-2 font-semibold">Normalized Value</th>
                      <th className="pb-2 font-semibold">Confidence</th>
                      <th className="pb-2 font-semibold">Extraction Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {analysisResult.product_dna.attributes.map((attr, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-mono text-slate-200">{attr.name}</td>
                        <td className="py-2.5 font-bold text-white font-mono">
                          {String(attr.value)} {attr.unit || ''}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {((attr.provenance?.confidence || 1.0) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-400">
                          {attr.provenance?.extraction_method || 'manual'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clarification Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Clarifications Required
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {analysisResult.clarifications.length} Pending
                </span>
              </div>

              {analysisResult.clarifications.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <span>No blocking attributes missing. All parameters required for deterministic evaluation are present.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisResult.clarifications.map((cl, i) => (
                    <div key={i} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{cl.attribute_name}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400">{cl.criticality}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{cl.reason}</p>
                      {cl.options && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cl.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerClarification(cl.attribute_name, opt)}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Deterministic Applicability & Compliance Verdicts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                Applicable Indian Standards & Compliance Decisions
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Mode: <strong className="text-emerald-400">{analysisResult.evaluation_mode}</strong>
              </span>
            </div>

            {analysisResult.applicability.map((app, aIdx) => (
              <div key={aIdx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400">{app.standard_number}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{app.standard_title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {app.technical_relevance}
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {app.regulatory_status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800/80">
                  {app.explanation}
                </p>

                {/* Clause-level Compliance Evaluations */}
                {analysisResult.compliance && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Clause Requirements & Evaluated Verdicts (8-State Model):
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisResult.compliance.evaluations.map((ev, eIdx) => (
                        <div key={eIdx} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[11px] font-bold text-amber-400">
                                Clause {ev.clause_number}:
                              </span>{' '}
                              <span className="font-bold text-white">{ev.clause_title}</span>
                            </div>
                            <StatusBadge status={ev.status} />
                          </div>

                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {ev.explanation}
                          </p>

                          {ev.recommended_action && (
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">Recommended Action:</span>
                              <span className="font-mono font-bold text-[11px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60">
                                {ev.recommended_action}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Row: Interactive React Flow Evidence Graph */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Traceable Evidence Graph (React Flow)
            </h3>
            <EvidenceGraphCanvas graphData={analysisResult.evidence_graph} />
          </div>
        </div>
      )}
    </div>
  );
}
