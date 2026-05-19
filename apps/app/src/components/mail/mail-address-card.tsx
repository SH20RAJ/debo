"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MailAddressCardProps {
  address: { username: string; address: string };
}

export function MailAddressCard({ address }: MailAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-3 mb-2 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
        Your Debo address
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground truncate flex-1">
          {address.address}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5">
        Internal mail for your trusted memory network
      </p>
    </div>
  );
}
