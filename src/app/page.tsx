"use client";

import { useEffect, useState } from "react";
import { useUniverseStore } from "@/store/useUniverseStore";
import { StrategyCard } from "@/components/dashboard/StrategyCard";
import { LiveDebateFloor } from "@/components/dashboard/LiveDebateFloor";
import { PortfolioTable } from "@/components/dashboard/PortfolioTable";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  LayoutGrid,
  Zap
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEFAULT_TICKERS = [
  "NVDA", "AAPL", "MSFT", "TSLA", "AMD", 
  "GOOGL", "META", "AMZN", "NFLX", "PLTR",
  "COIN", "MARA", "MSTR", "SQ", "PYPL",
  "AVGO", "SMCI", "ARM", "ASML", "ORCL"
];

export default function ExecutionTerminal() {
  const { tickers, netEquity, buyingPower, activePositions, updateTicker, setGlobalMetrics } = useUniverseStore();
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(true);

  // Initialize universe
  useEffect(() => {
    DEFAULT_TICKERS.forEach(ticker => {
      updateTicker(ticker, {
        ticker,
        price: 100 + Math.random() * 500,
        score: 50,
        signal: 'NEUTRAL',
        altmanZ: 1.5 + Math.random() * 3, // Simulate institutional distress range
        targetWeight: Math.random() * 0.1,
        rsi: 30 + Math.random() * 40,
        factors: {
          value: 40 + Math.random() * 60,
          quality: 40 + Math.random() * 60,
          momentum: 40 + Math.random() * 60,
          growth: 40 + Math.random() * 60,
          risk: 40 + Math.random() * 60
        }
      });
    });

    // Mock global metrics update
    setGlobalMetrics({
      netEquity: 1245000,
      buyingPower: 450000,
      activePositions: 12
    });
  }, [updateTicker, setGlobalMetrics]);

  const handleKillSwitch = () => {
    toast.error("CRITICAL: MASS LIQUIDATION TRIGGERED", {
      description: "Executing market sell orders for all active positions.",
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      {/* Task 5: Global Control Bar */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h1 className="text-sm font-black uppercase tracking-tighter">QuantTrader <span className="text-zinc-500">v2.0</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 border-l border-zinc-800 pl-6 h-8">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-none">Net Equity</span>
              <span className="text-sm font-mono font-bold leading-none mt-1">${netEquity.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-none">Buying Power</span>
              <span className="text-sm font-mono font-bold leading-none mt-1 text-green-500">${buyingPower.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest leading-none">Positions</span>
              <span className="text-sm font-mono font-bold leading-none mt-1">{activePositions}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded border border-zinc-800">
            <Wifi className="h-3 w-3 text-green-500" />
            <span className="text-[10px] font-mono font-bold text-zinc-400">LATENCY: 12MS</span>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleKillSwitch}
            className="h-8 bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase tracking-widest gap-2 px-4 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Kill Switch
          </Button>
        </div>
      </header>

      {/* Main Layout: 70/30 Split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Task 1: The 'Strategy Universe' (Left 70%) */}
        <section className="w-[70%] flex flex-col h-full overflow-hidden border-r border-zinc-800">
          <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950/50 shrink-0">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-widest">Active Universe</h2>
              <Badge variant="outline" className="text-[9px] h-4 bg-blue-500/10 border-blue-500/30 text-blue-400">
                {DEFAULT_TICKERS.length} TICKERS
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Bullish</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Bearish</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Object.values(tickers).map((tickerData) => (
                <StrategyCard key={tickerData.ticker} data={tickerData} />
              ))}
            </div>
          </div>

          {/* Task 3: The 'Portfolio Table' (Sitting in a collapsible bottom tray) */}
          <footer className={cn(
            "border-t border-zinc-800 bg-zinc-950 transition-all duration-300 ease-in-out shrink-0",
            isPortfolioOpen ? "h-[300px]" : "h-10"
          )}>
            <div 
              className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-zinc-900 transition-colors border-b border-zinc-900"
              onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Portfolio Positions</span>
              </div>
              {isPortfolioOpen ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronUp className="h-4 w-4 text-zinc-500" />}
            </div>
            {isPortfolioOpen && <PortfolioTable />}
          </footer>
        </section>

        {/* Task 1 & 4: Global Audit Log (Right 30%) */}
        <aside className="w-[30%] h-full shrink-0">
          <LiveDebateFloor />
        </aside>
      </main>

      <Toaster theme="dark" position="top-right" />
    </div>
  );
}