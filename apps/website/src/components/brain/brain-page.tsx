"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Brain,
  Network,
  Filter,
  Loader2,
  Search,
  Info,
  Calendar,
  ArrowRight,
  User,
  FileText,
  CheckCircle2,
  Compass,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Graph types
interface GraphNode {
  id: string;
  label: string;
  type: "source" | "task" | "decision" | "person" | "project";
  details?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalData: any;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
}

export function BrainPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "source",
    "task",
    "decision",
    "person",
    "project",
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Simulation and interaction states
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch all memory components on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [srcs, tsks, decs, ppl, prjs] = await Promise.all([
          api.sources.list().catch(() => []),
          api.tasks.list().catch(() => []),
          api.decisions.list().catch(() => []),
          api.people.list().catch(() => []),
          api.projects.list().catch(() => []),
        ]);

        setSources(srcs || []);
        setTasks(tsks || []);
        setDecisions(decs || []);
        setPeople(ppl || []);
        setProjects(prjs || []);
      } catch (err) {
        console.error("Failed to load memory graph data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Build nodes and links from real data
  const { rawNodes, rawLinks } = useMemo(() => {
    const nodesMap = new Map<string, Omit<GraphNode, "x" | "y" | "vx" | "vy">>();
    const links: GraphLink[] = [];

    // 1. Add Sources
    sources.forEach((s) => {
      nodesMap.set(`src-${s.id}`, {
        id: `src-${s.id}`,
        label: s.title || s.label || `Journal Note`,
        type: "source",
        details: s.content || s.description || "",
        radius: 14,
        color: "#58CC02", // Primary Emerald Green
        originalData: s,
      });
    });

    // 2. Add Tasks
    tasks.forEach((t) => {
      nodesMap.set(`task-${t.id}`, {
        id: `task-${t.id}`,
        label: t.title || "Task",
        type: "task",
        details: t.description || `Status: ${t.status}`,
        radius: 11,
        color: "#FF9600", // Warm Orange
        originalData: t,
      });

      // Link Task to its Source
      if (t.sourceId && nodesMap.has(`src-${t.sourceId}`)) {
        links.push({
          source: `src-${t.sourceId}`,
          target: `task-${t.id}`,
          type: "extracts",
        });
      }
      // Link Task to Project
      if (t.projectId && nodesMap.has(`project-${t.projectId}`)) {
        links.push({
          source: `task-${t.id}`,
          target: `project-${t.projectId}`,
          type: "belongs_to",
        });
      }
    });

    // 3. Add Decisions
    decisions.forEach((d) => {
      nodesMap.set(`dec-${d.id}`, {
        id: `dec-${d.id}`,
        label: d.title || "Decision",
        type: "decision",
        details: d.decisionText || d.reason || "",
        radius: 12,
        color: "#FFC800", // Yellow Accent
        originalData: d,
      });

      if (d.sourceId && nodesMap.has(`src-${d.sourceId}`)) {
        links.push({
          source: `src-${d.sourceId}`,
          target: `dec-${d.id}`,
          type: "records",
        });
      }
      if (d.projectId && nodesMap.has(`project-${d.projectId}`)) {
        links.push({
          source: `dec-${d.id}`,
          target: `project-${d.projectId}`,
          type: "relates_to",
        });
      }
    });

    // 4. Add People
    people.forEach((p) => {
      nodesMap.set(`person-${p.id}`, {
        id: `person-${p.id}`,
        label: p.name || "Unknown Person",
        type: "person",
        details: `${p.role || ""} ${p.company || ""}. Notes: ${p.notes || ""}`,
        radius: 12,
        color: "#1CB0F6", // Macaw Blue
        originalData: p,
      });
    });

    // 5. Add Projects
    projects.forEach((pr) => {
      nodesMap.set(`project-${pr.id}`, {
        id: `project-${pr.id}`,
        label: pr.name || "Project",
        type: "project",
        details: pr.description || "",
        radius: 16,
        color: "#CE82FF", // Purple Accent
        originalData: pr,
      });
    });

    // Cross-links from tasks to people
    tasks.forEach((t) => {
      if (t.relatedPersonId && nodesMap.has(`person-${t.relatedPersonId}`)) {
        links.push({
          source: `task-${t.id}`,
          target: `person-${t.relatedPersonId}`,
          type: "assigned_to",
        });
      }
    });

    // Initialize random positions for force simulation
    const nodes: GraphNode[] = Array.from(nodesMap.values()).map((n, i) => {
      const angle = (i / nodesMap.size) * Math.PI * 2;
      const dist = 100 + Math.random() * 100;
      return {
        ...n,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      };
    });

    return { rawNodes: nodes, rawLinks: links };
  }, [sources, tasks, decisions, people, projects]);

  // Filter nodes & links based on user parameters
  const { nodes, links } = useMemo(() => {
    const activeNodeIds = new Set<string>();

    const filteredNodes = rawNodes.filter((n) => {
      const typeMatches = selectedTypes.includes(n.type);
      const queryMatches =
        searchQuery === "" ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.details && n.details.toLowerCase().includes(searchQuery.toLowerCase()));

      if (typeMatches && queryMatches) {
        activeNodeIds.add(n.id);
        return true;
      }
      return false;
    });

    const filteredLinks = rawLinks
      .filter((l) => activeNodeIds.has(l.source) && activeNodeIds.has(l.target))
      .map((l) => ({
        ...l,
        sourceNode: filteredNodes.find((n) => n.id === l.source),
        targetNode: filteredNodes.find((n) => n.id === l.target),
      }));

    return { nodes: filteredNodes, links: filteredLinks };
  }, [rawNodes, rawLinks, selectedTypes, searchQuery]);

  // Handle graph force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    let animId: number;
    const gravity = 0.035;
    const friction = 0.88;
    const repelForce = 350;
    const linkForce = 0.055;
    const minDistance = 75;

    const tick = () => {
      // 1. Force towards center
      nodes.forEach((n) => {
        if (n === draggedNode) return;
        n.vx -= n.x * gravity;
        n.vy -= n.y * gravity;
      });

      // 2. Electrostatic repulsion (all pairs)
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < minDistance * 2.5) {
            const force = repelForce / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1 !== draggedNode) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== draggedNode) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 3. Link spring tension
      links.forEach((l) => {
        if (!l.sourceNode || !l.targetNode) return;
        const s = l.sourceNode;
        const t = l.targetNode;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - minDistance) * linkForce;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (s !== draggedNode) {
          s.vx += fx;
          s.vy += fy;
        }
        if (t !== draggedNode) {
          t.vx -= fx;
          t.vy -= fy;
        }
      });

      // 4. Apply velocity + friction
      nodes.forEach((n) => {
        if (n === draggedNode) return;
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= friction;
        n.vy *= friction;
      });

      draw();
      animId = requestAnimationFrame(tick);
    };

    // Render loop helper
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fit to container dimensions
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 500;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Translate to center + apply zoom/pan
      ctx.translate(width / 2 + transform.x, height / 2 + transform.y);
      ctx.scale(transform.scale, transform.scale);

      // Draw link lines
      links.forEach((l) => {
        if (!l.sourceNode || !l.targetNode) return;
        ctx.beginPath();
        ctx.moveTo(l.sourceNode.x, l.sourceNode.y);
        ctx.lineTo(l.targetNode.x, l.targetNode.y);
        ctx.strokeStyle = "rgba(100, 110, 100, 0.18)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((n) => {
        const isHovered = false; // Add hover state check if needed
        const isSelected = selectedNode?.id === n.id;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

        // Fill with subtle glow
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isSelected ? 18 : 6;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Custom borders for selection
        ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Node Title Text
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
        ctx.font = isSelected ? "bold 11px system-ui" : "normal 10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(
          n.label.length > 18 ? n.label.slice(0, 16) + "..." : n.label,
          n.x,
          n.y + n.radius + 5
        );
      });

      ctx.restore();
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [nodes, links, transform, selectedNode, draggedNode]);

  // Click & Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert screen coordinate to graph space coordinate
    const graphX = (clientX - canvas.width / 2 - transform.x) / transform.scale;
    const graphY = (clientY - canvas.height / 2 - transform.y) / transform.scale;

    // Check if clicked a node
    let clickedNode: GraphNode | null = null;
    for (let n of nodes) {
      const dx = graphX - n.x;
      const dy = graphY - n.y;
      if (dx * dx + dy * dy < n.radius * n.radius * 2) {
        clickedNode = n;
        break;
      }
    }

    if (clickedNode) {
      setDraggedNode(clickedNode);
      setSelectedNode(clickedNode);
    } else {
      // Start drag panning
      const startX = e.clientX;
      const startY = e.clientY;
      const startTrans = { ...transform };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        setTransform({
          ...startTrans,
          x: startTrans.x + (moveEvent.clientX - startX),
          y: startTrans.y + (moveEvent.clientY - startY),
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    draggedNode.x = (clientX - canvas.width / 2 - transform.x) / transform.scale;
    draggedNode.y = (clientY - canvas.height / 2 - transform.y) / transform.scale;
  };

  const handleMouseUpOrLeave = () => {
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.085;
    const zoomFactor = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.25, Math.min(4, prev.scale * zoomFactor)),
    }));
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const nodeStats = useMemo(() => {
    return {
      sources: rawNodes.filter((n) => n.type === "source").length,
      tasks: rawNodes.filter((n) => n.type === "task").length,
      decisions: rawNodes.filter((n) => n.type === "decision").length,
      people: rawNodes.filter((n) => n.type === "person").length,
      projects: rawNodes.filter((n) => n.type === "project").length,
    };
  }, [rawNodes]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#090d08] via-[#0b100a] to-[#080b07] relative overflow-hidden select-none">
      {/* Visual background lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-primary/[0.03] blur-[100px] pointer-events-none" />

      {/* Main Header */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-border/20 z-10 shrink-0 bg-zinc-950/25 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 font-[var(--font-nunito)]">
            <Brain className="w-5 h-5 text-primary" />
            Second Brain
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize connection paths, core memories, and relationships in your cognitive database.
          </p>
        </div>

        {/* Global stats bar */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3 md:mt-0 text-[10px] font-semibold tracking-wide uppercase">
          <Badge variant="outline" className="border-border/30 bg-card/25 gap-1 text-[#58CC02]">
            {nodeStats.sources} Notes
          </Badge>
          <Badge variant="outline" className="border-border/30 bg-card/25 gap-1 text-[#FF9600]">
            {nodeStats.tasks} Tasks
          </Badge>
          <Badge variant="outline" className="border-border/30 bg-card/25 gap-1 text-[#FFC800]">
            {nodeStats.decisions} Decisions
          </Badge>
          <Badge variant="outline" className="border-border/30 bg-card/25 gap-1 text-[#1CB0F6]">
            {nodeStats.people} People
          </Badge>
          <Badge variant="outline" className="border-border/30 bg-card/25 gap-1 text-[#CE82FF]">
            {nodeStats.projects} Projects
          </Badge>
        </div>
      </div>

      {/* Layout workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Graph Viewer Column */}
        <div
          ref={containerRef}
          className={cn(
            "flex-1 flex flex-col relative min-w-0 transition-all",
            isFullscreen && "absolute inset-0 z-50 bg-background"
          )}
        >
          {/* Filtering and Controls floating block */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search cognitive map..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-zinc-950/60 border-border/40 w-48 focus-visible:ring-primary rounded-xl"
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-xl border-border/40 bg-zinc-950/60 text-muted-foreground hover:text-foreground"
                onClick={() => setIsFullscreen((prev) => !prev)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Graph"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {/* Type Toggles */}
            <div className="flex flex-wrap gap-1 bg-zinc-950/60 backdrop-blur-md p-1.5 border border-border/20 rounded-2xl">
              {[
                { type: "source", color: "bg-[#58CC02]", label: "Notes" },
                { type: "task", color: "bg-[#FF9600]", label: "Tasks" },
                { type: "decision", color: "bg-[#FFC800]", label: "Decisions" },
                { type: "person", color: "bg-[#1CB0F6]", label: "People" },
                { type: "project", color: "bg-[#CE82FF]", label: "Projects" },
              ].map((filter) => {
                const isActive = selectedTypes.includes(filter.type);
                return (
                  <button
                    key={filter.type}
                    onClick={() => toggleTypeFilter(filter.type)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all select-none border border-transparent",
                      isActive
                        ? "bg-zinc-800/80 text-foreground border-zinc-700/60 shadow-sm"
                        : "text-muted-foreground/60 hover:text-muted-foreground bg-transparent"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", filter.color)} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs font-medium gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Recalculating synapse vectors...
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center p-6 gap-2">
              <Network className="w-10 h-10 text-muted-foreground/30 animate-pulse" />
              <p className="text-xs font-semibold">No connected memories match your filters</p>
              <p className="text-[10px] text-muted-foreground/60 max-w-xs leading-relaxed">
                Add daily journals, record transcripts, or widen search terms to generate paths.
              </p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onWheel={handleWheel}
              className="flex-1 cursor-grab active:cursor-grabbing"
            />
          )}

          {/* Interactive Help Hint */}
          <div className="absolute bottom-4 left-4 z-10 bg-zinc-950/40 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-border/10 text-[9px] text-muted-foreground/80 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-primary" />
            Drag nodes to organize. Scroll wheel to zoom. Click node to inspect details.
          </div>
        </div>

        {/* Sidebar Inspector Panel */}
        <div
          className={cn(
            "w-80 border-l border-border/20 bg-zinc-950/20 backdrop-blur-md flex flex-col z-20 shrink-0 transition-transform duration-300",
            selectedNode ? "translate-x-0" : "translate-x-full absolute right-0 top-0 bottom-0 md:relative md:translate-x-0 md:opacity-0 md:pointer-events-none"
          )}
        >
          {selectedNode ? (
            <div className="flex-1 flex flex-col min-h-0 divide-y divide-border/20">
              {/* Node Header */}
              <div className="p-4 flex items-start justify-between gap-3 bg-zinc-950/40">
                <div className="flex-1 min-w-0">
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md text-foreground"
                    style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
                  >
                    {selectedNode.type}
                  </span>
                  <h3 className="text-sm font-bold mt-2 truncate text-foreground font-[var(--font-nunito)]">
                    {selectedNode.label}
                  </h3>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-md hover:bg-zinc-800 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedNode(null)}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Node Details */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-none">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Content Summary</p>
                  <div className="p-3 bg-zinc-900/35 border border-border/10 rounded-xl leading-relaxed text-muted-foreground whitespace-pre-wrap select-text">
                    {selectedNode.details || "No further details extracted for this memory node."}
                  </div>
                </div>

                {/* Additional parameters parsed dynamically based on node type */}
                {selectedNode.type === "source" && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Source Metadata</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-900/20 p-2.5 border border-border/10 rounded-xl">
                      <div>
                        <span className="text-muted-foreground/60 block">Medium Type:</span>
                        <span className="font-semibold capitalize text-foreground">{selectedNode.originalData.type || "journal"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 block">Ingested Date:</span>
                        <span className="font-semibold text-foreground">
                          {selectedNode.originalData.createdAt
                            ? new Date(selectedNode.originalData.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === "task" && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Task Info</p>
                    <div className="space-y-2 bg-zinc-900/20 p-2.5 border border-border/10 rounded-xl text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground/60">Status:</span>
                        <span className="font-bold capitalize text-primary">{selectedNode.originalData.status || "todo"}</span>
                      </div>
                      {selectedNode.originalData.dueAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground/60">Due Date:</span>
                          <span className="font-semibold text-foreground">
                            {new Date(selectedNode.originalData.dueAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* List connected nodes */}
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Connected Synapses</p>
                  <div className="space-y-1.5">
                    {links
                      .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                      .map((l) => {
                        const targetNode = l.source === selectedNode.id ? l.targetNode : l.sourceNode;
                        if (!targetNode) return null;
                        return (
                          <button
                            key={targetNode.id}
                            onClick={() => setSelectedNode(targetNode)}
                            className="w-full flex items-center justify-between p-2 rounded-xl border border-border/10 bg-zinc-900/10 hover:bg-zinc-800/30 transition text-left"
                          >
                            <span className="font-medium truncate max-w-[140px] text-muted-foreground hover:text-foreground">
                              {targetNode.label}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[8px] tracking-wider uppercase border-border/20 px-1 py-0.5 rounded-md pointer-events-none"
                              style={{ color: targetNode.color }}
                            >
                              {targetNode.type}
                            </Badge>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Sparkles className="w-8 h-8 text-primary/30 mb-3 animate-pulse" />
              <p className="text-xs font-semibold">Node Inspector</p>
              <p className="text-[10px] text-muted-foreground/50 max-w-xs mt-1 leading-relaxed">
                Select any visual element on the neural network to dissect its contents, metadata details, and synapse connections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
