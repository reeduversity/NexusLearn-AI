'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Save, Trash2, Sparkles, FileText, Loader2, Download } from 'lucide-react'

// ── custom node types ─────────────────────────────────────────────────────────
function NoteNode({ data }: { data: any }) {
  return (
    <div className="rounded-xl border-2 border-indigo-400 bg-white shadow-lg dark:bg-zinc-900 dark:border-indigo-500 min-w-[160px] max-w-[220px]">
      <div className="bg-indigo-500 rounded-t-lg px-3 py-1.5 text-xs font-bold text-white truncate">
        📝 {data.label}
      </div>
      {data.content && (
        <p className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-3">{data.content}</p>
      )}
    </div>
  )
}

function ConceptNode({ data }: { data: any }) {
  return (
    <div className="rounded-full border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/30 shadow-lg px-4 py-3 min-w-[120px] text-center">
      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{data.label}</p>
    </div>
  )
}

function AINode({ data }: { data: any }) {
  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-lg min-w-[160px] max-w-[220px]">
      <div className="bg-amber-400 rounded-t-lg px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1">
        <span>✨</span> AI Suggestion
      </div>
      <p className="px-3 py-2 text-xs text-amber-800 dark:text-amber-200">{data.label}</p>
    </div>
  )
}

const nodeTypes = { note: NoteNode, concept: ConceptNode, ai: AINode }

// ── initial demo canvas state ─────────────────────────────────────────────────
const initialNodes: Node[] = [
  {
    id: 'n1',
    type: 'concept',
    position: { x: 300, y: 100 },
    data: { label: 'Main Topic' },
  },
  {
    id: 'n2',
    type: 'note',
    position: { x: 80, y: 260 },
    data: { label: 'Key Concept A', content: 'Add your notes about this concept here.' },
  },
  {
    id: 'n3',
    type: 'note',
    position: { x: 530, y: 260 },
    data: { label: 'Key Concept B', content: 'Connect related ideas using the edges.' },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1' },
  },
  {
    id: 'e1-3',
    source: 'n1',
    target: 'n3',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1' },
  },
]

const STORAGE_KEY = 'nexuslearn_canvas_state'

export function StudyCanvasClient() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle')
  const [isAILoading, setIsAILoading] = useState(false)
  const [nodeLabel, setNodeLabel] = useState('')
  const [nodeType, setNodeType] = useState<'note' | 'concept'>('concept')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const nodeIdRef = useRef(100)

  // Load saved canvas on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved)
        if (savedNodes?.length) setNodes(savedNodes)
        if (savedEdges?.length) setEdges(savedEdges)
      }
    } catch (_) {}
  }, [])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#6366f1' },
          },
          eds
        )
      ),
    []
  )

  // Save canvas to localStorage + DB
  const handleSave = useCallback(() => {
    setSaveStatus('saving')
    const state = { nodes, edges }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      setTimeout(() => setSaveStatus('saved'), 400)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      console.error('Canvas save failed:', e)
      setSaveStatus('idle')
    }
  }, [nodes, edges])

  // Add a new node
  const handleAddNode = () => {
    if (!nodeLabel.trim()) return
    const id = `n${++nodeIdRef.current}`
    const newNode: Node = {
      id,
      type: nodeType,
      position: { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 },
      data: { label: nodeLabel.trim(), content: '' },
    }
    setNodes((nds) => [...nds, newNode])
    setNodeLabel('')
    setShowAddPanel(false)
  }

  // Add AI suggestion node
  const handleAISuggest = async () => {
    const topicNode = nodes.find((n) => n.type === 'concept')
    if (!topicNode) {
      alert('Add a concept node first to get AI suggestions.')
      return
    }
    setIsAILoading(true)
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Give me 3 important subtopics to study related to: "${topicNode.data.label}". Return a short JSON array of strings only, no explanation.`,
          context_type: 'canvas'
        })
      })
      const data = await res.json()
      const raw: string = data.data?.reply || data.data || ''
      // Parse JSON array from response
      const match = raw.match(/\[[\s\S]*?\]/)
      const suggestions: string[] = match ? JSON.parse(match[0]) : [raw.slice(0, 80)]

      const newNodes: Node[] = suggestions.slice(0, 3).map((s: string, i: number) => ({
        id: `ai${Date.now()}_${i}`,
        type: 'ai',
        position: {
          x: topicNode.position.x - 100 + i * 180,
          y: topicNode.position.y + 200,
        },
        data: { label: s },
      }))
      const newEdges: Edge[] = newNodes.map((n) => ({
        id: `e_${topicNode.id}_${n.id}`,
        source: topicNode.id,
        target: n.id,
        animated: false,
        style: { stroke: '#f59e0b', strokeDasharray: '5,5' },
      }))
      setNodes((nds) => [...nds, ...newNodes])
      setEdges((eds) => [...eds, ...newEdges])
    } catch (e) {
      console.error('AI suggestions failed:', e)
    } finally {
      setIsAILoading(false)
    }
  }

  // Export canvas as JSON
  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'study-canvas.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const canvasState = JSON.stringify({ nodes, edges })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setShowAddPanel((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          id="add-node-btn"
        >
          <Plus className="h-4 w-4" /> Add Node
        </button>

        <button
          onClick={handleAISuggest}
          disabled={isAILoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          id="ai-suggest-btn"
        >
          {isAILoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          AI Suggest
        </button>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          id="save-canvas-btn"
        >
          <Save className="h-4 w-4" />
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save'}
        </button>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          id="export-canvas-btn"
        >
          <Download className="h-4 w-4" /> Export JSON
        </button>

        <button
          onClick={() => {
            setNodes(initialNodes)
            setEdges(initialEdges)
            localStorage.removeItem(STORAGE_KEY)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          id="clear-canvas-btn"
        >
          <Trash2 className="h-4 w-4" /> Clear
        </button>
      </div>

      {/* Add node panel */}
      {showAddPanel && (
        <div className="flex gap-2 items-center rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-900 p-3">
          <select
            value={nodeType}
            onChange={(e) => setNodeType(e.target.value as 'note' | 'concept')}
            className="rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-sm"
          >
            <option value="concept">Concept</option>
            <option value="note">Note</option>
          </select>
          <input
            type="text"
            placeholder="Node label…"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
            className="flex-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm"
            id="node-label-input"
          />
          <button
            onClick={handleAddNode}
            disabled={!nodeLabel.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      {/* ReactFlow Canvas */}
      <div
        className="h-[540px] w-full rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm"
        id="study-canvas"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode="Delete"
          minZoom={0.2}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="#e5e7eb" />
          <Controls />
          <MiniMap
            nodeColor={(n) =>
              n.type === 'ai' ? '#f59e0b' : n.type === 'concept' ? '#a855f7' : '#6366f1'
            }
            style={{ background: '#f9fafb' }}
          />
        </ReactFlow>
      </div>

      {/* Canvas state JSON (for validation) */}
      <details className="rounded-lg border border-gray-200 dark:border-zinc-800 text-xs">
        <summary className="cursor-pointer px-4 py-2 font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Canvas State JSON
        </summary>
        <pre className="overflow-auto p-4 bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 max-h-48">
          {JSON.stringify({ nodeCount: nodes.length, edgeCount: edges.length, nodes, edges }, null, 2)}
        </pre>
      </details>
    </div>
  )
}
