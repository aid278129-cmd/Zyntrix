import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HealthDiagnosticPanel } from './components/HealthDiagnosticPanel';
import { ModuleCard } from './components/ModuleCard';
import { CitationViewer } from './components/CitationViewer';
import { StatusBadge } from './components/StatusBadge';
import {
  ShieldAlert,
  Dna,
  BookOpen,
  GitFork,
  FileCheck2,
  Server,
  Layers,
  Cpu,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.warn('Backend connection error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/v1/system/info');
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
      }
    } catch (err) {
      console.warn('System info error:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchSystemInfo();
  }, []);

  const tabs = [
    { id: 'diagnostics', label: 'Architecture & Health (M0)', icon: Cpu },
    { id: 'dna', label: 'Product DNA Engine', icon: Dna },
    { id: 'knowledge', label: 'BIS Standards & Clauses', icon: BookOpen },
    { id: 'citation', label: 'Citation Guard & Evidence', icon: ShieldAlert },
    { id: 'passport', label: 'Compliance Passport', icon: FileCheck2 },
  ];

  const modules = [
    {
      code: 'MOD-01',
      title: 'FastAPI Gateway & Async Core',
      status: 'READY',
      description:
        'Asynchronous Python 3.14/FastAPI gateway with Request-ID tracing, CORS configuration, and sensitive data sanitization.',
      implementedItems: ['Async request pipeline', 'Structured Request-ID logging', 'Security MIME validators', 'Custom exception handlers'],
      plannedItems: ['Rate limiting policies', 'Authentication JWT middleware'],
    },
    {
      code: 'MOD-02',
      title: 'Database & pgvector Foundation',
      status: 'READY',
      description:
        'SQLAlchemy 2.0 async ORM models with PostgreSQL vector extension abstractions for clause-level embeddings.',
      implementedItems: ['Base declarative audit models', '12 core domain entities', 'pgvector extension health queries'],
      plannedItems: ['Alembic auto-migrations', 'HNSW vector indexing'],
    },
    {
      code: 'MOD-03',
      title: 'Product DNA Schema Layer',
      status: 'READY',
      description:
        'Strictly typed Pydantic models for product technical attributes with full provenance tracking and missing field clarification handlers.',
      implementedItems: ['Core product schema', 'Extensible DNAAttribute model', 'Missing attribute clarification requests'],
      plannedItems: ['BOM file parser (M2)', 'Auto-normalization engine (M1)'],
    },
    {
      code: 'MOD-04',
      title: 'Citation Guard Contract',
      status: 'READY',
      description:
        'Trust-enforcing contract ensuring compliance claims are backed by verifiable Indian Standard clause text.',
      implementedItems: ['Provenance citation models', 'ValidationStatus enum contract', 'Multi-state compliance enum'],
      plannedItems: ['LLM claim-to-evidence cross-checker (M1)', 'Semantic contradiction detector (M1)'],
    },
    {
      code: 'MOD-05',
      title: 'Clause Retrieval & Gap Engine',
      status: 'PLANNED_FOR_M1',
      description:
        'Deterministic rule evaluation engine combined with clause-level RAG for calculating technical compliance gaps.',
      implementedItems: ['Domain model schemas', 'Multi-state evaluation flags'],
      plannedItems: ['PyMuPDF document ingestion (M1)', 'Deterministic Rule Engine APP-xxx (M1)', 'Gap report generator (M1)'],
    },
    {
      code: 'MOD-06',
      title: 'Evidence Graph & React Flow',
      status: 'PLANNED_FOR_M1',
      description:
        'Interactive visual provenance graph connecting claims to standards, clauses, test reports, and labs.',
      implementedItems: ['React architecture foundation', 'Graph node data contracts'],
      plannedItems: ['React Flow visual canvas (M1)', 'Interactive node inspector (M1)'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header health={health} isRefreshing={isRefreshing} onRefresh={fetchHealth} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Core Architecture Notice */}
        <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/50 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <span>Core Architectural Principle</span>
            </div>
            <p className="text-sm font-semibold text-white">
              “LLM generates explanations; retrieved evidence establishes compliance claims.”
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              The LLM is strictly not the compliance authority. Every claim requires clause-level provenance verification.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1 rounded bg-blue-900/40 text-blue-300 text-xs font-mono font-semibold border border-blue-800/60">
              Milestone: M0 Complete
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-t border-x ${
                  isActive
                    ? 'bg-slate-900 text-blue-400 border-slate-800 border-b-slate-900 -mb-px'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-8">
            <HealthDiagnosticPanel health={health} onRefresh={fetchHealth} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  System Architecture Modules
                </h2>
                <span className="text-xs text-slate-400 font-mono">6 Core Subsystems</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((m) => (
                  <ModuleCard key={m.code} {...m} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dna' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Dna className="w-5 h-5 text-blue-400" />
                    Product DNA Engine Architecture (Pydantic Schema)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Structured attribute extraction with provenance tracking and strict clarification triggers.
                  </p>
                </div>
                <StatusBadge status="READY" />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs">
                  <h4 className="text-slate-400 mb-2 font-bold uppercase tracking-wider text-[11px]">
                    Extensible Schema Definition:
                  </h4>
                  <pre className="text-blue-300 leading-relaxed overflow-x-auto">
{`{
  "product_name": "Insulated Water Bottle",
  "category": "Drinkware",
  "materials": ["Stainless Steel 304"],
  "capacity_ml": 750,
  "insulated": true,
  "electrical": false,
  "attributes": [
    {
      "name": "thermal_retention_hrs",
      "value": 6,
      "unit": "hours",
      "provenance": {
        "source_doc": "spec_sheet.pdf",
        "page": 2,
        "confidence": 0.98
      }
    }
  ]
}`}
                  </pre>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-3">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    Zero-Guessing Clarification Policy:
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    If an applicability-critical attribute is missing (e.g. electrical voltage or insulation type), the system will <span className="text-amber-300 font-semibold">NEVER fabricate or guess</span>.
                  </p>
                  <div className="p-3 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 font-mono text-[11px]">
                    &bull; Trigger: MISSING_ATTRIBUTE_CLARIFICATION_REQUIRED<br/>
                    &bull; Action: Prompt user for unambiguous specification.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    BIS Knowledge Base & Indian Standards Schema
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-domain structured repository modeling Indian Standards, Schemes, QCOs, and Clauses.
                  </p>
                </div>
                <StatusBadge status="READY" />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">Standard Catalog</h4>
                  <p className="text-xs text-slate-400 mt-1">IS numbers, QCO notification dates, revision histories, and BIS schemes (Scheme I / CRS).</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">Clause-Level Granularity</h4>
                  <p className="text-xs text-slate-400 mt-1">Hierarchical clauses (4.1, 4.2.1), test methods, and pass/fail parameter criteria.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">Laboratory Registry</h4>
                  <p className="text-xs text-slate-400 mt-1">BIS recognized testing labs, NABL accreditation scopes, and testing parameters.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'citation' && (
          <div className="space-y-6">
            <CitationViewer />
          </div>
        )}

        {activeTab === 'passport' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-blue-400" />
                    Compliance Passport Specification (Auditable & Tamper-Evident)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Digital compliance passport certifying readiness with full cryptographic provenance hash.
                  </p>
                </div>
                <StatusBadge status="PLANNED_FOR_M1" />
              </div>
              <div className="mt-4 p-5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Passport Verification Contract Ready</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Exportable compliance passport including Gap Analysis, Standard Test Methods, and Laboratory Recommendations.
                  </p>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Pydantic Model: CompliancePassportCard
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BIS Compliance Compiler &bull; Team Zyntrix (SIH 2024 / Problem 26107)</span>
          <span>Engineering Foundation &bull; Milestone M0</span>
        </div>
      </footer>
    </div>
  );
}
