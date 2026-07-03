"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
 isOpen: boolean;
 onClose: () => void;
 title?: string;
 description?: string;
 children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, description, children }: DrawerProps) {
 // Close on Escape key press
 React.useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === "Escape") onClose();
 };
 if (isOpen) {
 window.addEventListener("keydown", handleKeyDown);
 document.body.style.overflow = "hidden";
 }
 return () => {
 window.removeEventListener("keydown", handleKeyDown);
 document.body.style.overflow = "unset";
 };
 }, [isOpen, onClose]);

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop overlay */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
 />

 {/* Drawer panel */}
 <motion.div
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 220 }}
 className={cn(
 "fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md md:max-w-lg h-full",
 "border-l border-border bg-card/95 backdrop-blur-2xl p-6 shadow-2xl flex flex-col"
 )}
 >
 {/* Header */}
 <div className="flex items-start justify-between pb-4 border-b border-border/40 mb-5">
 <div>
 {title && (
 <h2 className="text-base font-bold text-foreground tracking-tight">
 {title}
 </h2>
 )}
 {description && (
 <p className="text-[11px] text-muted-foreground mt-0.5">
 {description}
 </p>
 )}
 </div>
 <button
 onClick={onClose}
 className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Content body */}
 <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none pr-1">
 {children}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
