import React, { useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Layers,
  Dna,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function EvidenceGraphCanvas({ graphData }) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-300">No Evidence Graph Generated Yet</p>
        <p className="text-xs text-slate-500 mt-1">Analyze a product to visualize the compliance evidence trace.</p>
      </div>
    );
  }

  // Node styling mapper
  const styledNodes = graphData.nodes.map((node) => {
    let borderColor = 'border-slate-700';
    let bgColor = 'bg-slate-950';
    let title = node.data?.label || node.id;
    let subtitle = node.type;

    if (node.type === 'productNode') {
      borderColor = 'border-blue-600';
      bgColor = 'bg-blue-950/80';
      title = node.data?.label;
      subtitle = `Product: ${node.data?.category}`;
    } else if (node.type === 'standardNode') {
      borderColor = 'border-amber-600';
      bgColor = 'bg-amber-950/80';
      title = node.data?.standard_number;
      subtitle = node.data?.title;
    } else if (node.type === 'clauseNode') {
      borderColor = 'border-purple-600';
      bgColor = 'bg-purple-950/80';
      title = `Clause ${node.data?.clause_number}`;
      subtitle = node.data?.title;
    } else if (node.type === 'requirementNode') {
      borderColor = 'border-indigo-600';
      bgColor = 'bg-indigo-950/80';
      title = node.data?.code;
      subtitle = node.data?.type;
    } else if (node.type === 'decisionNode') {
      borderColor = 'border-emerald-600';
      bgColor = 'bg-emerald-950/80';
      title = `Status: ${node.data?.status}`;
      subtitle = node.data?.decision_engine;
    } else if (node.type === 'actionNode') {
      borderColor = 'border-rose-600';
      bgColor = 'bg-rose-950/80';
      title = `Action: ${node.data?.action}`;
      subtitle = 'Recommended Pathway';
    }

    return {
      ...node,
      data: {
        ...node.data,
        label: (
          <div
            onClick={() => setSelectedNode(node)}
            className={`p-3 rounded-lg border text-left shadow-lg cursor-pointer ${borderColor} ${bgColor}`}
            style={{ width: '220px' }}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
              {subtitle}
            </div>
            <div className="text-xs font-bold text-white truncate mt-0.5">
              {title}
            </div>
          </div>
        ),
      },
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* React Flow Container */}
      <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-[500px] relative">
        <ReactFlow
          nodes={styledNodes}
          edges={graphData.edges}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#1e293b" gap={16} />
          <Controls className="bg-slate-900 border-slate-700 text-slate-200 fill-slate-200" />
        </ReactFlow>

        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 pointer-events-none flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Evidence Graph: Real Backend IDs (Click any node to inspect provenance)</span>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            Node Inspector
          </h4>
          {selectedNode && (
            <span className="text-[10px] font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-950 border border-blue-800">
              {selectedNode.type}
            </span>
          )}
        </div>

        {selectedNode ? (
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Node ID:</span>
              <div className="font-mono text-slate-200">{selectedNode.id}</div>
            </div>

            {selectedNode.type === 'productNode' && (
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px]">Product:</span>
                  <div className="font-bold text-white">{selectedNode.data?.label}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Category:</span>
                  <div className="text-slate-300">{selectedNode.data?.category}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Declared Materials:</span>
                  <div className="text-blue-300 font-mono">
                    {selectedNode.data?.materials?.join(', ') || 'None'}
                  </div>
                </div>
              </div>
            )}

            {selectedNode.type === 'standardNode' && (
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px]">Standard Number:</span>
                  <div className="font-bold text-amber-400">{selectedNode.data?.standard_number}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Title:</span>
                  <div className="text-slate-300">{selectedNode.data?.title}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Technical Relevance:</span>
                  <div className="text-emerald-400 font-semibold">{selectedNode.data?.technical_relevance}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Regulatory Status:</span>
                  <div className="text-blue-300 font-semibold">{selectedNode.data?.regulatory_status}</div>
                </div>
              </div>
            )}

            {selectedNode.type === 'decisionNode' && (
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px]">Verdict Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedNode.data?.status} />
                  </div>
                </div>
                {selectedNode.data?.action && (
                  <div>
                    <span className="text-slate-500 text-[10px]">Recommended Action:</span>
                    <div className="font-mono text-rose-300 font-bold mt-0.5">
                      {selectedNode.data?.action}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 text-[10px]">Explanation:</span>
                  <p className="text-slate-300 leading-relaxed mt-0.5">
                    {selectedNode.data?.explanation}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500">Decision Authority:</span>
                  <div className="text-[11px] font-mono text-emerald-400">
                    {selectedNode.data?.decision_engine} (LLM Authority = 0)
                  </div>
                </div>
              </div>
            )}

            {selectedNode.type === 'actionNode' && (
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px]">Action Required:</span>
                  <div className="font-mono font-bold text-rose-400">{selectedNode.data?.action}</div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Prescribed operational pathway to resolve evidentiary gap for requirement {selectedNode.data?.target_requirement}.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-8">
            Click on any node in the graph to inspect its attributes, rules, and decision provenance.
          </div>
        )}
      </div>
    </div>
  );
}
