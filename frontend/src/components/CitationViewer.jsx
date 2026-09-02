import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function CitationViewer() {
  const exampleCitation = {
    standard_number: 'IS 17526:2021',
    standard_title: 'Commercial Beverage Coolers - Specification',
    clause_number: 'Clause 4.2.1',
    clause_title: 'Thermal Insulation and Material Integrity',
    page_number: 7,
    supporting_text:
      'All food-contact surfaces and internal liquid containers shall be constructed of stainless steel conforming to grade 304 or superior non-corrosive alloy.',
    validation_status: 'SATISFIED',
    confidence: '98.4%',
    extraction_source: 'Manufacturer Datasheet (Spec_Rev_2.pdf, Page 3)',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Citation Guard Provenance Model (Zero LLM Fabrications)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every compliance claim must maintain an auditable chain back to the official Indian Standard and source clause.
          </p>
        </div>
        <StatusBadge status="SATISFIED" customLabel="CITATION VERIFIED" />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <FileText className="w-4 h-4" /> Authoritative Indian Standard Clause
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-900/90 p-3 rounded border border-slate-800">
            <span className="text-blue-400 font-bold">{exampleCitation.standard_number}</span> &bull;{' '}
            <span className="text-amber-400 font-semibold">{exampleCitation.clause_number}</span> (Page {exampleCitation.page_number})
            <p className="mt-2 text-slate-300 font-sans italic">"{exampleCitation.supporting_text}"</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <Bookmark className="w-4 h-4" /> Verified Product Evidence & Provenance
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-900/90 p-3 rounded border border-slate-800 space-y-2">
            <div>
              <span className="text-slate-400">Source:</span> {exampleCitation.extraction_source}
            </div>
            <div>
              <span className="text-slate-400">Extracted Material:</span> Stainless Steel Grade 304
            </div>
            <div>
              <span className="text-slate-400">Citation Guard Status:</span>{' '}
              <span className="text-emerald-400 font-semibold">SUPPORTED (Score: {exampleCitation.confidence})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
