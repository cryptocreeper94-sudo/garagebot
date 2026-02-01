import { motion } from "framer-motion";
import { ExternalLink, Shield, Fingerprint, Sparkles } from "lucide-react";

const ecosystemSites = [
  {
    id: "darkwave",
    name: "DarkWave Studios",
    tagline: "Creative Tech Ecosystem",
    url: "https://dwsc.io",
    gradient: "from-purple-600 via-violet-500 to-fuchsia-500",
    shadowColor: "shadow-purple-500/50",
    icon: Sparkles,
    flagColor: "bg-gradient-to-br from-purple-500 to-fuchsia-600"
  },
  {
    id: "trustlayer",
    name: "Trust Layer ID",
    tagline: "Decentralized Identity",
    url: "https://tlid.io",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    shadowColor: "shadow-cyan-500/50",
    icon: Fingerprint,
    flagColor: "bg-gradient-to-br from-cyan-500 to-blue-600"
  },
  {
    id: "trustshield",
    name: "TrustShield",
    tagline: "Blockchain Verified",
    url: "https://trustshield.tech",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    shadowColor: "shadow-emerald-500/50",
    icon: Shield,
    flagColor: "bg-gradient-to-br from-emerald-500 to-teal-600"
  }
];

export function EcosystemFlags() {
  return (
    <div className="fixed right-4 top-1/3 z-40 flex flex-col gap-4" data-testid="ecosystem-flags">
      {ecosystemSites.map((site, index) => (
        <motion.a
          key={site.id}
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
          data-testid={`flag-${site.id}`}
        >
          <div className="relative">
            <div 
              className={`absolute -left-2 top-0 w-1 h-full ${site.flagColor} rounded-full`}
              style={{ 
                boxShadow: '0 0 10px currentColor',
              }}
            />
            
            <motion.div
              className={`
                relative overflow-hidden rounded-l-lg rounded-r-xl
                bg-gradient-to-r ${site.gradient}
                p-[2px] cursor-pointer
                ${site.shadowColor} shadow-lg
              `}
              whileHover={{ 
                scale: 1.05, 
                x: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              animate={{
                y: [0, -3, 0, 3, 0],
              }}
              transition={{
                y: {
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="absolute inset-0 opacity-50">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <div className="relative bg-black/80 backdrop-blur-sm rounded-l-md rounded-r-xl px-4 py-3 flex items-center gap-3">
                <motion.div
                  className={`p-2 rounded-lg bg-gradient-to-br ${site.gradient}`}
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <site.icon className="w-5 h-5 text-white" />
                </motion.div>
                
                <div className="pr-2">
                  <div className="font-tech font-bold text-sm text-white flex items-center gap-1">
                    {site.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-white/70 font-mono">
                    {site.tagline}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-1 top-1/2 -translate-y-1/2"
              animate={{
                x: [0, 3, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className={`w-2 h-8 ${site.flagColor} rounded-full blur-sm`} />
            </motion.div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

export function EcosystemBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8" data-testid="ecosystem-banner">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-emerald-900/50" />
      
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        animate={{ x: [0, 60], y: [0, 60] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative p-6">
        <div className="text-center mb-6">
          <motion.h3 
            className="font-tech text-xl font-bold uppercase bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Explore the Ecosystem
          </motion.h3>
          <p className="text-sm text-muted-foreground mt-1">Blockchain-verified trust across all platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ecosystemSites.map((site, index) => (
            <motion.a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              data-testid={`banner-${site.id}`}
            >
              <div className={`
                absolute inset-0 bg-gradient-to-r ${site.gradient} rounded-xl opacity-20 
                group-hover:opacity-40 transition-opacity blur-xl
              `} />
              
              <div className={`
                relative overflow-hidden rounded-xl border border-white/10
                bg-black/40 backdrop-blur-md p-4
                group-hover:border-white/30 transition-all
              `}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${site.gradient}" />
                
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${site.gradient}`}>
                    <site.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-tech font-bold text-white">{site.name}</div>
                    <div className="text-xs text-white/50">{site.url.replace('https://', '')}</div>
                  </div>
                </div>
                
                <p className="text-xs text-white/70">{site.tagline}</p>
                
                <motion.div 
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.2 }}
                >
                  <ExternalLink className="w-4 h-4 text-white/50" />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FloatingFlag({ site, position = "right" }: { 
  site: "darkwave" | "trustlayer" | "trustshield";
  position?: "left" | "right";
}) {
  const siteData = ecosystemSites.find(s => s.id === site);
  if (!siteData) return null;

  return (
    <motion.a
      href={siteData.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${position === "right" ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 z-50`}
      initial={{ x: position === "right" ? 100 : -100 }}
      animate={{ x: 0 }}
      whileHover={{ x: position === "right" ? -10 : 10 }}
      data-testid={`floating-flag-${site}`}
    >
      <motion.div
        className="relative"
        animate={{
          rotateY: [0, 5, -5, 0],
          y: [0, -5, 5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ 
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
      >
        <div 
          className={`
            w-2 h-24 ${siteData.flagColor} 
            ${position === "right" ? "rounded-l-full" : "rounded-r-full"}
          `}
          style={{
            boxShadow: `0 0 20px ${siteData.shadowColor.replace('shadow-', '').replace('/50', '')}`
          }}
        />
        
        <motion.div
          className={`
            absolute top-1/2 -translate-y-1/2
            ${position === "right" ? "-left-32" : "left-4"}
            bg-gradient-to-r ${siteData.gradient} p-[2px] rounded-lg
            opacity-0 group-hover:opacity-100
          `}
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-black/90 backdrop-blur-sm rounded-md px-3 py-2">
            <div className="font-tech text-xs font-bold text-white">{siteData.name}</div>
            <div className="text-[10px] text-white/60">{siteData.tagline}</div>
          </div>
        </motion.div>
      </motion.div>
    </motion.a>
  );
}
