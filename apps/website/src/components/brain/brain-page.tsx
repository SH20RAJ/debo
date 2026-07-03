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
 Plus,
 Minus,
 X,
} from "lucide-react";
import { api } from "@/lib/api";
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
 z: number;
 vx: number;
 vy: number;
 vz: number;
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
 const [sidebarListType, setSidebarListType] = useState<"source" | "task" | "decision" | "person" | "project" | null>(null);
 const [peekJournal, setPeekJournal] = useState<any | null>(null);
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
 const [rotation, setRotation] = useState({ pitch: -0.25, yaw: 0.6 });
 const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
 const draggedNodeZRef = useRef<number>(0);
 const timeRef = useRef<number>(0);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [activeBrainWave, setActiveBrainWave] = useState<"gamma" | "beta" | "alpha" | "theta" | "delta">("alpha");

 const waveParams = useMemo(() => {
 switch (activeBrainWave) {
 case "gamma":
 return {
 label: "Gamma (30-100 Hz - High Focus)",
 color: "#a855f7",
 repel: 300,
 link: 0.08,
 gravity: 0.05,
 speed: 2.2,
 particleSize: 2.5,
 particleCount: 5,
 };
 case "beta":
 return {
 label: "Beta (12-30 Hz - Active Processing)",
 color: "#0ea5e9",
 repel: 350,
 link: 0.055,
 gravity: 0.035,
 speed: 1.4,
 particleSize: 2.0,
 particleCount: 3,
 };
 case "alpha":
 return {
 label: "Alpha (8-12 Hz - Relaxed Focus)",
 color: "#10b981",
 repel: 320,
 link: 0.045,
 gravity: 0.025,
 speed: 0.8,
 particleSize: 2.0,
 particleCount: 2,
 };
 case "theta":
 return {
 label: "Theta (4-8 Hz - Memory/Intuition)",
 color: "#eab308",
 repel: 280,
 link: 0.035,
 gravity: 0.015,
 speed: 0.4,
 particleSize: 1.5,
 particleCount: 1,
 };
 case "delta":
 return {
 label: "Delta (0.5-4 Hz - Deep Consolidation)",
 color: "#FF5B5B",
 repel: 200,
 link: 0.02,
 gravity: 0.005,
 speed: 0.15,
 particleSize: 1.0,
 particleCount: 0,
 };
 }
 }, [activeBrainWave]);

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
 const nodesMap = new Map<string, Omit<GraphNode, "x" | "y" | "z" | "vx" | "vy" | "vz">>();
 const links: GraphLink[] = [];

 // 1. Add Sources
 sources.forEach((s) => {
 nodesMap.set(`src-${s.id}`, {
 id: `src-${s.id}`,
 label: s.title || s.label || `Journal Note`,
 type: "source",
 details: s.content || s.description || "",
 radius: 14,
 color: "#10b981", // Primary Emerald Green
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
 color: "#f97316", // Warm Orange
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
 color: "#eab308", // Yellow Accent
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
 color: "#0ea5e9", // Macaw Blue
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
 color: "#a855f7", // Purple Accent
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

 // Initialize random positions in 3D space for force simulation
 const nodes: GraphNode[] = Array.from(nodesMap.values()).map((n, i) => {
 const phi = Math.acos(-1 + (2 * i) / (nodesMap.size || 1)); // spherical distribution
 const theta = Math.sqrt(nodesMap.size * Math.PI) * phi;
 const dist = 70 + Math.random() * 50;
 return {
 ...n,
 x: dist * Math.sin(phi) * Math.cos(theta),
 y: dist * Math.sin(phi) * Math.sin(theta),
 z: dist * Math.cos(phi),
 vx: 0,
 vy: 0,
 vz: 0,
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

 const tick = () => {
 // 1. Force towards center + Lobe positioning force
 nodes.forEach((n) => {
 if (n === draggedNode) return;
 
 // Base center gravity
 n.vx -= n.x * waveParams.gravity;
 n.vy -= n.y * waveParams.gravity;
 n.vz -= n.z * waveParams.gravity;

 // Lobe positioning force
 let targetLobe = { x: 0, y: 0, z: 0 };
 switch (n.type) {
 case "project":
 targetLobe = { x: 0, y: -70, z: 90 }; // frontal
 break;
 case "task":
 targetLobe = { x: 0, y: -90, z: -15 }; // parietal
 break;
 case "decision":
 // Split temporal left/right based on character code
 const isLeft = n.id.charCodeAt(n.id.length - 1) % 2 === 0;
 targetLobe = { x: isLeft ? -90 : 90, y: -20, z: 20 }; // temporal
 break;
 case "source":
 targetLobe = { x: 0, y: -30, z: -90 }; // occipital
 break;
 case "person":
 targetLobe = { x: 0, y: 60, z: 0 }; // subcortical / brainstem
 break;
 }

 const lobeForceStrength = 0.025;
 n.vx += (targetLobe.x - n.x) * lobeForceStrength;
 n.vy += (targetLobe.y - n.y) * lobeForceStrength;
 n.vz += (targetLobe.z - n.z) * lobeForceStrength;
 });

 // 2. Electrostatic repulsion in 3D (all pairs)
 for (let i = 0; i < nodes.length; i++) {
 const n1 = nodes[i];
 for (let j = i + 1; j < nodes.length; j++) {
 const n2 = nodes[j];
 const dx = n2.x - n1.x;
 const dy = n2.y - n1.y;
 const dz = n2.z - n1.z;
 const distSq = dx * dx + dy * dy + dz * dz || 1;
 const dist = Math.sqrt(distSq);

 const minDistance = 70;
 if (dist < minDistance * 2.5) {
 const force = waveParams.repel / distSq;
 const fx = (dx / dist) * force;
 const fy = (dy / dist) * force;
 const fz = (dz / dist) * force;

 if (n1 !== draggedNode) {
 n1.vx -= fx;
 n1.vy -= fy;
 n1.vz -= fz;
 }
 if (n2 !== draggedNode) {
 n2.vx += fx;
 n2.vy += fy;
 n2.vz += fz;
 }
 }
 }
 }

 // 3. Link spring tension in 3D
 links.forEach((l) => {
 if (!l.sourceNode || !l.targetNode) return;
 const s = l.sourceNode;
 const t = l.targetNode;
 const dx = t.x - s.x;
 const dy = t.y - s.y;
 const dz = t.z - s.z;
 const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
 const minDistance = 70;
 const force = (dist - minDistance) * waveParams.link;

 const fx = (dx / dist) * force;
 const fy = (dy / dist) * force;
 const fz = (dz / dist) * force;

 if (s !== draggedNode) {
 s.vx += fx;
 s.vy += fy;
 s.vz += fz;
 }
 if (t !== draggedNode) {
 t.vx -= fx;
 t.vy -= fy;
 t.vz -= fz;
 }
 });

 // 4. Apply velocity + friction
 const friction = 0.88;
 nodes.forEach((n) => {
 if (n === draggedNode) return;
 n.x += n.vx;
 n.y += n.vy;
 n.z += n.vz;
 n.vx *= friction;
 n.vy *= friction;
 n.vz *= friction;
 });

 // Increment wave particle time offset
 timeRef.current += waveParams.speed;

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
 // Translate to center + apply zoom panning
 ctx.translate(width / 2 + transform.x, height / 2 + transform.y);

 // Precompute 3D rotations for all active nodes
 const cosY = Math.cos(rotation.yaw);
 const sinY = Math.sin(rotation.yaw);
 const cosP = Math.cos(rotation.pitch);
 const sinP = Math.sin(rotation.pitch);
 const fov = 450;
 const cameraDist = 380;

 const projectedNodes = nodes.map((n) => {
 // Rotate horizontal (yaw)
 const x1 = n.x * cosY - n.z * sinY;
 const z1 = n.x * sinY + n.z * cosY;
 // Rotate vertical (pitch)
 const y2 = n.y * cosP - z1 * sinP;
 const z2 = n.y * sinP + z1 * cosP;

 const scaleFactor = fov / Math.max(50, cameraDist + z2);
 const screenX = x1 * scaleFactor * transform.scale;
 const screenY = y2 * scaleFactor * transform.scale;

 return {
 node: n,
 sx: screenX,
 sy: screenY,
 sz: z2,
 scale: scaleFactor * transform.scale,
 };
 });

 // Painter's algorithm: sort back-to-front (sz descending)
 projectedNodes.sort((a, b) => b.sz - a.sz);

 // 1. Draw connection links with depth fading
 links.forEach((l) => {
 const sProj = projectedNodes.find((p) => p.node.id === l.source);
 const tProj = projectedNodes.find((p) => p.node.id === l.target);
 if (!sProj || !tProj) return;

 // Check connection highlight
 const isRelatedToSelection = selectedNode
 ? l.source === selectedNode.id || l.target === selectedNode.id
 : false;

 // Base opacity on average depth
 const avgDepth = (sProj.sz + tProj.sz) / 2;
 let depthAlpha = Math.max(0.02, Math.min(0.28, 0.16 - avgDepth / 400));

 // If a node is selected, dim non-selected links
 if (selectedNode && !isRelatedToSelection) {
 depthAlpha *= 0.12; // dim non-connected lines significantly
 } else if (selectedNode && isRelatedToSelection) {
 depthAlpha *= 2.5; // highlight active connections
 }

 ctx.beginPath();
 ctx.moveTo(sProj.sx, sProj.sy);
 ctx.lineTo(tProj.sx, tProj.sy);

 if (selectedNode && isRelatedToSelection) {
 // Glow style for active link
 ctx.strokeStyle = waveParams.color;
 ctx.lineWidth = Math.max(1.2, 2.5 * ((sProj.scale + tProj.scale) / 2));
 } else {
 ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha})`;
 ctx.lineWidth = Math.max(0.4, 1.2 * ((sProj.scale + tProj.scale) / 2));
 }
 ctx.stroke();

 // 2. Draw animated wave signal flow particles along links
 if (waveParams.particleCount > 0) {
 if (selectedNode && !isRelatedToSelection) {
 return; // skip/dim particles on non-connected links
 }

 const numParticles = waveParams.particleCount;
 for (let pIdx = 0; pIdx < numParticles; pIdx++) {
 // Stagger position + time propagation
 const stagger = (pIdx / numParticles + timeRef.current * 0.006) % 1.0;
 const px = sProj.sx + (tProj.sx - sProj.sx) * stagger;
 const py = sProj.sy + (tProj.sy - sProj.sy) * stagger;
 const pz = sProj.sz + (tProj.sz - sProj.sz) * stagger;

 const pScale = fov / Math.max(50, cameraDist + pz) * transform.scale;
 const pRadius = waveParams.particleSize * pScale * (selectedNode ? 1.4 : 1.0);
 const pAlpha = Math.max(0.1, Math.min(0.9, 0.7 - pz / 300)) * (selectedNode ? 1.2 : 1.0);

 ctx.beginPath();
 ctx.arc(px, py, pRadius, 0, Math.PI * 2);
 ctx.fillStyle = waveParams.color;
 ctx.shadowColor = waveParams.color;
 ctx.shadowBlur = pRadius * 3;
 ctx.save();
 ctx.globalAlpha = pAlpha;
 ctx.fill();
 ctx.restore();
 ctx.shadowBlur = 0;
 }
 }
 });

 // 3. Draw nodes sorted by depth
 projectedNodes.forEach(({ node: n, sx, sy, sz, scale }) => {
 const isSelected = selectedNode?.id === n.id;
 const isConnectedToSelected = selectedNode
 ? links.some((l) => (l.source === selectedNode.id && l.target === n.id) || (l.target === selectedNode.id && l.source === n.id))
 : false;

 const nodeRad = n.radius * scale * 0.7;
 let opacity = Math.max(0.12, Math.min(1.0, 0.85 - sz / 350));

 // Dim if a node is selected and this node is neither selected nor connected
 if (selectedNode && !isSelected && !isConnectedToSelected) {
 opacity *= 0.12; // dim down to a faint outline
 }

 ctx.beginPath();
 ctx.arc(sx, sy, nodeRad, 0, Math.PI * 2);

 // Ambient pulse for Delta wave mode
 const pulse = activeBrainWave === "delta" ? (1.0 + 0.15 * Math.sin(timeRef.current * 0.04)) : 1.0;

 ctx.fillStyle = n.color;
 ctx.shadowColor = n.color;
 ctx.shadowBlur = (isSelected ? 24 : isConnectedToSelected ? 12 : 6) * scale * pulse;

 ctx.save();
 ctx.globalAlpha = opacity;
 ctx.fill();
 ctx.shadowBlur = 0;

 // selection border
 ctx.strokeStyle = isSelected ? "#ffffff" : isConnectedToSelected ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.14)";
 ctx.lineWidth = isSelected ? 2.5 * scale : isConnectedToSelected ? 1.5 * scale : 1.0 * scale;
 ctx.stroke();

 // text label
 const shouldShowLabel = !selectedNode || isSelected || isConnectedToSelected || scale > 1.1;
 if (shouldShowLabel) {
 ctx.fillStyle = isSelected ? "#ffffff" : isConnectedToSelected ? "#e4e4e7" : `rgba(255, 255, 255, ${opacity * 0.95})`;
 ctx.font = `${isSelected ? "bold" : "normal"} ${Math.max(7.5, Math.min(13.5, 9.5 * scale))}px system-ui`;
 ctx.textAlign = "center";
 ctx.textBaseline = "top";
 ctx.fillText(
 n.label.length > 18 ? n.label.slice(0, 16) + "..." : n.label,
 sx,
 sy + nodeRad + 5
 );
 }
 ctx.restore();
 });

 ctx.restore();
 };

 animId = requestAnimationFrame(tick);
 return () => cancelAnimationFrame(animId);
 }, [nodes, links, transform, rotation, selectedNode, draggedNode, activeBrainWave, waveParams]);

 // Click & Drag handlers
 const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const rect = canvas.getBoundingClientRect();
 const clientX = e.clientX - rect.left;
 const clientY = e.clientY - rect.top;

 const screenX = clientX - canvas.width / 2 - transform.x;
 const screenY = clientY - canvas.height / 2 - transform.y;

 // Precompute 3D coordinates to find clicked node front-to-back
 const cosY = Math.cos(rotation.yaw);
 const sinY = Math.sin(rotation.yaw);
 const cosP = Math.cos(rotation.pitch);
 const sinP = Math.sin(rotation.pitch);
 const fov = 450;
 const cameraDist = 380;

 const projectedNodes = nodes.map((n) => {
 const x1 = n.x * cosY - n.z * sinY;
 const z1 = n.x * sinY + n.z * cosY;
 const y2 = n.y * cosP - z1 * sinP;
 const z2 = n.y * sinP + z1 * cosP;

 const scaleFactor = fov / Math.max(50, cameraDist + z2);
 const screenNodeX = x1 * scaleFactor * transform.scale;
 const screenNodeY = y2 * scaleFactor * transform.scale;

 return {
 node: n,
 sx: screenNodeX,
 sy: screenNodeY,
 sz: z2,
 scale: scaleFactor,
 };
 });

 // Traverse closest nodes first (sz ascending)
 let clickedNode: GraphNode | null = null;
 let clickedNodeZ = 0;
 const sortedFrontToBack = [...projectedNodes].sort((a, b) => a.sz - b.sz);

 for (let p of sortedFrontToBack) {
 const dx = screenX - p.sx;
 const dy = screenY - p.sy;
 const nodeRad = p.node.radius * p.scale * transform.scale * 0.7;
 if (dx * dx + dy * dy < nodeRad * nodeRad * 3.5) { // generous hitbox
 clickedNode = p.node;
 clickedNodeZ = p.sz;
 break;
 }
 }

 if (clickedNode) {
 setDraggedNode(clickedNode);
 setSelectedNode(clickedNode);
 draggedNodeZRef.current = clickedNodeZ;
 } else {
 // Start drag panning or rotating
 const startX = e.clientX;
 const startY = e.clientY;
 const startTrans = { ...transform };
 const startRot = { ...rotation };
 const isPanning = e.button === 2 || e.shiftKey; // right click or shift key for panning

 const handleMouseMove = (moveEvent: MouseEvent) => {
 const dx = moveEvent.clientX - startX;
 const dy = moveEvent.clientY - startY;

 if (isPanning) {
 setTransform({
 ...startTrans,
 x: startTrans.x + dx,
 y: startTrans.y + dy,
 });
 } else {
 // Adjust pitch & yaw based on drag delta
 setRotation({
 pitch: Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, startRot.pitch + dy * 0.007)),
 yaw: startRot.yaw + dx * 0.007,
 });
 }
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

 const screenX = clientX - canvas.width / 2 - transform.x;
 const screenY = clientY - canvas.height / 2 - transform.y;

 // Math projection parameters
 const fov = 450;
 const cameraDist = 380;
 const rz = draggedNodeZRef.current;
 const scaleFactor = fov / Math.max(50, cameraDist + rz);

 const rx = screenX / (transform.scale * scaleFactor);
 const ry = screenY / (transform.scale * scaleFactor);

 // Inverse of pitch and yaw rotation to get node back in 3D space
 const cp = Math.cos(-rotation.pitch);
 const sp = Math.sin(-rotation.pitch);
 const cy = Math.cos(-rotation.yaw);
 const sy = Math.sin(-rotation.yaw);

 const z1_inv = rz * cp - ry * sp;
 const y_inv = rz * sp + ry * cp;
 const x_inv = rx * cy - z1_inv * sy;
 const z_inv = rx * sy + z1_inv * cy;

 draggedNode.x = x_inv;
 draggedNode.y = y_inv;
 draggedNode.z = z_inv;
 // reset velocity to prevent flying away on release
 draggedNode.vx = 0;
 draggedNode.vy = 0;
 draggedNode.vz = 0;
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
 scale: Math.max(0.25, Math.min(4.0, prev.scale * zoomFactor)),
 }));
 };

 const getResourceUrl = (node: GraphNode) => {
 if (!node.originalData) return null;
 switch (node.type) {
 case "source":
 return `/dashboard/library/${node.originalData.id}`;
 case "person":
 return `/dashboard/people/${node.originalData.id}`;
 case "task":
 return `/dashboard/tasks`;
 case "project":
 return `/dashboard/projects`;
 case "decision":
 return `/dashboard/decisions`;
 default:
 return null;
 }
 };

 const focusOnNode = (node: GraphNode) => {
 setSelectedNode(node);

 const cosY = Math.cos(rotation.yaw);
 const sinY = Math.sin(rotation.yaw);
 const cosP = Math.cos(rotation.pitch);
 const sinP = Math.sin(rotation.pitch);
 const fov = 450;
 const cameraDist = 380;

 const x1 = node.x * cosY - node.z * sinY;
 const z1 = node.x * sinY + node.z * cosY;
 const y2 = node.y * cosP - z1 * sinP;
 const z2 = node.y * sinP + z1 * cosP;

 const scaleFactor = fov / Math.max(50, cameraDist + z2);
 const targetScale = 1.35;
 const targetX = -x1 * scaleFactor * targetScale;
 const targetY = -y2 * scaleFactor * targetScale;

 // Smoothly animate
 let startTime: number | null = null;
 const duration = 450; // ms
 const startX = transform.x;
 const startY = transform.y;
 const startScale = transform.scale;

 const step = (timestamp: number) => {
 if (!startTime) startTime = timestamp;
 const progress = Math.min((timestamp - startTime) / duration, 1);
 const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out

 setTransform({
 x: startX + (targetX - startX) * ease,
 y: startY + (targetY - startY) * ease,
 scale: startScale + (targetScale - startScale) * ease,
 });

 if (progress < 1) {
 requestAnimationFrame(step);
 }
 };
 requestAnimationFrame(step);
 };

 const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const rect = canvas.getBoundingClientRect();
 const clientX = e.clientX - rect.left;
 const clientY = e.clientY - rect.top;

 const screenX = clientX - canvas.width / 2 - transform.x;
 const screenY = clientY - canvas.height / 2 - transform.y;

 const cosY = Math.cos(rotation.yaw);
 const sinY = Math.sin(rotation.yaw);
 const cosP = Math.cos(rotation.pitch);
 const sinP = Math.sin(rotation.pitch);
 const fov = 450;
 const cameraDist = 380;

 const projectedNodes = nodes.map((n) => {
 const x1 = n.x * cosY - n.z * sinY;
 const z1 = n.x * sinY + n.z * cosY;
 const y2 = n.y * cosP - z1 * sinP;
 const z2 = n.y * sinP + z1 * cosP;

 const scaleFactor = fov / Math.max(50, cameraDist + z2);
 const screenNodeX = x1 * scaleFactor * transform.scale;
 const screenNodeY = y2 * scaleFactor * transform.scale;

 return {
 node: n,
 sx: screenNodeX,
 sy: screenNodeY,
 sz: z2,
 scale: scaleFactor,
 };
 });

 let clickedNode: GraphNode | null = null;
 const sortedFrontToBack = [...projectedNodes].sort((a, b) => a.sz - b.sz);

 for (let p of sortedFrontToBack) {
 const dx = screenX - p.sx;
 const dy = screenY - p.sy;
 const nodeRad = p.node.radius * p.scale * transform.scale * 0.7;
 if (dx * dx + dy * dy < nodeRad * nodeRad * 3.5) {
 clickedNode = p.node;
 break;
 }
 }

 if (clickedNode) {
 focusOnNode(clickedNode);
 }
 };

 const toggleTypeFilter = (type: string) => {
 setSelectedTypes((prev) =>
 prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
 );
 };

 const referencingJournals = useMemo(() => {
 if (!selectedNode || selectedNode.type !== "person") return [];
 const personName = selectedNode.label.trim().toLowerCase();
 if (!personName) return [];
 
 return sources.filter((s) => {
 const isJournal = s.type === "journal";
 if (!isJournal) return false;

 const titleMatch = (s.title || "").toLowerCase().includes(personName);
 const contentMatch = (s.content || s.description || s.plainText || "").toLowerCase().includes(personName);
 
 return titleMatch || contentMatch;
 });
 }, [selectedNode, sources]);

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
 <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
 <Brain className="w-5 h-5 text-primary" />
 Second Brain
 </h1>
 <p className="text-xs text-muted-foreground mt-0.5">
 Visualize connection paths, core memories, and relationships in your cognitive database.
 </p>
 </div>

 {/* Global stats bar */}
 <div className="flex flex-wrap items-center gap-2.5 mt-3 md:mt-0 text-[10px] font-semibold tracking-wide uppercase">
 <button
 onClick={() => {
 setSelectedNode(null);
 setSidebarListType(sidebarListType === "source" ? null : "source");
 }}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-semibold uppercase tracking-wider text-[10px]",
 sidebarListType === "source"
 ? "bg-[#10b981]/20 border-[#10b981] text-[#10b981] shadow-sm"
 : "border-border/30 bg-card/25 text-[#10b981] hover:bg-[#10b981]/10"
 )}
 >
 {nodeStats.sources} Notes
 </button>
 <button
 onClick={() => {
 setSelectedNode(null);
 setSidebarListType(sidebarListType === "task" ? null : "task");
 }}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-semibold uppercase tracking-wider text-[10px]",
 sidebarListType === "task"
 ? "bg-[#f97316]/20 border-[#f97316] text-[#f97316] shadow-sm"
 : "border-border/30 bg-card/25 text-[#f97316] hover:bg-[#f97316]/10"
 )}
 >
 {nodeStats.tasks} Tasks
 </button>
 <button
 onClick={() => {
 setSelectedNode(null);
 setSidebarListType(sidebarListType === "decision" ? null : "decision");
 }}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-semibold uppercase tracking-wider text-[10px]",
 sidebarListType === "decision"
 ? "bg-[#eab308]/20 border-[#eab308] text-[#eab308] shadow-sm"
 : "border-border/30 bg-card/25 text-[#eab308] hover:bg-[#eab308]/10"
 )}
 >
 {nodeStats.decisions} Decisions
 </button>
 <button
 onClick={() => {
 setSelectedNode(null);
 setSidebarListType(sidebarListType === "person" ? null : "person");
 }}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-semibold uppercase tracking-wider text-[10px]",
 sidebarListType === "person"
 ? "bg-[#0ea5e9]/20 border-[#0ea5e9] text-[#0ea5e9] shadow-sm"
 : "border-border/30 bg-card/25 text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
 )}
 >
 {nodeStats.people} People
 </button>
 <button
 onClick={() => {
 setSelectedNode(null);
 setSidebarListType(sidebarListType === "project" ? null : "project");
 }}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-semibold uppercase tracking-wider text-[10px]",
 sidebarListType === "project"
 ? "bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7] shadow-sm"
 : "border-border/30 bg-card/25 text-[#a855f7] hover:bg-[#a855f7]/10"
 )}
 >
 {nodeStats.projects} Projects
 </button>
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
 { type: "source", color: "bg-[#10b981]", label: "Notes" },
 { type: "task", color: "bg-[#f97316]", label: "Tasks" },
 { type: "decision", color: "bg-[#eab308]", label: "Decisions" },
 { type: "person", color: "bg-[#0ea5e9]", label: "People" },
 { type: "project", color: "bg-[#a855f7]", label: "Projects" },
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

 {/* Brain Wave Controller Panel */}
 <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 max-w-sm items-end">
 <div className="flex flex-col bg-zinc-950/70 backdrop-blur-md p-2 border border-border/20 rounded-2xl gap-2 min-w-56 shadow-xl">
 <div className="flex items-center justify-between px-1">
 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-primary" />
 Brain Wave State
 </span>
 <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-foreground" style={{ color: waveParams.color }}>
 {activeBrainWave.toUpperCase()}
 </span>
 </div>
 
 <div className="flex flex-col gap-1">
 {[
 { id: "gamma", wave: "Gamma", hz: "30-100 Hz", desc: "Insight / Focus", color: "text-[#a855f7]", border: "hover:border-[#a855f7]/30" },
 { id: "beta", wave: "Beta", hz: "12-30 Hz", desc: "Thinking / Logic", color: "text-[#0ea5e9]", border: "hover:border-[#0ea5e9]/30" },
 { id: "alpha", wave: "Alpha", hz: "8-12 Hz", desc: "Relaxed Focus", color: "text-[#10b981]", border: "hover:border-[#10b981]/30" },
 { id: "theta", wave: "Theta", hz: "4-8 Hz", desc: "Intuition / Dream", color: "text-[#eab308]", border: "hover:border-[#eab308]/30" },
 { id: "delta", wave: "Delta", hz: "0.5-4 Hz", desc: "Rest / Healing", color: "text-[#FF5B5B]", border: "hover:border-[#FF5B5B]/30" },
 ].map((w) => {
 const isActive = activeBrainWave === w.id;
 return (
 <button
 key={w.id}
 onClick={() => setActiveBrainWave(w.id as any)}
 className={cn(
 "flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[10px] font-medium transition-all text-left",
 isActive
 ? "bg-zinc-800/80 border-zinc-700/80 text-foreground shadow-inner"
 : `bg-transparent border-transparent text-muted-foreground/80 hover:bg-zinc-900/40 hover:text-foreground ${w.border}`
 )}
 >
 <div className="flex flex-col">
 <span className={cn("font-bold", isActive && w.color)}>{w.wave}</span>
 <span className="text-[8px] text-muted-foreground/60">{w.desc}</span>
 </div>
 <span className="text-[8px] font-semibold text-muted-foreground/40">{w.hz}</span>
 </button>
 );
 })}
 </div>
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
 onDoubleClick={handleDoubleClick}
 onMouseMove={handleMouseMove}
 onMouseUp={handleMouseUpOrLeave}
 onMouseLeave={handleMouseUpOrLeave}
 onWheel={handleWheel}
 onContextMenu={(e) => e.preventDefault()}
 className="flex-1 cursor-grab active:cursor-grabbing"
 />
 )}

 {/* Interactive Help Hint */}
 <div className="absolute bottom-4 left-4 z-10 bg-zinc-950/40 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-border/10 text-[9px] text-muted-foreground/80 flex items-center gap-1.5">
 <Info className="w-3 h-3 text-primary" />
 Drag empty space to rotate. Shift/Right-click + drag to pan. Drag nodes to reposition. Scroll to zoom.
 </div>

 {/* Canvas Zoom & View controls */}
 <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-zinc-950/65 backdrop-blur-md p-1 border border-border/20 rounded-xl shadow-lg">
 <Button
 size="icon"
 variant="ghost"
 className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-zinc-800/60"
 onClick={() => {
 setTransform((prev) => ({ ...prev, scale: Math.min(4.0, prev.scale * 1.15) }));
 }}
 title="Zoom In"
 >
 <Plus className="w-3.5 h-3.5" />
 </Button>
 <Button
 size="icon"
 variant="ghost"
 className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-zinc-800/60"
 onClick={() => {
 setTransform((prev) => ({ ...prev, scale: Math.max(0.25, prev.scale / 1.15) }));
 }}
 title="Zoom Out"
 >
 <Minus className="w-3.5 h-3.5" />
 </Button>
 <div className="w-5 h-[1px] bg-border/20 mx-auto" />
 <Button
 size="icon"
 variant="ghost"
 className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-zinc-800/60"
 onClick={() => {
 setTransform({ x: 0, y: 0, scale: 1 });
 setRotation({ pitch: -0.25, yaw: 0.6 });
 }}
 title="Reset View"
 >
 <Compass className="w-3.5 h-3.5" />
 </Button>
 </div>
 </div>

 {/* Sidebar Inspector Panel */}
 <div
 className={cn(
 "w-80 border-l border-border/20 bg-zinc-950/20 backdrop-blur-md flex flex-col z-20 shrink-0 transition-transform duration-300",
 selectedNode || sidebarListType ? "translate-x-0" : "translate-x-full absolute right-0 top-0 bottom-0 md:relative md:translate-x-0 md:opacity-0 md:pointer-events-none"
 )}
 >
 {selectedNode ? (
 <div className="flex-1 flex flex-col min-h-0 divide-y divide-border/20">
 {/* Back to List option */}
 {sidebarListType && (
 <button
 onClick={() => setSelectedNode(null)}
 className="flex items-center gap-1.5 px-4 py-2 text-[10px] text-primary hover:text-primary/80 border-b border-border/10 bg-zinc-950/30 transition-colors text-left font-semibold cursor-pointer"
 >
 <ArrowRight className="w-3.5 h-3.5 rotate-180" />
 Back to {sidebarListType === "person" ? "People" : sidebarListType === "project" ? "Projects" : sidebarListType === "source" ? "Notes" : sidebarListType === "task" ? "Tasks" : "Decisions"} List
 </button>
 )}

 {/* Node Header */}
 <div className="p-4 flex items-start justify-between gap-3 bg-zinc-950/40">
 <div className="flex-1 min-w-0">
 <span
 className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md text-foreground"
 style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
 >
 {selectedNode.type}
 </span>
 <h3 className="text-sm font-bold mt-2 truncate text-foreground">
 {selectedNode.label}
 </h3>
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 {getResourceUrl(selectedNode) && (
 <a
 href={getResourceUrl(selectedNode)!}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[9px] font-bold text-primary hover:underline px-2 py-1 bg-primary/10 rounded-lg flex items-center gap-1 border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
 >
 Open
 </a>
 )}
 <Button
 size="icon"
 variant="ghost"
 className="h-6 w-6 rounded-md hover:bg-zinc-800 text-muted-foreground hover:text-foreground cursor-pointer"
 onClick={() => {
 setSelectedNode(null);
 setSidebarListType(null);
 }}
 >
 <ArrowRight className="w-3.5 h-3.5" />
 </Button>
 </div>
 </div>

 {/* Node Details */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-none">
 {/* Primary Open CTA */}
 {getResourceUrl(selectedNode) && (
 <div className="pb-1.5">
 <a
 href={getResourceUrl(selectedNode)!}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/25 cursor-pointer text-center"
 >
 <Sparkles className="w-3.5 h-3.5" />
 Open Full Resource Page
 </a>
 </div>
 )}

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

 {/* List journals referencing the selected person node */}
 {selectedNode.type === "person" && referencingJournals.length > 0 && (
 <div className="space-y-2">
 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mentioned in Journals</p>
 <div className="space-y-1.5">
 {referencingJournals.map((journal) => (
 <div
 key={journal.id}
 className="flex items-center justify-between p-2 rounded-xl border border-border/10 bg-[#10b981]/5 hover:bg-[#10b981]/10 transition text-left gap-2 animate-in fade-in slide-in-from-right-3 duration-250"
 >
 <span className="font-medium text-[11px] truncate flex-1 text-muted-foreground">
 {journal.title || "Journal Note"}
 </span>
 <div className="flex items-center gap-1 shrink-0">
 <button
 type="button"
 onClick={() => setPeekJournal(journal)}
 className="text-[9px] font-bold text-[#10b981] hover:underline px-1.5 py-0.5 rounded bg-[#10b981]/10 cursor-pointer"
 >
 Peek
 </button>
 <a
 href={`/dashboard/library/${journal.id}`}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[9px] font-bold text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded border border-border/20 bg-zinc-900/60 transition-colors"
 >
 Open
 </a>
 </div>
 </div>
 ))}
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
 onClick={() => focusOnNode(targetNode)}
 className="w-full flex items-center justify-between p-2 rounded-xl border border-border/10 bg-zinc-900/10 hover:bg-zinc-800/30 transition text-left cursor-pointer"
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
 ) : sidebarListType ? (
 <div className="flex-1 flex flex-col min-h-0 divide-y divide-border/20 bg-zinc-950/40">
 {/* List Header */}
 <div className="p-4 flex items-center justify-between bg-zinc-950/60">
 <div>
 <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
 All {sidebarListType === "person" ? "People" : sidebarListType === "project" ? "Projects" : sidebarListType === "source" ? "Notes" : sidebarListType === "task" ? "Tasks" : "Decisions"}
 </h3>
 <span className="text-[10px] text-primary font-bold">
 {rawNodes.filter((n) => n.type === sidebarListType).length} entries found
 </span>
 </div>
 <Button
 size="icon"
 variant="ghost"
 className="h-6 w-6 rounded-md hover:bg-zinc-800 text-muted-foreground hover:text-foreground cursor-pointer"
 onClick={() => setSidebarListType(null)}
 >
 <X className="w-3.5 h-3.5" />
 </Button>
 </div>

 {/* List Content */}
 <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs scrollbar-none">
 {rawNodes.filter((n) => n.type === sidebarListType).length === 0 ? (
 <div className="text-center py-6 text-muted-foreground/60 text-[10px]">
 No entries in this category.
 </div>
 ) : (
 rawNodes
 .filter((n) => n.type === sidebarListType)
 .map((el) => (
 <div
 key={el.id}
 className="p-3 bg-zinc-900/30 border border-border/10 rounded-xl hover:bg-zinc-800/40 transition-all flex flex-col gap-2 relative group"
 >
 <div className="flex items-start justify-between gap-2">
 <button
 onClick={() => focusOnNode(el)}
 className="font-bold text-foreground text-left hover:text-primary transition-colors truncate max-w-[170px] cursor-pointer"
 >
 {el.label}
 </button>
 <div className="flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
 {getResourceUrl(el) && (
 <a
 href={getResourceUrl(el)!}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[9px] font-bold text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-0.5 cursor-pointer"
 >
 Open
 </a>
 )}
 </div>
 </div>
 {el.details && (
 <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
 {el.details}
 </p>
 )}
 </div>
 ))
 )}
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

 {/* Peek Modal Overlay for Journal details */}
 {peekJournal && (
 <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-all duration-300 animate-in fade-in zoom-in-95">
 <div className="bg-zinc-900/90 border border-border/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80%]">
 {/* Modal Header */}
 <div className="p-4.5 border-b border-border/20 flex items-center justify-between bg-zinc-950/40">
 <div className="min-w-0">
 <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#10b981]/25 text-[#10b981]">
 Journal Note
 </span>
 <h3 className="text-sm font-bold mt-1.5 truncate text-foreground">
 {peekJournal.title || "Untitled Journal"}
 </h3>
 </div>
 <div className="flex items-center gap-2">
 <a
 href={`/dashboard/library/${peekJournal.id}`}
 target="_blank"
 rel="noopener noreferrer"
 className="h-8 px-3 rounded-lg border border-border/20 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
 >
 Open in New Page
 </a>
 <Button
 size="icon"
 variant="ghost"
 className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-800"
 onClick={() => setPeekJournal(null)}
 >
 <X className="w-4 h-4" />
 </Button>
 </div>
 </div>
 {/* Modal Content */}
 <div className="flex-1 overflow-y-auto p-6 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap select-text scrollbar-none">
 {peekJournal.content || peekJournal.description || peekJournal.plainText || "This journal entry has no written content details."}
 </div>
 {/* Modal Footer */}
 <div className="p-3 bg-zinc-950/20 border-t border-border/10 flex justify-end">
 <Button
 variant="outline"
 size="sm"
 className="rounded-xl border-border/20 hover:bg-zinc-800 text-[10px]"
 onClick={() => setPeekJournal(null)}
 >
 Close Preview
 </Button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
