"use client";
import { useState, useCallback } from "react";
import { MemoryReceipt } from "./memory-receipt";

interface ReceiptData {
  title: string;
  detected: { type: string; value: string }[];
  sourceType: string;
}

export function useMemoryReceipt() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const showReceipt = useCallback((data: ReceiptData) => {
    setReceipt(data);
    setTimeout(() => setReceipt(null), 5000);
  }, []);

  const ReceiptToast = receipt ? (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
      <MemoryReceipt
        title={receipt.title}
        detected={receipt.detected}
        sourceType={receipt.sourceType}
        onClose={() => setReceipt(null)}
      />
    </div>
  ) : null;

  return { showReceipt, ReceiptToast };
}
