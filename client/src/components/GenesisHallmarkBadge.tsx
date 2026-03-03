import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, ExternalLink, Copy, Check, Hexagon, Lock, Globe, Layers, Hash, Calendar, Cpu } from "lucide-react";

interface GenesisData {
  thId: string;
  appName: string;
  productName: string;
  releaseType: string;
  dataHash: string;
  txHash: string;
  blockHeight: string;
  verificationUrl: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  isGenesis: boolean;
}

export default function GenesisHallmarkBadge() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: genesis } = useQuery<GenesisData>({
    queryKey: ["/api/hallmark/genesis"],
    staleTime: 60_000,
  });

  if (!genesis) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const shortHash = (hash: string) =>
    hash ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : "—";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="button-genesis-hallmark-badge"
        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer"
      >
        <Shield className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
        <span className="text-xs font-mono text-cyan-300/80 group-hover:text-cyan-200 tracking-wide">
          {genesis.thId}
        </span>
        <span className="text-[10px] text-cyan-500/60 uppercase tracking-widest">Genesis</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#0a1628] to-[#0d1117] shadow-[0_0_60px_rgba(0,200,255,0.1)]"
              data-testid="modal-genesis-hallmark"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-cyan-500/20 bg-[#0a1628]/95 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-['Rajdhani']">Genesis Hallmark</h2>
                    <p className="text-xs text-cyan-400/60 font-mono">{genesis.thId}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5" data-testid="button-close-genesis-modal">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20">
                  <h3 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Application Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="App Name" value={genesis.appName} />
                    <InfoRow label="Product" value={genesis.productName} />
                    <InfoRow label="Type" value={genesis.releaseType} />
                    <InfoRow label="Status" value="Verified" highlight />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Blockchain Record
                  </h3>
                  <div className="space-y-2">
                    <HashRow label="Data Hash" value={genesis.dataHash} onCopy={() => copyToClipboard(genesis.dataHash, "dataHash")} copied={copied === "dataHash"} />
                    <HashRow label="Tx Hash" value={genesis.txHash} onCopy={() => copyToClipboard(genesis.txHash, "txHash")} copied={copied === "txHash"} />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Block Height</span>
                      <span className="text-xs font-mono text-gray-200">{genesis.blockHeight}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20">
                  <h3 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Ecosystem Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Ecosystem" value={String(genesis.metadata?.ecosystem || "Trust Layer")} />
                    <InfoRow label="Chain" value={String(genesis.metadata?.chain || "—")} />
                    <InfoRow label="Native Asset" value={String(genesis.metadata?.nativeAsset || "SIG")} />
                    <InfoRow label="Utility Token" value={String(genesis.metadata?.utilityToken || "Shells")} />
                    <InfoRow label="Parent Genesis" value={String(genesis.metadata?.parentGenesis || "TH-00000001")} />
                    <InfoRow label="Operator" value={String(genesis.metadata?.operator || "DarkWave Studios")} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                  <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Timeline
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Created" value={genesis.createdAt ? new Date(genesis.createdAt).toLocaleDateString() : "—"} />
                    <InfoRow label="Launch Date" value={genesis.metadata?.launchDate ? new Date(String(genesis.metadata.launchDate)).toLocaleDateString() : "—"} />
                  </div>
                </div>

                <a
                  href={genesis.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-colors"
                  data-testid="link-verify-genesis"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verify On-Chain
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
      <p className={`text-sm font-mono ${highlight ? "text-green-400" : "text-gray-200"}`}>{value}</p>
    </div>
  );
}

function HashRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  const short = value ? `${value.slice(0, 10)}...${value.slice(-10)}` : "—";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono text-gray-200">{short}</span>
        <button onClick={onCopy} className="p-1 rounded hover:bg-white/5" data-testid={`button-copy-${label.toLowerCase().replace(/\s/g, "-")}`}>
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
        </button>
      </div>
    </div>
  );
}
