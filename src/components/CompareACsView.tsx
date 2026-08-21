
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import { MapPin, Search, ChevronDown } from 'lucide-react';

interface Props {
  activeStateId: string;
  allData: Map<string, any>;
  availableYears: string[];
  isDark: boolean;
  partyColors: Record<string, string>;
}

function SearchableSelect({ options, value, onChange, isDark, label }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o: any) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o: any) => 
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    String(o.value).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1 w-72" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 rounded border flex justify-between items-center cursor-pointer select-none", 
            isDark ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
          )}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : "Select AC"}</span>
          <ChevronDown size={16} className="opacity-50" />
        </div>
        
        {isOpen && (
          <div className={cn(
            "absolute top-full left-0 w-full mt-1 rounded border shadow-xl z-50 max-h-64 flex flex-col",
            isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-300"
          )}>
            <div className="p-2 border-b border-slate-200 dark:border-slate-700 relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input 
                type="text" 
                placeholder="Search by name or number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                className={cn(
                  "w-full pl-8 pr-2 py-1 text-sm rounded outline-none",
                  isDark ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-900"
                )}
              />
            </div>
            <div className="overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((o: any) => (
                  <div 
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "px-3 py-2 cursor-pointer text-sm",
                      isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-700",
                      value === o.value && (isDark ? "bg-slate-800 text-blue-400 font-bold" : "bg-slate-100 text-blue-600 font-bold")
                    )}
                  >
                    {o.label}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm opacity-50 text-center">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CompareACsView({ activeStateId, allData, availableYears, isDark, partyColors }: Props) {
  const acList = useMemo(() => {
    const list = new Map<string, string>();
    for (const [key, record] of allData.entries()) {
      if (key.startsWith(`${activeStateId}_`)) {
        list.set(String(record.ac_no), record.ac_name);
      }
    }
    return Array.from(list.entries())
      .map(([ac_no, ac_name]) => ({ value: ac_no, label: `${ac_no} - ${ac_name}`, name: ac_name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allData, activeStateId]);

  const [ac1, setAc1] = useState<string>("");
  const [ac2, setAc2] = useState<string>("");

  React.useEffect(() => {
    if (acList.length >= 2 && (!ac1 || !ac2)) {
      if (!ac1) setAc1(acList[0].value);
      if (!ac2) setAc2(acList[1].value);
    }
  }, [acList, ac1, ac2]);

  const chartData = useMemo(() => {
    if (!ac1 || !ac2) return [];
    
    const sortedYears = [...availableYears].sort((a, b) => a.localeCompare(b));
    
    return sortedYears.map(year => {
      const record1 = allData.get(`${activeStateId}_${ac1}_${year}`);
      const record2 = allData.get(`${activeStateId}_${ac2}_${year}`);
      
      return {
        year,
        ac1_turnout: record1?.turnout || null,
        ac2_turnout: record2?.turnout || null,
        ac1_margin: record1?.margin_pct || null,
        ac2_margin: record2?.margin_pct || null,
        ac1_voteshare: record1?.vote_share || null,
        ac2_voteshare: record2?.vote_share || null,
        ac1_electors: record1?.electors || null,
        ac2_electors: record2?.electors || null,
        ac1_valid: record1?.valid_votes || null,
        ac2_valid: record2?.valid_votes || null,
        ac1_party: record1?.party_code || record1?.party || "-",
        ac2_party: record2?.party_code || record2?.party || "-",
      };
    });
  }, [ac1, ac2, availableYears, allData, activeStateId]);

  const ac1Name = acList.find(a => a.value === ac1)?.name || "AC 1";
  const ac2Name = acList.find(a => a.value === ac2)?.name || "AC 2";

  const chartThemeProps = {
    contentStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "8px", color: isDark ? "#f8fafc" : "#0f172a" },
    itemStyle: { fontSize: "12px", fontWeight: "bold" },
    axisColor: isDark ? "#64748b" : "#94a3b8",
    gridColor: isDark ? "#334155" : "#e2e8f0"
  };

  return (
    <div className={cn("w-full h-full p-6 md:p-8 flex flex-col transition-colors overflow-hidden", isDark ? "bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-900")}>
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="text-blue-500" />
          Constituency Comparison
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Compare historical trends of two Assembly Constituencies side-by-side.
        </p>
      </div>

      <div className="flex gap-4 mb-6 relative z-50 flex-wrap">
        <SearchableSelect 
          label="Select AC 1"
          options={acList}
          value={ac1}
          onChange={setAc1}
          isDark={isDark}
        />
        <SearchableSelect 
          label="Select AC 2"
          options={acList}
          value={ac2}
          onChange={setAc2}
          isDark={isDark}
        />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-4">
        {/* Turnout Chart */}
        <div className={cn("p-4 rounded-xl border shadow-sm flex flex-col", isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200")}>
          <h3 className="font-bold text-sm mb-4">Voter Turnout (%)</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeProps.gridColor} vertical={false} />
                <XAxis dataKey="year" stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={chartThemeProps.contentStyle} itemStyle={chartThemeProps.itemStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Line type="monotone" dataKey="ac1_turnout" name={ac1Name} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="ac2_turnout" name={ac2Name} stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margin Chart */}
        <div className={cn("p-4 rounded-xl border shadow-sm flex flex-col", isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200")}>
          <h3 className="font-bold text-sm mb-4">Margin of Victory (%)</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeProps.gridColor} vertical={false} />
                <XAxis dataKey="year" stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={chartThemeProps.contentStyle} itemStyle={chartThemeProps.itemStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Line type="monotone" dataKey="ac1_margin" name={ac1Name} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="ac2_margin" name={ac2Name} stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vote Share Chart */}
        <div className={cn("p-4 rounded-xl border shadow-sm flex flex-col", isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200")}>
          <h3 className="font-bold text-sm mb-4">Winner's Vote Share (%)</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeProps.gridColor} vertical={false} />
                <XAxis dataKey="year" stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={chartThemeProps.contentStyle} itemStyle={chartThemeProps.itemStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Line type="monotone" dataKey="ac1_voteshare" name={ac1Name} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="ac2_voteshare" name={ac2Name} stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Valid Votes Bar Chart */}
        <div className={cn("p-4 rounded-xl border shadow-sm flex flex-col", isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200")}>
          <h3 className="font-bold text-sm mb-4">Total Valid Votes</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartThemeProps.gridColor} vertical={false} />
                <XAxis dataKey="year" stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={chartThemeProps.axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <RechartsTooltip contentStyle={chartThemeProps.contentStyle} itemStyle={chartThemeProps.itemStyle} formatter={(val: any) => val ? val.toLocaleString() : "N/A"} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Bar dataKey="ac1_valid" name={ac1Name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ac2_valid" name={ac2Name} fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
