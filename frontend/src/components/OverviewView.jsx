import React from 'react';

export function OverviewView({ assessmentsList = [], onNavigate, onSelectAssessment, onNewAnalysis }) {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 bg-[#F3F4F6] overflow-y-auto font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Page Header & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono">
                SIH Problem Statement 26107
              </span>
              <span className="text-xs text-slate-500">Bureau of Indian Standards Smart Automation</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Zyntrix BIS Compliance Compiler
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              AI-first compliance assistant translating product artifacts into clause-level BIS applicability, tests, evidence & lab actions.
            </p>
          </div>
          <button
            onClick={onNewAnalysis}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer self-start md:self-auto active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            <span>Analyze a Product</span>
          </button>
        </div>

        {/* SIH Slide 4: Key Impact & Benefit Metrics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Reduction</span>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">95%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              3 Weeks of Gazette Reading & Consulting &rarr; <span className="text-emerald-700 font-semibold">3 Minutes</span> of Deterministic Analysis
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-blue-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost Savings</span>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">80%</div>
            <p className="text-[11px] text-slate-500 mt-1">
              &#8377;50K - &#8377;5L consultant fees &rarr; <span className="text-emerald-700 font-semibold">&#8377;0 - &#8377;10K</span> maximum self-audit
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-indigo-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MSME Beneficiaries</span>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">63M+</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Democratizes access for small manufacturers & startups across all 20,000+ standards
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Market Opportunity</span>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">&#8377;31.5T</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Unlocks dormant domestic manufacturing capability via rapid standard adoption
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Overview Widgets (Left Column - 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Global Verification Index Card */}
            <div className="bg-indigo-600 rounded-xl p-5 text-white relative overflow-hidden shadow-xs">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                    Global Verification Index
                  </h3>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">
                    100% Deterministic
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-bold mt-2 tracking-tight">94.2%</div>
                <p className="text-[11px] mt-2 leading-relaxed opacity-90">
                  Standard compliance certainty grounded on attached NABL certificates and official Gazette indices.
                </p>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-white h-full w-[94%] rounded-full"></div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Portfolio Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{assessmentsList.length}</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Active Products</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">51</div>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">Standards Indexed</div>
                </div>
              </div>
            </div>

            {/* Invariant Rule Banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span className="material-symbols-outlined text-[16px] text-amber-700">shield</span>
                <span>Zero-Hallucination Invariant Gate</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed font-mono font-bold">
                USER_TEXT &ne; EVIDENCE &ne; COMPLIANCE
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                No requirement is marked satisfied without cryptographically verified laboratory test reports or documentary proof.
              </p>
            </div>
          </div>

          {/* Right Column (8 cols): Active Assessments & 9-Layer Architecture */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Slide 3: 9-Stage Architecture Pipeline Stepper */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  9 Sequential Architecture Layers (Slide 3 Pipeline Flow)
                </h2>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active & Operational
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 text-center">
                {[
                  { step: '1', title: 'Input Proc.', sub: 'OCR/Audio/BOM' },
                  { step: '2', title: 'Product DNA', sub: 'JSON AST' },
                  { step: '3', title: 'AI Orchestr.', sub: 'Agents Router' },
                  { step: '4', title: 'Segmented KB', sub: 'IS + Services' },
                  { step: '5', title: 'Applicability', sub: 'Rule Gate' },
                  { step: '6', title: 'Clause RAG', sub: 'BM25 + Dense' },
                  { step: '7', title: 'Gap Engine', sub: 'Verdict States' },
                  { step: '8', title: 'Source Valid.', sub: 'Citation Guard' },
                  { step: '9', title: 'Output Layer', sub: 'Passport/Graph' },
                ].map((s) => (
                  <div key={s.step} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] font-mono font-bold text-indigo-600">{s.step}</div>
                    <div className="text-[11px] font-bold text-slate-900 leading-tight mt-0.5">{s.title}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 leading-none">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Assessments Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Your Product Assessments</h2>
                  <p className="text-xs text-slate-500">Traceable compliance workspaces currently managed</p>
                </div>
                {assessmentsList.length > 0 && (
                  <button
                    onClick={onNewAnalysis}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Add Product</span>
                  </button>
                )}
              </div>

              {assessmentsList.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[24px]">post_add</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">No Assessments Created Yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Start fresh by entering your product details. Zyntrix will discover applicable BIS standards and build your testing roadmap.
                    </p>
                  </div>
                  <button
                    onClick={onNewAnalysis}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Start First Product Assessment</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Assessment #</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assessmentsList.map((a) => (
                        <tr key={a.assessment_id} className="hover:bg-slate-50 transition group">
                          <td className="py-3 px-3 font-mono text-slate-500 font-medium">
                            {a.assessment_number || a.assessment_id?.slice(0, 10)}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {a.product_name || a.title || 'Product Analysis'}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {a.category || 'General'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {a.status || 'EVALUATING'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                onSelectAssessment(a.assessment_id);
                                onNavigate('standards');
                              }}
                              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slide 4 & 5: Strategic Impact & Comparative Solution Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Strategic Impact Pillars (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">verified</span>
              Three Strategic Impact Pillars (Slide 4)
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Economic Impact (Unlocking Domestic Value Chains)
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Speeds time-to-market by 4 to 8 weeks, reduces operational overhead for audits, and redirects capital back to MSME research.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Social Impact (Democratizing Regulatory Access)
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Vernacular language support bridges the gap for rural innovators, leveling the playing field between startups and corporate giants.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Governance & Trust (Deterministic Zero-Trust Accuracy)
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  100% auditable citation links, slashes counterfeit manufacturing, and integrates cleanly with Manakonline & e-BIS portals.
                </p>
              </div>
            </div>
          </div>

          {/* Solution Comparison Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">compare_arrows</span>
                Comparison with Existing Solutions (Slide 5)
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Competitive Benchmark</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Feature Dimension</th>
                    <th className="py-2.5 px-3 text-indigo-700 font-bold">Zyntrix Compiler</th>
                    <th className="py-2.5 px-3 text-slate-500">Manual Consultants</th>
                    <th className="py-2.5 px-3 text-slate-500">Generic LLMs</th>
                    <th className="py-2.5 px-3 text-slate-500">BIS Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {[
                    { feat: 'Clause-Level Retrieval', z: true, m: false, g: false, b: false },
                    { feat: 'AI-Powered Gap Detection', z: true, m: false, g: false, b: false },
                    { feat: 'Evidence Validation', z: true, m: false, g: false, b: false },
                    { feat: 'Hallucination Guard', z: true, m: false, g: false, b: false },
                    { feat: 'Multi-Modal Input (Voice/PDF)', z: true, m: false, g: true, b: false },
                    { feat: 'Automated Lab Recommendations', z: true, m: false, g: false, b: false },
                    { feat: 'Real-Time Standard Updates', z: true, m: false, g: false, b: false },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-medium text-slate-800">{row.feat}</td>
                      <td className="py-2 px-3">
                        <span className="text-emerald-600 font-bold text-sm">&#10003;</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-rose-400 text-sm">&#10007;</span>
                      </td>
                      <td className="py-2 px-3">
                        {row.g ? (
                          <span className="text-emerald-600 font-bold text-sm">&#10003;</span>
                        ) : (
                          <span className="text-rose-400 text-sm">&#10007;</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-rose-400 text-sm">&#10007;</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
