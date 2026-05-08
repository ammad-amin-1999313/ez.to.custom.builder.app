"use client";

import { useState, useRef, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import {
  TrendingUp, Eye, MousePointerClick, Users, ArrowUpRight,
  Globe, Smartphone, Monitor, Calendar, Download, ChevronDown, Check,
} from "lucide-react";
import { toast } from "sonner";

// ─── Date range config ────────────────────────────────────────────────────────
const RANGES = [
  { id: "7d",  label: "Last 7 days",   days: 7  },
  { id: "30d", label: "Last 30 days",  days: 30 },
  { id: "90d", label: "Last 90 days",  days: 90 },
  { id: "1y",  label: "Last year",     days: 365 },
];

// ─── Mock data generators (scale based on selected range) ────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function makeViewsData(days: number) {
  if (days <= 7) return [
    { day:"Mon", views:34,  visitors:28  },
    { day:"Tue", views:52,  visitors:41  },
    { day:"Wed", views:47,  visitors:36  },
    { day:"Thu", views:89,  visitors:74  },
    { day:"Fri", views:112, visitors:91  },
    { day:"Sat", views:76,  visitors:60  },
    { day:"Sun", views:94,  visitors:78  },
  ];
  if (days <= 30) return Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    views: 40 + Math.round(Math.sin(i * 0.4) * 20 + Math.random() * 60),
    visitors: 30 + Math.round(Math.sin(i * 0.4) * 15 + Math.random() * 40),
  }));
  return Array.from({ length: 12 }, (_, i) => ({
    day: MONTHS[i],
    views: 200 + Math.round(Math.sin(i * 0.5) * 80 + Math.random() * 200),
    visitors: 150 + Math.round(Math.sin(i * 0.5) * 60 + Math.random() * 150),
  }));
}

function scaleStats(days: number) {
  const mul = days <= 7 ? 1 : days <= 30 ? 4.2 : days <= 90 ? 12 : 52;
  return [
    { label:"Total Views",     value: Math.round(1204 * mul).toLocaleString(), change:"+18%", icon:Eye,              color:"text-indigo-400",  bg:"bg-indigo-500/10"  },
    { label:"Link Clicks",     value: Math.round(497  * mul).toLocaleString(), change:"+24%", icon:MousePointerClick, color:"text-emerald-400", bg:"bg-emerald-500/10" },
    { label:"Unique Visitors", value: Math.round(832  * mul).toLocaleString(), change:"+11%", icon:Users,             color:"text-pink-400",    bg:"bg-pink-500/10"    },
    { label:"CTR",             value: "41.3%",                                 change:"+6%",  icon:TrendingUp,        color:"text-amber-400",   bg:"bg-amber-500/10"   },
  ];
}

const clicksData = [
  { name:"Portfolio", clicks:45 },
  { name:"Blog",      clicks:30 },
  { name:"Twitter",   clicks:62 },
  { name:"Instagram", clicks:38 },
  { name:"Resume",    clicks:22 },
];

const deviceData = [
  { name:"Mobile",  value:62, color:"#6366f1" },
  { name:"Desktop", value:31, color:"#8b5cf6" },
  { name:"Tablet",  value:7,  color:"#a78bfa" },
];

const referrerData = [
  { source:"Direct",    visits:312 },
  { source:"Twitter",   visits:198 },
  { source:"Instagram", visits:156 },
  { source:"Google",    visits:134 },
  { source:"LinkedIn",  visits:88  },
  { source:"Other",     visits:43  },
];

const monthlyData = [
  { month:"Jan", views:280 },{ month:"Feb", views:390 },
  { month:"Mar", views:340 },{ month:"Apr", views:520 },
  { month:"May", views:480 },{ month:"Jun", views:640 },
  { month:"Jul", views:720 },
];

