"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

interface StatsData {
  total_checks: number;
  total_hoaks: number;
  total_fakta: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => {
        setStats({ total_checks: 0, total_hoaks: 0, total_fakta: 0 });
        setIsLoading(false);
      });
  }, []);

  const totalChecks = useCountUp(stats?.total_checks || 0);
  const totalHoaks = useCountUp(stats?.total_hoaks || 0);
  const totalFakta = useCountUp(stats?.total_fakta || 0);

  const items = [
    {
      icon: <Search className="w-4 h-4 text-accent" />,
      label: "Total Dicek",
      value: totalChecks,
      color: "text-accent",
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-hoaks" />,
      label: "Hoaks Diungkap",
      value: totalHoaks,
      color: "text-hoaks",
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-fakta" />,
      label: "Fakta Terverifikasi",
      value: totalFakta,
      color: "text-fakta",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="glass rounded-2xl p-1"
    >
      <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center py-3 px-2 sm:py-4 sm:px-4 gap-1">
            {isLoading ? (
              <>
                <div className="h-5 w-12 skeleton rounded" />
                <div className="h-3 w-16 skeleton rounded mt-1" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  {item.icon}
                  <span className={`font-jakarta font-bold text-lg sm:text-xl ${item.color}`}>
                    {formatNumber(item.value)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-text-muted font-medium">
                  {item.label}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
