import React, { useState } from 'react';
import {
  FileSearch,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  FlaskConical,
  Building2,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function RetrievalDebugPanel() {
  const [query, setQuery] = useState('stainless steel food contact material grade 304');
  const [retrievalMode, setRetrievalMode] = useState('HYBRID');
  const [alpha, setAlpha] = useState(0.5);
  const [beta, setBeta] = useState(0.5);
  const [topK, setTopK] = useState(5);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [benchmarkReport, setBenchmarkReport] = useState(null);
  const [testRoadmap, setTestRoadmap] = useState([]);
  const [laboratories, setLaboratories] = useState([]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          top_k: topK,
          verified_only: verifiedOnly,
          include_unverified: !verifiedOnly,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.warn('Search query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadBenchmark = async () => {
    try {
      const res = await fetch('/api/v1/products/evaluation/m3-benchmark');
      if (res.ok) {
        const data = await res.json();
        setBenchmarkReport(data);
      }
    } catch (err) {
      console.warn('Benchmark fetch error:', err);
    }
  };

  const handleLoadLabRoadmap = async () => {
    try {
      const [rRes, lRes] = await Promise.all([
        fetch('/api/v1/products/testing-roadmap/IS%2017526:2021'),
        fetch('/api/v1/products/laboratories/IS%2017526:2021'),
      ]);
      if (rRes.ok && lRes.ok) {
        setTestRoadmap(await rRes.json());
        setLaboratories(await lRes.json());
      }
    } catch (err) {
      console.warn('Lab roadmap error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-blue-400" />
              Hybrid Retrieval Debugger & Evidence Intelligence (M3)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              BM25 Lexical + pgvector Dense Vector candidate generation with cross-matching reranking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadBenchmark}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Run Benchmark (N=10)
            </button>
            <button
              onClick={handleLoadLabRoadmap}
              className="px-3 py-1.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-semibold border border-blue-700 transition"
            >
              Load Lab Roadmap
            </button>
          </div>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSearch} className="mt-5 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter technical clause query..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {isLoading ? 'Retrieving...' : 'Search'}
            </button>
          </div>

          {/* Hyperparameter Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Retrieval Mode:</label>
              <select
                value={retrievalMode}
                onChange={(e) => setRetrievalMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                <option value="HYBRID">HYBRID (Lexical + Dense)</option>
                <option value="DENSE">DENSE (pgvector only)</option>
                <option value="LEXICAL">LEXICAL (BM25 only)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Lexical Weight (α): {alpha}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Dense Weight (β): {beta}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span className="text-slate-300 text-xs">Verified Only</span>
            </div>
          </div>
        </form>
      </div>

      {/* Benchmark Summary View */}
      {benchmarkReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Expanded Development Benchmark (N={benchmarkReport.sample_size})
            </h4>
            <span className="text-emerald-400 font-mono font-bold">
              Recall@3: {(benchmarkReport.recall_at_3 * 100).toFixed(0)}% | MRR: {benchmarkReport.mrr}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <strong className="text-blue-400">Benchmark Scope Clarification:</strong> While expanded from N=1 to N=10, this is a strictly controlled engineering development benchmark. No claims of nationwide corpus accuracy or generalized production certainty are asserted.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Recall@1</span>
              <div className="text-lg font-bold text-white font-mono">
                {(benchmarkReport.recall_at_1 * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Recall@3</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {(benchmarkReport.recall_at_3 * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Citation Validity</span>
              <div className="text-lg font-bold text-blue-400 font-mono">
                {(benchmarkReport.citation_validity_rate * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">LLM Decision Authority</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {benchmarkReport.llm_decision_authority} (0%)
              </div>
            </div>
          </div>

          {/* Ablation Study Table */}
          <div className="pt-2">
            <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px]">Retrieval Ablation Comparison:</h5>
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-1.5">Method</th>
                  <th className="pb-1.5">Recall@1</th>
                  <th className="pb-1.5">Recall@3</th>
                  <th className="pb-1.5">Recall@5</th>
                  <th className="pb-1.5">MRR</th>
                  <th className="pb-1.5">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {benchmarkReport.ablation_comparison.map((ab, i) => (
                  <tr key={i}>
                    <td className="py-2 text-blue-300 font-bold">{ab.retrieval_method}</td>
                    <td className="py-2">{(ab.recall_at_1 * 100).toFixed(0)}%</td>
                    <td className="py-2">{(ab.recall_at_3 * 100).toFixed(0)}%</td>
                    <td className="py-2">{(ab.recall_at_5 * 100).toFixed(0)}%</td>
                    <td className="py-2 text-emerald-400 font-bold">{ab.mrr}</td>
                    <td className="py-2 text-slate-400">{ab.avg_latency_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Roadmap and Laboratories View */}
      {testRoadmap.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                Verified Standard Test Roadmap (IS 17526:2021)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Compiled testing parameter roadmap. The platform produces regulatory test specifications and apparatus schedules; it does not claim to physically execute laboratory experiments.
              </p>
            </div>
            <div className="space-y-2">
              {testRoadmap.map((t, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Clause {t.clause_number}: {t.test_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{t.requirement_code}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{t.pass_criteria}</p>
                  <div className="text-[10px] text-blue-400 font-mono">Apparatus: {t.required_apparatus}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              BIS-Recognized & NABL-Accredited Laboratories
            </h4>
            <div className="space-y-2">
              {laboratories.map((l, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{l.name}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">NABL ACCREDITED</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{l.location}, {l.state}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Accredited: {l.accredited_standards.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Retrieved Candidates List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white">Retrieved Clauses ({results.length} Candidates)</h4>
          <span className="text-xs font-mono text-slate-400">Reranked & De-duplicated</span>
        </div>

        {results.length === 0 ? (
          <div className="text-slate-500 text-center py-6 text-xs">
            Execute search above to inspect lexical, dense, and rerank scores.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((c, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400">Clause {c.clause_number}:</span>
                    <span className="font-bold text-white">{c.clause_title}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Lex: {c.lexical_score?.toFixed(3) || '0.000'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Dense: {c.dense_score?.toFixed(3) || '0.000'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      Final: {c.final_score?.toFixed(3) || '0.000'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                  {c.text_content}
                </p>

                {c.parent_clause && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Parent Context (Clause {c.parent_clause.clause_number}):</strong> {c.parent_clause.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}