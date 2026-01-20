"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useUniverseStore } from "@/store/useUniverseStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AgentLogEntry {
  id: string;
  timestamp: string;
  ticker: string;
  agentId: string;
  badge: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  magnitude: number;
  rationale: string;
}

const AGENTS = {
  Buffett: { badge: "ALPHA | VALUE" },
  Wood: { badge: "ALPHA | GROWTH" },
  Munger: { badge: "ALPHA | QUALITY" },
  Fisher: { badge: "ALPHA | GROWTH" },
  Ackman: { badge: "ALPHA | ACTIVIST" },
  Burry: { badge: "ALPHA | CONTRARIAN" },
  Graham: { badge: "ALPHA | VALUE" },
  Lynch: { badge: "ALPHA | GARP" },
  Druckenmiller: { badge: "ALPHA | MACRO" },
  Damodaran: { badge: "ALPHA | VALUATION" },
  Pabrai: { badge: "ALPHA | CLONER" },
  Jhunjhunwala: { badge: "ALPHA | MOMENTUM" },
  PortfolioManager: { badge: "PCM | MVO" },
  RiskManager: { badge: "RMM | GATE" },
  TechnicalAnalyst: { badge: "INDICATOR | SWEEP" },
  FundamentalAnalyst: { badge: "DATA | AUDIT" },
  SentimentAnalyst: { badge: "SOCIAL | AGG" },
};

import { SSEEventSchema } from "@/types/lean";

export function LiveDebateFloor() {
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const updateTicker = useUniverseStore((state) => state.updateTicker);

  useEffect(() => {
    const eventSource = api.streamAnalysis("GLOBAL"); 

    eventSource.onopen = () => {
      setIsConnected(true);
      setSchemaError(null);
    };

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setIsConnected(false);
        return;
      }

      try {
        const rawData = JSON.parse(event.data);
        const result = SSEEventSchema.safeParse(rawData);
        
        if (!result.success) {
          console.error("Schema Validation Mismatch:", result.error);
          setSchemaError("Protocol Version Mismatch Detected");
          return;
        }

        const data = result.data;
        const ticker = data.ticker || "SYSTEM";
        const agentName = data.agent || "UNKNOWN";
        
        const confidence = data.confidence || 0;
        const magnitude = data.magnitude || 0;

        if (data.score || data.signal) {
          updateTicker(ticker, {
            signal: (data.signal || "NEUTRAL").toUpperCase() as "BULLISH" | "BEARISH" | "NEUTRAL",
            score: data.score || 50,
          });
        }

        const newLog: AgentLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          ticker: ticker,
          agentId: agentName,
          badge: AGENTS[agentName as keyof typeof AGENTS]?.badge || "ALPHA MODEL",
          signal: (data.signal || "NEUTRAL").toUpperCase() as "BULLISH" | "BEARISH" | "NEUTRAL",
          confidence: confidence,
          magnitude: magnitude,
          rationale: data.content || "Optimizing framework...",
        };
        
        setLogs((prev) => [...prev.slice(-199), newLog]);
      } catch {
        // Skip pings
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [updateTicker]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BULLISH": return "text-emerald-500";
      case "BEARISH": return "text-rose-500";
      default: return "text-amber-500";
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-zinc-950 text-xs font-mono rounded-none border-l border-zinc-800">
      <CardHeader className="bg-zinc-900/50 py-2 border-b border-zinc-800">
        <CardTitle className="flex items-center justify-between text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
          <span>Framework Execution Audit</span>
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"}`} />
            <span className="text-[10px] uppercase">{isConnected ? "Streaming" : "Offline"}</span>
          </div>
        </CardTitle>
        {schemaError && (
          <div className="bg-rose-500/20 text-rose-500 text-[9px] px-2 py-1 mt-2 rounded border border-rose-500/30 animate-pulse">
            CRITICAL: {schemaError}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden bg-black">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-2 space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col border-b border-zinc-900 pb-1.5 mb-1 leading-relaxed">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-zinc-600 text-[9px]">{log.timestamp}</span>
                  <span className="text-blue-500 font-bold tracking-tighter">{log.ticker.toUpperCase()}</span>
                  <span className="bg-zinc-800 px-1 rounded text-[9px] text-zinc-400">{log.badge}</span>
                  <span className={cn("font-bold text-[10px]", getSignalColor(log.signal))}>{log.signal}</span>
                  {log.confidence > 0 && (
                    <span className="text-zinc-500 text-[9px]">C:{Math.round(log.confidence * 100)}%</span>
                  )}
                  {log.magnitude !== 0 && (
                    <span className="text-zinc-500 text-[9px]">M:{(log.magnitude * 100).toFixed(1)}%</span>
                  )}
                </div>
                <span className="text-zinc-400 text-[11px] font-sans pl-2 border-l border-zinc-800 ml-1 line-clamp-2">{log.rationale}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-zinc-700 italic p-4 text-center">Awaiting framework signals...</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}