const recentActivity = [
  { event:"Page viewed",       location:"San Francisco, US", time:"2m ago",  flag:"🇺🇸" },
  { event:"Portfolio clicked", location:"London, UK",        time:"8m ago",  flag:"🇬🇧" },
  { event:"Page viewed",       location:"Tokyo, JP",         time:"15m ago", flag:"🇯🇵" },
  { event:"Twitter clicked",   location:"Berlin, DE",        time:"22m ago", flag:"🇩🇪" },
  { event:"Page viewed",       location:"Sydney, AU",        time:"41m ago", flag:"🇦🇺" },
  { event:"Instagram clicked", location:"Paris, FR",         time:"55m ago", flag:"🇫🇷" },
  { event:"Page viewed",       location:"Toronto, CA",       time:"1h ago",  flag:"🇨🇦" },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ViewsTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs text-zinc-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm text-white capitalize">
            {p.dataKey}: <span className="text-indigo-400">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Date range dropdown ──────────────────────────────────────────────────────
function RangeDropdown({ selected, onChange }: { selected: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = RANGES.find(r => r.id === selected)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
      >
        <Calendar className="w-3.5 h-3.5" />
        {current.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
          {RANGES.map(r => (
            <button
              key={r.id}
              onClick={() => { onChange(r.id); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {r.label}
              {r.id === selected && <Check className="w-3 h-3 text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(viewsData: { day: string; views: number; visitors: number }[], rangeLabel: string) {
  const header = "Period,Views,Visitors";
  const rows = viewsData.map(d => `${d.day},${d.views},${d.visitors}`);
  const clickRows = clicksData.map(d => `${d.name},${d.clicks},-`);
  const csv = [
    `# EZ.to Analytics Export — ${rangeLabel}`,
    "",
    "## Page Views",
    header,
    ...rows,
    "",
    "## Link Clicks",
    "Link,Clicks,-",
    ...clickRows,
    "",
    "## Referrers",
    "Source,Visits,-",
    ...referrerData.map(r => `${r.source},${r.visits},-`),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ezto-analytics-${rangeLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Analytics exported!", { description: `${rangeLabel} data downloaded as CSV` });
}

// ─── Main component ───────────────────────────────────────────────────────────
interface AnalyticsPanelProps {
  fullPage?: boolean;
}

export function AnalyticsPanel({ fullPage = false }: AnalyticsPanelProps) {
  const [range, setRange] = useState("7d");
  const currentRange = RANGES.find(r => r.id === range)!;
  const viewsData = makeViewsData(currentRange.days);
  const stats = scaleStats(currentRange.days);

  if (!fullPage) {
    return (
      <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm text-white">Analytics</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{currentRange.label} · Demo data</p>
          </div>
          <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">Live</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`rounded-xl border border-zinc-800 p-3 ${s.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${s.color} mb-2`} />
                  <p className="text-lg text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Full-page dashboard ────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto bg-zinc-950" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white">Analytics Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{currentRange.label} · Demo data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Live
          </div>
          <RangeDropdown selected={range} onChange={setRange} />
          <button
            onClick={() => exportCSV(viewsData, currentRange.label)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6 max-w-7xl mx-auto">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`rounded-2xl border border-zinc-800 p-5 ${stat.bg} flex flex-col gap-3`}>
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bg} border border-white/10`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {stat.change}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <p className="text-2xl text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Charts row 1 ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Daily views (spans 2 cols) */}
          <div className="col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm text-zinc-200">Page Views & Visitors</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Daily breakdown</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />Views</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />Visitors</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={viewsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ViewsTooltip />} />
                <Area type="monotone" dataKey="views"    stroke="#6366f1" strokeWidth={2} fill="url(#viewsGrad2)"   />
                <Area type="monotone" dataKey="visitors" stroke="#a78bfa" strokeWidth={2} fill="url(#visitorsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Device breakdown */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <div className="mb-5">
              <h3 className="text-sm text-zinc-200">Device Breakdown</h3>
              <p className="text-xs text-zinc-500 mt-0.5">By device type</p>
            </div>
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {deviceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 10, fontSize: 12 }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {deviceData.map((d) => {
                const Icon = d.name === "Mobile" ? Smartphone : d.name === "Desktop" ? Monitor : Globe;
                return (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <Icon className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-zinc-400">{d.name}</span>
                    </div>
                    <span className="text-zinc-300">{d.value}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Charts row 2 ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Monthly trend */}
          <div className="col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm text-zinc-200">Monthly Trend</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Page views over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 10, fontSize: 12 }}
                  itemStyle={{ color: "#6366f1" }}
                />
                <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top referrers */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <div className="mb-4">
              <h3 className="text-sm text-zinc-200">Top Referrers</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Traffic sources</p>
            </div>
            <div className="space-y-3">
              {referrerData.map((r, i) => {
                const pct = Math.round((r.visits / referrerData[0].visits) * 100);
                return (
                  <div key={r.source}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300">{r.source}</span>
                      <span className="text-zinc-500">{r.visits}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: i === 0
                            ? "linear-gradient(90deg, #6366f1, #818cf8)"
                            : `rgba(99,102,241,${0.7 - i * 0.1})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Top link clicks */}
          <div className="col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <div className="mb-5">
              <h3 className="text-sm text-zinc-200">Top Link Clicks</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Most popular links this week</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={clicksData} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#52525b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 10 }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                  labelStyle={{ color: "#a1a1aa", fontSize: 11 }}
                />
                <Bar dataKey="clicks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent activity */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <div className="mb-4">
              <h3 className="text-sm text-zinc-200">Recent Activity</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Live visitor events</p>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{item.event}</span>
                    </div>
                    <span className="text-zinc-600 ml-3">
                      {item.flag} {item.location}
                    </span>
                  </div>
                  <span className="text-zinc-600 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
