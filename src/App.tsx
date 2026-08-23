import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Tooltip as LeafletTooltip,
  useMap,
  Marker,
} from "react-leaflet";
import L from "leaflet";
import {
  Moon,
  Sun,
  ChevronDown,
  X,
  Search,
  BarChart3,
  PieChart as PieChartIcon,

  Target,
  Tag,
  Plus,
  Minus,
  Locate,
  Linkedin,
  Globe,
  Users,

} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "./lib/utils";
import Papa from "papaparse";
import * as topojson from "topojson-client";
import { SankeyChart } from "./components/SankeyChart";
import { CompareACsView } from "./components/CompareACsView";
import { Analytics } from "@vercel/analytics/react";


// ==========================================
// DATA MAPPING CONFIGURATION
// Change the string values here to match the column headers in your CSV file
// ==========================================
const CSV_MAP = {
  ac_no: "Constituency_No",
  position: "Position",
  year: "Year",
  ac_name: "Constituency_Name",
  candidate: "Candidate",
  party: "Party",
  votes: "Votes",
  valid_votes: "Valid_Votes",
  electors: "Electors",
  margin_percentage: "Margin_Percentage",
  vote_share_percentage: "Vote_Share_Percentage",
  turnout_percentage: "Turnout_Percentage",
  sex: "Sex",
  age: "Age",
  district_name: "District_Name"
};
// ==========================================

const STATES = [
  {
    id: "west-bengal",
    stateCode: "WB",
    name: "West Bengal",
    center: [22.9868, 87.855],
    url: "/west-bengal-topo.json",
  }
];

const standardizePartyName = (name: string) => {
  if (!name) return "IND";
  const n = name.toUpperCase().trim();
  if (n.includes("BJP") || n.includes("BHARATIYA JANATA")) return "BJP";
  if (n.includes("AITC") || n.includes("TRINAMOOL")) return "AITC";
  if (n.includes("INC") || (n.includes("CONGRESS") && !n.includes("TRINAMOOL") && !n.includes("NCP") && !n.includes("YSR"))) return "INC";
  if (n.includes("CPM") || n.includes("CPI(M)") || n.includes("CPI_M") || n.includes("COMMUNIST PARTY OF INDIA (MARXIST)"))
    return "CPM";
  if (n.includes("CPI") && !n.includes("MARXIST")) return "CPI";
  if (n.includes("DMK")) return "DMK";
  if (n.includes("AIADMK") || n.includes("ADMK")) return "AIADMK";
    if (n.includes("BSP") || n.includes("BAHUJAN SAMAJ")) return "BSP";
    if (n.includes("SP") || n.includes("SAMAJWADI")) return "SP";
    if (n.includes("AAP") || n.includes("AAM AADMI")) return "AAP";
    if (n.includes("TDP") || n.includes("TELUGU DESAM")) return "TDP";
    if (n.includes("YSR") || n.includes("YUVANJANA")) return "YSRCP";
    if (n.includes("SHS") || n.includes("SHIV SENA")) return "SHS";
    if (n.includes("NCP") || n.includes("NATIONALIST CONGRESS")) return "NCP";
    if (n.includes("AITC") || n.includes("TRINAMOOL")) return "AITC";
    if (n.includes("JD(U)") || n.includes("JANATA DAL (UNITED)")) return "JDU";
    if (n.includes("RJD") || n.includes("RASHTRIYA JANATA DAL")) return "RJD";
    if (n.includes("BJD") || n.includes("BIJU JANATA DAL")) return "BJD";
    if (n.includes("JMM") || n.includes("JHARKHAND MUKTI MORCHA")) return "JMM";
    if (n.includes("IND") || n.includes("INDEPENDENT")) return "IND";
  return n.split(" ")[0]; // Try first word as code
};

const getFallbackLogoUrl = (party: string, color?: string) => {
  const p = (party || "IND").substring(0, 3).toUpperCase();
  const c = color || "#A9A9A9";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${c}"/><text x="50" y="54" font-family="system-ui, sans-serif" font-size="${p.length > 2 ? 35 : 45}" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">${p}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
(window as any).getFallbackLogoUrl = getFallbackLogoUrl;

function CustomZoomControl({ isDark, bounds }: { isDark: boolean; bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      <button 
        onClick={() => {
          if (bounds) map.fitBounds(bounds, { paddingBottomRight: [0, 100], paddingTopLeft: [0, 0], animate: true });
        }} 
        className={cn("p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border", isDark ? "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700" : "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100")}
        aria-label="Reset View"
        title="Reset View"
      >
        <Locate size={20} />
      </button>
      <button 
        onClick={() => map.zoomIn()} 
        className={cn("p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border", isDark ? "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700" : "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100")}
        aria-label="Zoom In"
      >
        <Plus size={20} />
      </button>
      <button 
        onClick={() => map.zoomOut()} 
        className={cn("p-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border", isDark ? "bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700" : "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100")}
        aria-label="Zoom Out"
      >
        <Minus size={20} />
      </button>
    </div>
  );
}

function MapBoundsController({
  bounds,
}: {
  bounds: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { paddingBottomRight: [0, 100], paddingTopLeft: [0, 0], animate: false });
      
      const maxB = L.latLngBounds(bounds as L.LatLngBoundsLiteral).pad(0.2);
      map.setMaxBounds(maxB);
      map.setMinZoom(6);
    }
  }, [bounds, map]);
  return null;
}

const getLegendConfig = (metric: string) => {
  if (metric === "votes" || metric === "valid_votes") {
    return [
      { label: ">250k", color: "#b30000", min: 250000 },
      { label: ">200k", color: "#e34a33", min: 200000 },
      { label: ">150k", color: "#fc8d59", min: 150000 },
      { label: ">100k", color: "#fdbb84", min: 100000 },
      { label: ">50k", color: "#fdd49e", min: 50000 },
      { label: "<50k", color: "#fef0d9", min: 0 },
    ];
  } else if (metric === "vote_share") {
    return [
      { label: ">60%", color: "#b30000", min: 60 },
      { label: ">50%", color: "#e34a33", min: 50 },
      { label: ">40%", color: "#fc8d59", min: 40 },
      { label: ">30%", color: "#fdbb84", min: 30 },
      { label: ">20%", color: "#fdd49e", min: 20 },
      { label: "<20%", color: "#fef0d9", min: 0 },
    ];
  } else if (metric === "margin_pct") {
    return [
      { label: ">20%", color: "#b30000", min: 20 },
      { label: ">15%", color: "#e34a33", min: 15 },
      { label: ">10%", color: "#fc8d59", min: 10 },
      { label: ">5%", color: "#fdbb84", min: 5 },
      { label: ">2%", color: "#fdd49e", min: 2 },
      { label: "<2%", color: "#fef0d9", min: 0 },
    ];
  } else if (metric === "turnout") {
    return [
      { label: ">85%", color: "#b30000", min: 85 },
      { label: ">80%", color: "#e34a33", min: 80 },
      { label: ">75%", color: "#fc8d59", min: 75 },
      { label: ">70%", color: "#fdbb84", min: 70 },
      { label: ">60%", color: "#fdd49e", min: 60 },
      { label: "<60%", color: "#fef0d9", min: 0 },
    ];
  } else if (metric === "electors") {
    return [
      { label: ">300k", color: "#b30000", min: 300000 },
      { label: ">250k", color: "#e34a33", min: 250000 },
      { label: ">200k", color: "#fc8d59", min: 200000 },
      { label: ">150k", color: "#fdbb84", min: 150000 },
      { label: ">100k", color: "#fdd49e", min: 100000 },
      { label: "<100k", color: "#fef0d9", min: 0 },
    ];
  } else if (metric === "sex") {
    return [
      { label: "F > 1050 / 1000M", color: "#980043", min: 1050 },
      { label: "> 1000", color: "#dd1c77", min: 1000 },
      { label: "> 950", color: "#df65b0", min: 950 },
      { label: "> 900", color: "#d4b9da", min: 900 },
      { label: "< 900", color: "#f1eef6", min: 0 },
    ];
  } else if (metric === "safety") {
    return [
      { label: "Safe (>15%)", color: "#16a34a", min: 14.99 },
      { label: "Comfortable (5-15%)", color: "#eab308", min: 4.99 },
      { label: "Swing Margin (<5%)", color: "#ef4444", min: -1 },
    ];
  } else if (metric === "age") {
    return [
      { label: "> 60 yrs", color: "#006837", min: 60 },
      { label: "> 55 yrs", color: "#31a354", min: 55 },
      { label: "> 50 yrs", color: "#74c476", min: 50 },
      { label: "> 45 yrs", color: "#bae4b3", min: 45 },
      { label: "< 45 yrs", color: "#edf8e9", min: 0 },
    ];
  } else if (metric === "reserved") {
    return [
      { label: "Scheduled Caste (SC)", color: "#4F46E5", min: -1, code: "SC" },
      { label: "Scheduled Tribe (ST)", color: "#059669", min: -1, code: "ST" },
      { label: "General (GEN)", color: "#F59E0B", min: -1, code: "GEN" },
    ];
  }
  return [];
};

function CustomDropdown({
  label,
  value,
  options,
  onChange,
  isDark,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  isDark: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-4 py-2 rounded-lg font-semibold flex items-center justify-between gap-3 min-w-[140px] transition-all border text-left leading-tight",
          isDark
            ? "bg-[#1e293b]/80 backdrop-blur-sm border-slate-700/50 text-slate-200 hover:bg-slate-800"
            : "bg-indigo-50/80 backdrop-blur-sm border-indigo-200/60 text-indigo-900 hover:bg-indigo-100 shadow-sm",
        )}
      >
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">
            {label}
          </span>
          <span className="truncate text-sm mt-0.5">
            {selectedOption ? selectedOption.label : "Select..."}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "opacity-50 transition-transform shrink-0 duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute top-full mt-2 left-0 min-w-full rounded-xl shadow-2xl border z-[9999] overflow-hidden overflow-y-auto max-h-[40vh] py-1.5 backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-200 whitespace-nowrap scrollbar-hide",
              isDark
                ? "bg-[#1e293b]/95 border-slate-700/50"
                : "bg-indigo-50/95 border-indigo-200/70",
            )}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between font-medium",
                  value === opt.value
                    ? isDark
                      ? "bg-amber-500/20 text-amber-500 font-bold"
                      : "bg-orange-50 text-orange-600 font-bold"
                    : isDark
                      ? "hover:bg-slate-700/50 text-slate-300 hover:text-white"
                      : "hover:bg-slate-100 text-slate-700 hover:text-black",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const DEFAULT_PARTY_COLORS: Record<string, string> = {
  "AITC": "#20C141",
  "BJP": "#FF9933",
  "INC": "#19AAED",
  "CPM": "#D41E25",
  "CPI_M": "#D41E25",
  "CPIM": "#D41E25",
  "CPI(M)": "#D41E25",
  "CPI": "#CC0000",
  "AIFB": "#E31A1C",
  "RSP": "#BD0026",
  "SUCI": "#800000",
  "GOJAM": "#FFFF00",
  "RSSCMJP": "#330066",
  "DSP(P)": "#FF4500",
  "SP": "#228B22",
  "IND": "#A9A9A9",
  "DMK": "#DD1100",
  "AIADMK": "#008000",
  "BSP": "#0000FF",
  "AAP": "#0072B0",
  "SHS": "#F07427",
  "NCP": "#00B2B2",
  "JDU": "#003366",
  "RJD": "#008000",
  "TDP": "#FFFF00",
  "YSRCP": "#000080",
  "TRS": "#FF69B4",
  "BRS": "#FF69B4",
  "BJD": "#006400",
  "SS": "#F07427",
  "JNP": "#138808",
  "FBL": "#E31A1C",
  "FB": "#E31A1C",
  "SUC": "#800000",
  "MFB": "#BD0026",
  "BBC": "#E55B3C",
  "BAC": "#19AAED",
  "RCI": "#FF4500",
};

const PARTY_FULL_NAMES: Record<string, string> = {
  "AITC": "All India Trinamool Congress",
  "BJP": "Bharatiya Janata Party",
  "INC": "Indian National Congress",
  "CPM": "Communist Party of India (Marxist)",
  "CPI_M": "Communist Party of India (Marxist)",
  "CPIM": "Communist Party of India (Marxist)",
  "CPI(M)": "Communist Party of India (Marxist)",
  "CPI": "Communist Party of India",
  "AIFB": "All India Forward Bloc",
  "RSP": "Revolutionary Socialist Party",
  "SUCI": "Socialist Unity Centre of India (C)",
  "GOJAM": "Gorkha Janmukti Morcha",
  "RSSCMJP": "Rashtriya Secular Majlis Party (ISF)",
  "DSP(P)": "Democratic Socialist Party (PC)",
  "SP": "Samajwadi Party",
  "IND": "Independent",
  "JNP": "Janata Party",
  "BAC": "Bangla Congress",
  "SUC": "Socialist Unity Centre of India",
  "FB": "Forward Bloc",
  "FBL": "Forward Bloc",
  "PSP": "Praja Socialist Party",
  "SSP": "Samyukta Socialist Party",
  "LSS": "Lok Sewak Sangh",
  "IGL": "Akhil Bharatiya Gorkha League",
  "RCI": "Revolutionary Communist Party of India",
  "RCPI(RB)": "Revolutionary Communist Party of India",
  "WPI": "Workers Party of India",
  "MFB": "Marxist Forward Bloc",
  "NCO": "Indian National Congress (O)",
  "ICS": "Indian Congress (Socialist)",
  "PML": "Muslim League",
  "MUL": "Muslim League",
  "JKP": "Jharkhand Party",
  "INC(I)": "Indian National Congress (I)",
  "GL": "Gorkha League",
  "DSP(PC)": "Democratic Socialist Party",
  "BJS": "Bharatiya Jana Sangh",
  "BBC": "Biplobi Bangla Congress",
  "FB(S)": "Forward Bloc (Socialist)",
  "COM": "Communist Party",
  "JD": "Janata Dal",
  "WBSP": "West Bengal Socialist Party",
  "GNLF": "Gorkha National Liberation Front",
  "NOTA": "None of the Above",
};


function InvertedMask({ feature, isDark }: { feature: any, isDark: boolean }) {
  const maskFeature = React.useMemo(() => {
    if (!feature || !feature.geometry) return null;
    
    // The world polygon (outer ring)
    const worldRing = [
      [180, 90],
      [180, -90],
      [-180, -90],
      [-180, 90],
      [180, 90]
    ];

    let coordinates = [];
    if (feature.geometry.type === "Polygon") {
      coordinates = [worldRing, ...feature.geometry.coordinates];
    } else if (feature.geometry.type === "MultiPolygon") {
      // For MultiPolygon, we technically need a proper clipping algorithm to invert it correctly in one feature if we want true holes, 
      // but in GeoJSON, a Polygon can have multiple holes. We can just take the first polygon as the main one, or better yet, just don't invert MultiPolygons if it's too complex, 
      // but wait, GeoJSON Polygon is [outer, hole1, hole2]. 
      // So if we make a Polygon with world as outer, and all rings from all polygons as holes...
      coordinates = [worldRing];
      if (feature.geometry.type === "Polygon") {
        coordinates.push(feature.geometry.coordinates[0]);
      } else {
        feature.geometry.coordinates.forEach(poly => {
          coordinates.push(poly[0]);
        });
      }
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: coordinates
      }
    };
  }, [feature]);

  if (!maskFeature) return null;

  return (
    <GeoJSON
      data={maskFeature}
      style={{
        fillColor: isDark ? "#090e1a" : "#f8fafc",
        fillOpacity: 1, fillRule: "evenodd",
        weight: 0,
        color: "transparent"
      }}
    />
  );
}

export default function App() {
  const getInitialParam = (key: string, validFallback: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(key) || validFallback;
    }
    return validFallback;
  };

  const getInitialState = () => {
    if (typeof window !== "undefined") {
       const params = new URLSearchParams(window.location.search);
       const sId = params.get("state");
       if (sId) {
          return STATES.find(s => s.id === sId) || STATES[0];
       }
    }
    return STATES[0];
  };

  const [activeState, setActiveState] = useState(getInitialState());
  const [metric, setMetric] = useState(getInitialParam("metric", "party"));
  const [year, setYear] = useState(getInitialParam("year", "2026"));
  const [sankeyCompareYearOverride, setSankeyCompareYearOverride] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"map" | "swing" | "compare">("map");
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<{
    feature: any;
    data: any;
    name: string;
  } | null>(null);

  const [highlightedParty, setHighlightedParty] = useState<string | null>(null);
  const [highlightCloseContests, setHighlightCloseContests] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let updated = false;
    if (params.get("state") !== activeState.id) { params.set("state", activeState.id); updated = true; }
    if (params.get("year") !== year) { params.set("year", year); updated = true; }
    if (params.get("metric") !== metric) { params.set("metric", metric); updated = true; }
    
    if (updated) {
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeState, year, metric]);


  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showLabels, setShowLabels] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableYears, setAvailableYears] = useState<string[]>(["2026", "2021", "2016", "2011"]);

  
  
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; feature: any; data: any }[]
  >([]);

  // Simulated data state for the choropleth
  const [allData, setAllData] = useState<Map<string, any>>(new Map());
  const [partyColors, setPartyColors] = useState<Record<string, string>>({});

  const trendData = React.useMemo(() => {
    if (!allData || allData.size === 0 || !availableYears || availableYears.length === 0) return null;

    const seatCountsByYearAndParty: Record<string, Record<string, number>> = {};
    availableYears.forEach((y) => (seatCountsByYearAndParty[y] = {}));

    for (const [key, record] of allData.entries()) {
      if (key.startsWith(`${activeState.id}_`)) {
        const rYear = record.year;
        if (seatCountsByYearAndParty[rYear]) {
          const p = record.party_code || record.party;
          if (p) {
            seatCountsByYearAndParty[rYear][p] =
              (seatCountsByYearAndParty[rYear][p] || 0) + 1;
          }
        }
      }
    }

    const currentYearPartyCounts: Record<string, number> = {};
    if (seatCountsByYearAndParty[year]) {
      for (const [p, count] of Object.entries(seatCountsByYearAndParty[year])) {
        currentYearPartyCounts[p] = count;
      }
    }

    const top5Parties = Object.entries(currentYearPartyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((x) => x[0]);

    if (top5Parties.length === 0) {
        const overallPartyCounts: Record<string, number> = {};
        availableYears.forEach(y => {
            for (const [p, count] of Object.entries(seatCountsByYearAndParty[y])) {
                overallPartyCounts[p] = (overallPartyCounts[p] || 0) + count;
            }
        });
        const top5Fallback = Object.entries(overallPartyCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map((x) => x[0]);
        top5Parties.push(...top5Fallback);
    }

    const uniqueTop5Parties = Array.from(new Set(top5Parties)).slice(0, 5);

    const chartData = availableYears.map((y) => {
      const dataPoint: any = { year: y };
      uniqueTop5Parties.forEach((p) => {
        dataPoint[p] = seatCountsByYearAndParty[y][p] || 0;
      });
      return dataPoint;
    });
    chartData.sort((a, b) => a.year.localeCompare(b.year));

    return { data: chartData, topParties: uniqueTop5Parties };
  }, [allData, activeState.id, availableYears, year]);
  
  const partyColorsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/party_colors.json");
        if (res.ok) {
           const colors = await res.json();
           setPartyColors(colors);
           partyColorsRef.current = colors;
        }
      } catch (e) {}
    }
    fetchColors();
  }, []);

  useEffect(() => {
    async function loadRawData() {
      setIsLoading(true);
      setError(null);
      // Keeping previous geoJsonData for smooth transitions!

      try {
        // Use demo data or real data
        let csvDataMap = new Map<string, any>();

        try {
          let allDiscoveredYears = new Set<string>();
          const fileSuffixes = ["", "-2026", "_2026", " 2026", "-new"];
          const explicitFiles = ["wb-results-2026.csv", "West_Bengal_AE.csv"];
          
          const allFiles = [...explicitFiles, ...fileSuffixes.map(s => s.endsWith(".csv") ? s : `${activeState.id}${s}.csv`)];

          for (const currentFileName of allFiles) {
            let csvData: any[] | null = null;

            // We want to load the historical file to discover available years and enrich 2026 data.
            // If performance is an issue, consider a Web Worker or pre-processing later.

            try {
              const csvResponse = await fetch(`/${currentFileName}`, {
                cache: "no-store",
              });
              if (!csvResponse.ok) continue;
              
              const fetchText = await csvResponse.text();
              if (fetchText && !fetchText.trim().toLowerCase().startsWith("<!doctype")) {
                await new Promise<void>((resolve, reject) => {
                  const rows: any[] = [];
                  Papa.parse(fetchText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    step: (row) => rows.push(row.data),
                    complete: () => {
                      csvData = rows;
                      resolve();
                    },
                    error: (err) => reject(err),
                  });
                });
              }
            } catch (e) {
              continue;
            }

            if (csvData && csvData.length > 0) {
              // Auto-detect CSV columns based on common aliases so the user doesn't have to rewrite code
              const firstRowFields = Object.keys(csvData[0] as object);

              const COLUMN_ALIASES: Record<string, string[]> = {
                ac_no: ["ac_no", "Constituency_No", "AC_No", "AC No", "Constituency_ID", "ac_id", "AC_ID", "id", "Constituency No", "AC NO"],
                position: ["position", "Position", "Rank", "pos", "rank", "Winner_Position"],
                year: ["year", "Year", "YEAR", "Year_No", "Election_Year", "ElectionYear"],
                ac_name: ["ac_name", "Constituency_Name", "AC_Name", "AC Name", "Constituency Name", "Name", "AC NAME"],
                candidate: ["candidate", "Candidate", "Candidate_Name", "Candidate Name", "Name", "Winner_Name"],
                party: ["party", "Party", "PARTY", "Party_Name", "Abbreviation"],
                votes: ["votes", "Votes", "Total Votes", "TOTAL VOTES", "Total_Votes", "Valid_Votes"],
                electors: ["electors", "Electors", "Total Electors", "Total_Electors", "Elector_Count"],
                margin_percentage: ["margin_pct", "margin_percentage", "Margin_Percentage", "Margin Pct", "Margin %"],
                margin_absolute: ["Margin", "margin", "Margin_Votes", "Vote_Margin"],
                vote_share_percentage: ["vote_share", "vote_share_percentage", "Vote_Share_Percentage", "Vote Share", "Vote %", "Vote_Share"],
                turnout_percentage: ["turnout", "turnout_percentage", "Turnout_Percentage", "Turnout", "Turnout %", "Turnout_Pct"],
                sex: ["Sex", "sex", "Gender", "gender"],
                age: ["Age", "age", "AGE"],
                district_name: ["District_Name", "district_name", "District"],
                constituency_type: ["Constituency_Type", "constituency_type", "Type"],
                education: ["MyNeta_education", "education", "Education"],
                profession: ["TCPD_Prof_Main", "TCPD_Prof_Main_Desc", "profession"],
                sub_region: ["Sub_Region", "sub_region"],
                last_party: ["Last_Party", "last_party"],
                same_party: ["Same_Party", "same_party"],
                same_constituency: ["Same_Constituency", "same_constituency"],
                last_constituency_name: ["Last_Constituency_Name", "last_constituency_name"]
              };

              const activeMap = { ...CSV_MAP } as Record<string, string>;
              for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
                const foundField = firstRowFields.find(f => aliases.some(a => a.toLowerCase() === f.toLowerCase()));
                if (foundField) {
                   activeMap[key] = foundField;
                }
              }
              // Clear out default mappings if they aren't actually in the CSV header
              for (const key of Object.keys(activeMap)) {
                 if (!firstRowFields.includes(activeMap[key])) {
                     delete activeMap[key];
                 }
              }

              const yearField = activeMap.year;
              let currentCsvYears: string[] = [];
              const pollNoField = firstRowFields.find(f => f.toLowerCase() === "poll_no");

              // Try to extract year from filename if missing inside CSV
              const yearMatch = currentFileName.match(/(?:20|19)\d{2}/);
              const fallbackYear = yearMatch ? yearMatch[0] : "2026";

              if (yearField) {
                 const filteredForYears = pollNoField 
                   ? csvData.filter(row => String(row[pollNoField]) === "0") 
                   : csvData;
                 currentCsvYears = [...new Set(filteredForYears.map(row => String(row[yearField])).filter(y => y && y !== "undefined"))];
                 currentCsvYears.forEach(y => allDiscoveredYears.add(y));
              } else {
                 allDiscoveredYears.add(fallbackYear);
              }

              const acGroups = new Map<string, any[]>();
              
              for (const row of csvData as Array<any>) {
                if (pollNoField && String(row[pollNoField]) !== "0") continue;
                
                let rowYear = activeMap.year && row[activeMap.year] ? String(row[activeMap.year]).trim() : fallbackYear;
                const rawAcNo = row[activeMap.ac_no];
                if (rawAcNo !== undefined && rawAcNo !== null && rawAcNo !== '') {
                  const normAcNo = String(rawAcNo).trim().replace(/^0+/, "") || "0";
                  const key = `${normAcNo}_${rowYear}`;
                  if (!acGroups.has(key)) acGroups.set(key, []);
                  acGroups.get(key)!.push(row);
                }
              }

              const partyCodeMap: Record<string, string> = {
                "AITC": "AITC",
                "All India Trinamool Congress": "AITC",
                "BJP": "BJP",
                "Bharatiya Janata Party": "BJP",
                "INC": "INC",
                "Indian National Congress": "INC",
                "CPM": "CPI_M",
                "Communist Party of India (Marxist)": "CPI_M",
                "IND": "IND",
                "Independent": "IND",
                "CPI": "CPI",
                "Communist Party of India": "CPI",
                "AIFB": "AIFB",
                "All India Forward Bloc": "AIFB",
                "RSP": "RSP",
                "Revolutionary Socialist Party": "RSP",
                "BSP": "BSP",
                "Bahujan Samaj Party": "BSP",
                "SUCI": "SUCI",
                "Socialist Unity Centre Of India (COMMUNIST)": "SUCI",
                "CPI(ML)(L)": "CPI(ML)(L)",
                "Communist Party of India (Marxist-Leninist) (Liberation)": "CPI(ML)(L)",
                "DMK": "DMK",
                "Dravida Munnetra Kazhagam": "DMK",
                "ADMK": "AIADMK",
                "AIADMK": "AIADMK",
                "All India Anna Dravida Munnetra Kazhagam": "AIADMK"
              };

              for (const [acKey, candidates] of acGroups.entries()) {
                const [acNo, rowYear] = acKey.split("_");
                
                if (activeMap.position && candidates[0][activeMap.position] !== undefined) {
                    candidates.sort((a, b) => (Number(a[activeMap.position]) || 999) - (Number(b[activeMap.position]) || 999));
                } else if (activeMap.votes && candidates[0][activeMap.votes] !== undefined) {
                    candidates.sort((a, b) => (Number(b[activeMap.votes]) || 0) - (Number(a[activeMap.votes]) || 0));
                }
                
                const winner = candidates[0];
                const runnerUp = candidates.length > 1 ? candidates[1] : (candidates.find(c => c !== winner) || null);
                
                const votes = Number(winner[activeMap.votes]) || 0;
                const runnerVotes = runnerUp ? (Number(runnerUp[activeMap.votes]) || 0) : 0;
                const rawParty = winner[activeMap.party] || "IND";
                
                const totalVotesPolled = candidates.reduce((sum, c) => sum + (Number(c[activeMap.votes]) || 0), 0);
                const margin = votes - runnerVotes;
                const calculatedMarginPct = totalVotesPolled > 0 ? (margin / totalVotesPolled) * 100 : 0;
                const calculatedVoteShare = totalVotesPolled > 0 ? (votes / totalVotesPolled) * 100 : 0;

                let rawMarginPct = winner[activeMap.margin_percentage];
                let margin_pct = (rawMarginPct !== undefined && rawMarginPct !== null && rawMarginPct !== "") ? Number(rawMarginPct) : calculatedMarginPct;
                
                if (isNaN(margin_pct) || margin_pct > 100 || (rawMarginPct === undefined && winner[activeMap.margin_absolute] !== undefined)) {
                  const absMargin = Number(winner[activeMap.margin_absolute]);
                  if (!isNaN(absMargin) && totalVotesPolled > 0) {
                     margin_pct = (absMargin / totalVotesPolled) * 100;
                  } else if (isNaN(margin_pct) || margin_pct > 100) {
                     margin_pct = calculatedMarginPct;
                  }
                }

                let rawVoteShare = winner[activeMap.vote_share_percentage];
                let vote_share = (rawVoteShare !== undefined && rawVoteShare !== null && rawVoteShare !== "") ? Number(rawVoteShare) : calculatedVoteShare;
                if (isNaN(vote_share) || vote_share > 100) {
                  vote_share = calculatedVoteShare;
                }
                
                const record = {
                  year: String(rowYear),
                  state: activeState.id,
                  state_code: activeState.stateCode,
                  ac_no: acNo,
                  ac_name: winner[activeMap.ac_name] || `AC ${acNo}`,
                  candidate: winner[activeMap.candidate] || "Unknown",
                  party: rawParty,
                  party_code: partyCodeMap[rawParty] || standardizePartyName(String(rawParty)),
                  reserved: winner[activeMap.constituency_type] || "GEN",
                  votes: votes,
                  total_votes: totalVotesPolled,
                  valid_votes: Number(winner[activeMap.valid_votes]) || totalVotesPolled || votes,
                  electors: Number(winner[activeMap.electors]) || 0,
                  margin_pct: margin_pct,
                  vote_share: vote_share,
                  turnout: Number(winner[activeMap.turnout_percentage]) || 0,
                  sex: winner[activeMap.sex] || "",
                  age: Number(winner[activeMap.age]) || 0,
                  district_name: winner[activeMap.district_name] || "",
                  last_party: winner[activeMap.last_party] || "",
                  same_party: String(winner[activeMap.same_party]).toLowerCase() === "true",
                  same_constituency: String(winner[activeMap.same_constituency]).toLowerCase() === "true",
                  last_constituency_name: winner[activeMap.last_constituency_name] || "",
                  sub_region: winner[activeMap.sub_region] || "",
                  education: winner[activeMap.education] || "",
                  full_candidates: candidates
                };
                
                csvDataMap.set(`${activeState.stateCode}_${acNo}_${rowYear}`, record);
                csvDataMap.set(`${activeState.id}_${acNo}_${rowYear}`, record);
              }
            }
          }

          const sortedYears = Array.from(allDiscoveredYears).sort((a,b) => b.localeCompare(a));
          const validYears = Array.from(new Set([...sortedYears.filter(y => Number(y) >= 1977), "1977"])).sort((a,b) => Number(b) - Number(a)).map(String);
          if (validYears.length > 0) {
            setAvailableYears(validYears);
            if (!validYears.includes(String(year))) {
              setYear(validYears[0]);
            }
            
            

          // --- ENRICHMENT PASS ---
          // The 2026 data file is missing demographic/geographic info (it only has votes).
          // We MUST backfill it using historical data to make the dashboard fully functional.
          const constituencyMeta = new Map();
          const candidateMeta = new Map();

          csvDataMap.forEach((record) => {
            // Collect constituency data (this never changes between elections)
            if (record.sub_region || record.district_name || (record.reserved && record.reserved !== "GEN")) {
              if (!constituencyMeta.has(record.ac_no)) {
                constituencyMeta.set(record.ac_no, { sub_region: record.sub_region, district_name: record.district_name, reserved: record.reserved });
              } else {
                const existing = constituencyMeta.get(record.ac_no);
                if (!existing.sub_region && record.sub_region) existing.sub_region = record.sub_region;
                if (!existing.district_name && record.district_name) existing.district_name = record.district_name;
                if ((!existing.reserved || existing.reserved === "GEN") && record.reserved && record.reserved !== "GEN") existing.reserved = record.reserved;
              }
            }

            // Collect candidate data
            if (record.age || record.education || record.sex) {
               const candKey = String(record.candidate).toLowerCase().trim();
               if (!candidateMeta.has(candKey)) {
                 candidateMeta.set(candKey, { age: record.age, education: record.education, sex: record.sex, baseYear: record.year });
               } else {
                 const existing = candidateMeta.get(candKey);
                 // Prefer more recent data if available
                 if (Number(record.year) >= Number(existing.baseYear)) {
                    if (record.age) existing.age = record.age;
                    if (record.education) existing.education = record.education;
                    if (record.sex) existing.sex = record.sex;
                    existing.baseYear = record.year;
                 }
               }
            }
          });

          // Apply enrichment
          csvDataMap.forEach((record) => {
            const acMeta = constituencyMeta.get(record.ac_no);
            if (acMeta) {
              if (!record.sub_region) record.sub_region = acMeta.sub_region;
              if (!record.district_name) record.district_name = acMeta.district_name;
              if ((!record.reserved || record.reserved === "GEN") && acMeta.reserved && acMeta.reserved !== "GEN") record.reserved = acMeta.reserved;
            }

            const candMeta = candidateMeta.get(String(record.candidate).toLowerCase().trim());
            if (candMeta) {
              if (!record.education) record.education = candMeta.education;
              if (!record.sex) record.sex = candMeta.sex;
              // Adjust age approximately if crossing years
              if (!record.age && candMeta.age) {
                 const yearDiff = Number(record.year) - Number(candMeta.baseYear);
                 if (yearDiff > 0 && !isNaN(yearDiff)) {
                    record.age = Number(candMeta.age) + yearDiff;
                 } else {
                    record.age = candMeta.age;
                 }
              }
            }
          });
          // --- END ENRICHMENT ---
          
          setAllData(csvDataMap);

          }
        } catch (e) {
          console.warn("CSV processing failed:", e);
        }

        // Load GeoJSON/TopoJSON Data
        const response = await fetch(activeState.url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("text/html") !== -1) {
          throw new Error(
            `Expected JSON but got HTML for ${activeState.url}. File might be missing.`,
          );
        }
        const rawData = await response.json();
        
        let data = rawData;
        if (rawData.type === 'Topology') {
            const numKeys = Object.keys(rawData.objects);
            const key = activeState.id === "west-bengal" ? "west-bengal" : (rawData.objects[activeState.id] ? activeState.id : numKeys[0]);
            if (key && rawData.objects[key]) {
               data = topojson.feature(rawData, rawData.objects[key]);
            }
        }
        
        setGeoJsonData(data);
      } catch (e: any) {
        console.error("Failed to load raw map data", e);
        setError(
          "Failed to load constituency boundary data. Ensure valid local geojson files in public/ directory.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRawData();
  }, [activeState]);

  const { featureData, legendCounts, partyCounts } = useMemo(() => {
    const defaultRes = { featureData: new Map<string, any>(), legendCounts: [] as { label: string; color: string; count: number }[], partyCounts: {} };
    if (!geoJsonData || !geoJsonData.features || allData.size === 0) return defaultRes;

    try {
        const data = geoJsonData;
        const csvDataMap = allData;

        // Generate metrics using CSV, or fallback
        const newDataMap = new Map();
        const newCounts = getLegendConfig(metric).map((c) => ({
          ...c,
          count: 0,
        }));
        const pCounts: Record<string, number> = {};

        data.features.forEach((feature: any) => {
          const rawId = feature.properties?.AC_NO || feature.properties?.ac_no || feature.properties?.id || Math.random();
          const id = String(rawId).trim().replace(/^0+/, "") || "0";

          let record =
            csvDataMap.get(`${activeState.stateCode}_${id}_${year}`) ||
            csvDataMap.get(`${activeState.id}_${id}_${year}`);

          // Fallback: match by AC name if ID doesn't match (e.g., pre-2008 delimitation)
          if (!record) {
             const featureAcName = feature.properties?.AC_NAME || feature.properties?.ac_name;
             if (featureAcName) {
                 const searchName = String(featureAcName).trim().toLowerCase();
                 for (const candRecord of csvDataMap.values()) {
                     if (candRecord.year === String(year)) {
                         const candName = String(candRecord.ac_name).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                         const sName = searchName.replace(/[^a-z0-9]/g, '');
                         if (candName === sName || sName.includes(candName) || candName.includes(sName)) {
                             record = candRecord;
                             break;
                         }
                     }
                 }
             }
          }

          if (!record) {
             feature.properties = {
               ...feature.properties,
               color: theme === "dark" ? "#334155" : "#cbd5e1",
               ac_name: feature.properties?.AC_NAME || feature.properties?.ac_name || `AC ${id}`,
               constituency_no: id,
             };
             newDataMap.set(id, feature);
             return;
          }

          const partyKey = record.party_code || record.party || "IND";

          // Augment with new metric fields if missing
          record = {
            ...record,
            party: partyKey,
            party_code: partyKey,
            turnout: record.turnout_percentage || record.turnout || (record.electors > 0 ? (record.valid_votes / record.electors) * 100 : 0),
            vote_share: record.vote_share_percentage || record.vote_share || (record.valid_votes > 0 ? (record.votes / record.valid_votes) * 100 : 0),
            margin_pct: record.margin_percentage || record.margin_pct || (record.valid_votes > 0 ? ((record.votes - (record.runner_votes || 0)) / record.valid_votes) * 100 : 0),
            sex: record.sex_ratio_female_per_1000_male || record.sex,
            sex_ratio_female_per_1000_male: record.sex_ratio_female_per_1000_male || record.sex,
            age: record.avg_elector_age || record.age,
            avg_elector_age: record.avg_elector_age || record.age,
            ac_name:
              record.ac_name ||
              feature.properties?.AC_NAME ||
              feature.properties?.ac_name ||
              `AC ${id}`,
            reserved: ["GEN", "SC", "ST"].includes(
              record.constituency_type?.toUpperCase(),
            )
              ? record.constituency_type.toUpperCase()
              : "GEN",
            constituency_no: id,
          };

          let color = theme === "dark" ? "#334155" : "#cbd5e1"; // Fallback missing data color

          if (metric === "party" || metric === "candidate") {
            color =
              partyColorsRef.current[record.party_code] ||
              partyColorsRef.current[record.party] ||
              DEFAULT_PARTY_COLORS[record.party_code] ||
              DEFAULT_PARTY_COLORS[record.party] ||
              "#808080";
            pCounts[record.party_code] = (pCounts[record.party_code] || 0) + 1;
          } else if (
            metric === "ac_name" ||
            metric === "constituency_no"
          ) {
            const val =
              metric === "ac_name"
                ? record.ac_name
                : record.constituency_no;
            const strVal = String(val).trim().toUpperCase();
            let hash = 0;
            for (let i = 0; i < strVal.length; i++) {
              hash = strVal.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            color = `hsl(${hue}, ${theme === "dark" ? 60 : 70}%, ${theme === "dark" ? 60 : 50}%)`;
            if (metric === "lok_sabha") {
              pCounts[strVal] = (pCounts[strVal] || 0) + 1;
            }
          } else if (metric === "reserved") {
            if (record.reserved === "SC") color = "#4F46E5";
            else if (record.reserved === "ST") color = "#059669";
            else color = "#F59E0B";
            pCounts[record.reserved] = (pCounts[record.reserved] || 0) + 1;
            const bin = newCounts.find((b: any) => b.code === record.reserved);
            if (bin) bin.count++;
          } else {
            let val = record.votes;
            if (metric === "vote_share") val = record.vote_share;
            if (metric === "turnout") val = record.turnout;
            if (metric === "margin_pct") val = record.margin_pct;
            if (metric === "safety") val = record.margin_pct;
            if (metric === "electors") val = record.electors;
            if (metric === "valid_votes") val = record.valid_votes;
            if (metric === "sex") val = record.sex;
            if (metric === "age") val = record.age;

            for (const bin of newCounts) {
              if (val > bin.min) {
                color = bin.color;
                bin.count++;
                break;
              }
            }
          }

          newDataMap.set(String(id), { ...record, color });
        });

        return { featureData: newDataMap, legendCounts: newCounts, partyCounts: pCounts };
    } catch (e: any) {
        console.error("Failed to map features", e);
        return { featureData: new Map<string, any>(), legendCounts: [] as { label: string; color: string; count: number }[], partyCounts: {} };
    }
  }, [allData, geoJsonData, metric, theme, year, activeState]);

  useEffect(() => {
    setSankeyCompareYearOverride(null);
    setSelectedFeature(null);
  }, [year]);

  const previousYear = useMemo(() => {
    if (sankeyCompareYearOverride) return sankeyCompareYearOverride;
    const idx = availableYears.indexOf(String(year));
    if (idx !== -1 && idx < availableYears.length - 1) {
      return availableYears[idx + 1];
    }
    return null;
  }, [availableYears, year, sankeyCompareYearOverride]);

  const sankeyData = useMemo(() => {
    if (!featureData || featureData.size === 0 || !previousYear) return { nodes: [], links: [] };

    const sourceCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};
    const flowCounts: Record<string, number> = {};

    featureData.forEach((data, id) => {
      // Look up previous year data from allData
      let prevData = allData.get(`${activeState.stateCode}_${id}_${previousYear}`) || allData.get(`${activeState.id}_${id}_${previousYear}`);
      
      // Fallback: If AC IDs changed due to delimitation (e.g. 2006 vs 2011), match by constituency name
      if (!prevData && data.ac_name) {
          for (const record of allData.values()) {
              if (record.year === String(previousYear) && String(record.ac_name).trim().toLowerCase() === String(data.ac_name).trim().toLowerCase()) {
                  prevData = record;
                  break;
              }
          }
      }
      
      let source = prevData?.party_code || prevData?.party;
      if (!source || source === "N/A" || source === "") {
        source = "Others";
      } else {
        source = standardizePartyName(source);
      }
      
      let target = data.party_code || data.party;
      if (!target || target === "N/A" || target === "") {
         target = "Others";
      } else {
         target = standardizePartyName(target);
      }
      
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      targetCounts[target] = (targetCounts[target] || 0) + 1;
      
      const flowKey = `${source}→${target}`;
      flowCounts[flowKey] = (flowCounts[flowKey] || 0) + 1;
    });

    const nodes: { name: string; id: string; color: string }[] = [];
    const sourceNodeMap = new Map<string, number>();
    const targetNodeMap = new Map<string, number>();

    const sortedSources = Object.entries(sourceCounts).sort((a,b) => b[1] - a[1]);
    const sortedTargets = Object.entries(targetCounts).sort((a,b) => b[1] - a[1]);

    sortedSources.forEach(([name], idx) => {
      sourceNodeMap.set(name, nodes.length);
      const color = name === "Others" ? "#808080" : (partyColors[name] || DEFAULT_PARTY_COLORS[name] || "#808080");
      nodes.push({
        name,
        id: `s_${name}`,
        color,
      });
    });

    sortedTargets.forEach(([name], idx) => {
      targetNodeMap.set(name, nodes.length);
      const color = name === "Others" ? "#808080" : (partyColors[name] || DEFAULT_PARTY_COLORS[name] || "#808080");
      nodes.push({
        name,
        id: `t_${name}`,
        color,
      });
    });

    const links = Object.entries(flowCounts).map(([key, value]) => {
      const [source, target] = key.split("→");
      return {
        source: sourceNodeMap.get(source)!,
        target: targetNodeMap.get(target)!,
        value,
      };
    });

    return { nodes, links };
  }, [featureData, partyColors, previousYear, allData, activeState]);

  const { bounds, labelPoints } = React.useMemo(() => {
    if (!geoJsonData) return { bounds: null, labelPoints: [] };
    try {
      const leafletGeoJson = L.geoJSON(geoJsonData);
      const bnds = leafletGeoJson.getBounds();

      const points: { id: string; name: string; center: [number, number] }[] =
        [];
      leafletGeoJson.eachLayer((layer: any) => {
        if (layer.feature && layer.getBounds) {
          const id = String(
            layer.feature.properties?.AC_NO ||
              layer.feature.properties?.ac_no ||
              layer.feature.properties?.name ||
              "",
          );
          const name =
            layer.feature.properties?.AC_NAME ||
            layer.feature.properties?.ac_name ||
            layer.feature.properties?.name ||
            id;
          const center = layer.getBounds().getCenter();
          points.push({
            id,
            name,
            center: [center.lat, center.lng] as [number, number],
          });
        }
      });

      return { bounds: bnds, labelPoints: points };
    } catch (e) {
      return { bounds: null, labelPoints: [] };
    }
  }, [geoJsonData]);

  const isDark = theme === "dark";

  const styleFeature = React.useCallback(
    (feature: any) => {
      const id = String(
        feature.properties?.AC_NO ||
          feature.properties?.ac_no ||
          feature.properties?.name ||
          "",
      );
      const data = featureData.get(id);

      let isHighlighted = true;
      if (highlightedParty && data?.party_code !== highlightedParty && data?.party !== highlightedParty) {
        isHighlighted = false;
      }
      if (highlightCloseContests && (data?.margin_pct == null || data.margin_pct >= 5)) {
        isHighlighted = false;
      }

      return {
        color: isDark ? "#020617" : "#ffffff",
        weight: 1.2,
        fillColor: data?.color || (isDark ? "#334155" : "#cbd5e1"),
        fillOpacity: isHighlighted ? 0.9 : 0.15,
        className: "outline-none transition-all duration-300",
      };
    },
    [featureData, isDark, highlightedParty, highlightCloseContests],
  );

  const onEachFeature = React.useCallback(
    (feature: any, layer: any) => {
      const id = String(
        feature.properties?.AC_NO ||
          feature.properties?.ac_no ||
          feature.properties?.name ||
          "",
      );
      const name =
        feature.properties?.AC_NAME ||
        feature.properties?.ac_name ||
        feature.properties?.name ||
        `Constituency ${id}`;
      const data = featureData.get(id);

      layer.on({
        mouseover: (e: any) => {
          const target = e.target;
          target.setStyle({
            weight: 2,
            color: isDark ? "#4cc9f0" : "#0284c7",
            // Avoid changing opacity to not break highlighted visualization state for mouseout
          });
          target.bringToFront();
        },
        mouseout: (e: any) => {
          const target = e.target;
          
          let isHighlighted = true;
          if (highlightedParty && data?.party_code !== highlightedParty && data?.party !== highlightedParty) {
            isHighlighted = false;
          }
          if (highlightCloseContests && (data?.margin_pct == null || data.margin_pct >= 5)) {
            isHighlighted = false;
          }

          target.setStyle({
            weight: 1.2,
            color: isDark ? "#020617" : "#ffffff",
          });
        },
        click: () => {
          setSelectedFeature({
            feature,
            data,
            name: name,
          });
        },
      });

      if (data) {
        const marginPct = typeof data.margin_pct === "number" ? data.margin_pct.toFixed(2) + "%" : "N/A";
        const totalVotes = typeof data.valid_votes === "number" ? data.valid_votes : data.votes;
        const runnerUpVotes = typeof data.runner_votes === "number" ? data.runner_votes : "-";

        const tooltipContent = `
        <div class="p-2 min-w-[160px]">
          <div class="font-bold text-[13px] border-b pb-1 mb-2 ${isDark ? "text-slate-100 border-slate-700" : "text-slate-900 border-slate-200"}">
            ${name}
          </div>
          
          <div class="space-y-2">
            <div class="flex flex-col">
              <span class="text-[9px] uppercase tracking-wider font-extrabold mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}">Winner</span>
              <div class="flex items-center gap-1.5 mt-0.5 mb-1">
                <span class="px-1.5 py-0.5 rounded text-white text-[10px] font-black w-fit" style="background-color: ${partyColors[data.party_code] || partyColors[data.party] || DEFAULT_PARTY_COLORS[data.party_code] || DEFAULT_PARTY_COLORS[data.party] || "#888"};">
                  ${data.party || data.party_code || "IND"}
                </span>
              </div>
              ${(data.party || data.party_code) && PARTY_FULL_NAMES[data.party || data.party_code] ? `
                <span class="text-[8px] mt-0.5 opacity-70 ${isDark ? "text-slate-400" : "text-slate-500"}">${PARTY_FULL_NAMES[data.party || data.party_code]}</span>
              ` : ""}
              <span class="text-[11px] font-bold mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}">${data.candidate || "N/A"}</span>
            </div>

            ${data.last_party ? `
            <div class="flex justify-between items-center text-[10px] py-1 border-t ${isDark ? "border-slate-800" : "border-slate-100"}">
               <span class="${isDark ? "text-slate-500" : "text-slate-400"} font-bold">PREV</span>
               <span class="font-bold ${isDark ? "text-slate-400" : "text-slate-600"}">${data.last_party}</span>
            </div>
            ` : ""}

            <div class="flex justify-between items-center text-[10px] pt-1 border-t ${isDark ? "border-slate-800" : "border-slate-100"}">
              <span class="${isDark ? "text-slate-500" : "text-slate-400"} font-bold">MARGIN</span>
              <span class="font-black text-rose-500">${marginPct}</span>
            </div>
          </div>
        </div>
      `;
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: isDark ? "custom-tooltip-dark" : "custom-tooltip-light",
          offset: [15, 15],
        });
      } else {
        const tooltipContent = `
        <div class="p-1">
          <div class="font-bold ${isDark ? "text-slate-100" : "text-slate-900"}">${name}</div>
          <div class="text-xs ${isDark ? "text-slate-500" : "text-slate-500"}">No data</div>
        </div>
      `;
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: isDark ? "custom-tooltip-dark" : "custom-tooltip-light",
          offset: [15, 15],
        });
      }
    },
    [featureData, isDark, partyColors],
  );

  const geoJsonLayerRef = React.useRef<any>(null);

  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(styleFeature);
    }
  }, [theme, metric, year, highlightedParty, highlightCloseContests, isDark, partyColors, featureData, styleFeature]);


  useEffect(() => {
    if (!geoJsonData || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results: any[] = [];
    geoJsonData.features.forEach((feature: any) => {
      const id = String(
        feature.properties?.AC_NO ||
          feature.properties?.ac_no ||
          feature.properties?.name ||
          "",
      );
      const name =
        feature.properties?.AC_NAME ||
        feature.properties?.ac_name ||
        feature.properties?.name ||
        id;
      const data = featureData.get(id);
      if (
        name.toLowerCase().includes(query) ||
        (data?.candidate && data.candidate.toLowerCase().includes(query))
      ) {
        results.push({ id, name, feature, data });
      }
    });
    setSearchResults(results.slice(0, 10)); // Limit to top 10 matches
  }, [searchQuery, geoJsonData, featureData]);

  // CartoDB tile URLs based on theme
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "h-screen w-screen flex flex-col text-sm font-sans transition-colors duration-300",
        isDark ? "bg-[#0f172a] text-slate-200" : "bg-slate-50 text-slate-800",
      )}
    >
      {/* Header Bar */}
      <header
        className={cn(
          "flex flex-wrap items-center px-6 py-4 shrink-0 z-[10000] shadow-sm border-b transition-colors gap-4 justify-between",
          isDark
            ? "bg-[#0f172a] border-slate-800 shadow-md"
            : "bg-indigo-50/90 backdrop-blur-md border-indigo-200 shadow-sm",
        )}
      >
        <div className="flex items-center gap-5 mr-0 lg:mr-4">
          <div className="flex items-center gap-3">

            <div
              className={cn(
                "w-1.5 h-8 rounded-sm",
                isDark ? "bg-red-500" : "bg-red-600",
              )}
            ></div>
            <div className="flex flex-col">
              <div className={cn("text-[10px] font-bold tracking-widest uppercase mb-1", isDark ? "text-slate-400" : "text-slate-500")}>
                West Bengal Electoral Map
              </div>
              <div className="flex items-center gap-2">
                <h1
                  className={cn(
                    "text-xl font-black tracking-tight leading-none",
                    isDark ? "text-slate-100" : "text-slate-900",
                  )}
                >
                  {activeState.name}
                </h1>
                <span
                  className={cn(
                    "text-sm font-semibold px-2 py-0.5 rounded-md",
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {year}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-1",
                  isDark ? "text-red-400" : "text-red-600",
                )}
              >
                {metric === "party"
                  ? "Winning Party"
                  : metric === "margin_pct"
                    ? "Margin of Victory (%)"
                    : metric === "vote_share"
                      ? "Vote Share (%)"
                      : metric === "turnout"
                        ? "Voter Turnout (%)"
                        : "Assembly Map"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 flex-1 min-w-[200px]">
          {/* Custom Dropdowns */}

          <CustomDropdown
            label="Year"
            value={year}
            options={availableYears.map((y) => ({ value: y, label: y }))}
            onChange={(val) => setYear(val)}
            isDark={isDark}
          />

          <CustomDropdown
            label="Metric"
            value={metric}
            options={[
              { value: "party", label: "Winning Party" },
              { value: "margin_pct", label: "Margin of Victory (%)" },
              { value: "vote_share", label: "Vote Share (%)" },
              { value: "turnout", label: "Voter Turnout (%)" },
              
              
            ]}
            onChange={(val) => setMetric(val)}
            isDark={isDark}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Small Search Bar on the right */}
          <div className="relative">
            <Search
              size={12}
              className={cn(
                "absolute left-2.5 top-1/2 -translate-y-1/2 z-10",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-7 pr-3 py-1.5 rounded text-xs border font-medium w-[120px] focus:outline-none focus:ring-1 transition-all",
                isDark
                  ? "bg-[#1e293b] border-slate-700 text-slate-200 focus:ring-blue-500/50"
                  : "bg-indigo-50/60 border-indigo-200/80 text-slate-700 focus:ring-blue-500/50",
              )}
            />
            {searchResults.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-[10000]"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                />
                <div
                  className={cn(
                    "absolute top-full mt-2 right-0 w-[240px] max-h-64 overflow-y-auto rounded-md shadow-2xl border z-[20000]",
                    isDark
                      ? "bg-[#1e293b] border-slate-700 shadow-black/50"
                      : "bg-indigo-50 border-indigo-200 shadow-indigo-100",
                  )}
                >
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setSelectedFeature({
                          feature: res.feature,
                          data: res.data,
                          name: res.name,
                        });
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors flex flex-col",
                        isDark
                          ? "hover:bg-slate-700 text-slate-200"
                          : "hover:bg-slate-100 text-slate-800",
                      )}
                    >
                      <span className="font-bold">{res.name}</span>
                      {res.data?.candidate && (
                        <span
                          className={cn(
                            "text-xs",
                            isDark ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          {res.data.candidate} ({res.data.party || "IND"})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Toggles */}
          <div className={cn("flex items-center rounded-md p-1 border", isDark ? "bg-slate-800 border-slate-700" : "bg-indigo-50/50 border-indigo-100")}>
            <button
              onClick={() => setActiveView("map")}
              className={cn(
                "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                activeView === "map"
                  ? "bg-indigo-100 dark:bg-slate-700 shadow-sm text-indigo-700 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
              )}
            >
              Map
            </button>
            <button
              onClick={() => setActiveView("swing")}
              className={cn(
                "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                activeView === "swing"
                  ? "bg-indigo-100 dark:bg-slate-700 shadow-sm text-indigo-700 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
              )}
            >
              Swing
            </button>
            <button
              onClick={() => setActiveView("compare")}
              className={cn(
                "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                activeView === "compare"
                  ? "bg-indigo-100 dark:bg-slate-700 shadow-sm text-indigo-700 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
              )}
            >
              Compare ACs
            </button>
          </div>

          
          <div className="flex items-center gap-3">
            <div className={cn(
              "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border",
              isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200"
            )}>
              <span className={cn("text-[10px] font-medium uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
                Built by
              </span>
              <span className={cn("text-xs font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                Suman Bhowmick
              </span>
              <div className="flex items-center gap-1.5 border-l pl-2 ml-1" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                <a href="https://suman1801.github.io/Sumanbhowmick.github.io/" target="_blank" rel="noreferrer" className={cn("transition-colors", isDark ? "text-slate-400 hover:text-indigo-400" : "text-slate-400 hover:text-indigo-600")} title="Portfolio">
                  <Globe size={14} />
                </a>
                <a href="https://www.linkedin.com/in/suman-bhowmick" target="_blank" rel="noreferrer" className={cn("transition-colors", isDark ? "text-slate-400 hover:text-blue-400" : "text-slate-400 hover:text-blue-600")} title="LinkedIn">
                  <Linkedin size={14} />
                </a>
              </div>
            </div>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "group relative p-2 rounded-md border transition-colors flex items-center justify-center",
              isDark
                ? "bg-[#1e293b] border-slate-700 text-amber-200 hover:border-slate-500"
                : "bg-indigo-50/50 border-indigo-200 text-indigo-600 hover:border-indigo-300 focus:outline-blue-500",
            )}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className={cn(
              "absolute top-full mt-2 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]",
              "border border-slate-700"
            )}>
              Toggle Theme
            </span>
          </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main
        className={cn(
          "flex-1 flex w-full h-full overflow-hidden relative",
          isDark ? "bg-[#1a1a2e]" : "bg-slate-50",
        )}
      >
        {/* Map Area */}
        <div className="flex-1 relative h-full w-full" ref={containerRef}>
          {activeView === "map" ? (
            <>
              <MapContainer
            center={activeState.center as [number, number]}
            zoom={6}
            zoomSnap={0.1}
            zoomControl={false}
            attributionControl={false}
            className="h-full w-full z-0"
            style={{ background: isDark ? "#1a1a2e" : "#f1f5f9" }}
          >
            <MapBoundsController bounds={bounds} />
            <CustomZoomControl isDark={isDark} bounds={bounds} />

            <TileLayer
              url={isDark 
                ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" 
                : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"}
              subdomains="abcd"
              maxZoom={20}
              className="opacity-70 grayscale-[30%] transition-opacity"
            />

            {geoJsonData && (
              <GeoJSON
                key={`${activeState.id}-${year}-${metric}`}
                data={geoJsonData}
                style={styleFeature}
                onEachFeature={onEachFeature}
                ref={geoJsonLayerRef}
              />
            )}

            {showLabels &&
              labelPoints.map((point) => (
                <Marker
                  key={`label-${point.id}`}
                  position={point.center}
                  icon={L.divIcon({ className: "hidden" })}
                  interactive={false}
                >
                  <LeafletTooltip
                    permanent
                    direction="center"
                    className={cn(
                      "label-tooltip text-[10px] sm:text-xs font-bold leading-tight",
                      isDark
                        ? "text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                        : "text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]",
                    )}
                  >
                    {point.name}
                  </LeafletTooltip>
                </Marker>
              ))}
          </MapContainer>
          {/* Visitor Count Badge */}
          <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
            <img               src={React.useMemo(() => `https://komarev.com/ghpvc/?username=wb-electoral-map-unique-142&label=VISITORS&color=blue&style=flat&base=141&t=${Date.now()}`, [])}               alt="Visitors" 
              className={cn(
                "h-[22px] rounded-sm shadow-sm pointer-events-auto",
                isDark ? "opacity-90 hover:opacity-100" : ""
              )}
            />
          </div>

          

          {/* Modal Overlay Start */}
          {selectedFeature && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setSelectedFeature(null)}
              />
              <div
                className={cn(
                  "relative w-full max-w-5xl mx-4 sm:mx-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden flex flex-col md:flex-row border",
                  isDark ? "bg-[#0B1120] border-slate-700" : "bg-white border-slate-200",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={cn(
                    "w-full md:w-1/2 relative h-[300px] md:h-auto border-b md:border-b-0 md:border-r",
                    isDark ? "border-slate-800" : "border-slate-200",
                  )}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at center, ${selectedFeature.data?.color || partyColors[selectedFeature.data?.party_code] || partyColors[selectedFeature.data?.party] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party_code] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party] || (isDark ? "#38bdf8" : "#0284c7")} 0%, transparent 80%)`,
                    }}
                  />
                  <div
                    className={cn(
                      isDark ? "absolute inset-0 opacity-10 pointer-events-none" : "absolute inset-0 opacity-20 pointer-events-none",
                    )}
                    style={{
                      backgroundImage: `radial-gradient(${isDark ? "#e2e8f0" : "#475569"} 1.5px, transparent 1.5px)`,
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {selectedFeature.feature && (
                    <MapContainer
                      key={selectedFeature.name}
                      center={[0, 0]}
                      zoom={10}
                      zoomControl={false}
                      attributionControl={false}
                      scrollWheelZoom={false}
                      dragging={false}
                      doubleClickZoom={false}
                      className="absolute inset-8 w-[calc(100%-64px)] h-[calc(100%-64px)] pointer-events-none z-10"
                      style={{ background: "transparent" }}
                    >

<GeoJSON
                        data={selectedFeature.feature}
                        style={{
                          weight: 1,
                          color:
                            selectedFeature.data?.color ||
                            partyColors[selectedFeature.data?.party_code] || partyColors[selectedFeature.data?.party] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party_code] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party] ||
                            (isDark ? "#38bdf8" : "#0284c7"),
                          fillColor:
                            selectedFeature.data?.color ||
                            partyColors[selectedFeature.data?.party_code] || partyColors[selectedFeature.data?.party] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party_code] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party] ||
                            (isDark ? "#38bdf8" : "#0284c7"),
                          fillOpacity: 0.9,
                        }}
                      />
                      <MapBoundsController
                        bounds={L.geoJSON(selectedFeature.feature).getBounds()}
                      />
                    </MapContainer>
                  )}
                  <div
                    className={cn(
                      "absolute bottom-6 mx-6 backdrop-blur-md px-5 py-2.5 rounded-lg text-center text-sm font-bold shadow-lg border z-20",
                      isDark
                        ? "bg-[#0f172a]/80 border-slate-700 text-white"
                        : "bg-indigo-50/90 border-indigo-200 text-indigo-950",
                    )}
                  >
                    {selectedFeature.name}
                  </div>
                </div>

                {/* Right Side: Details Area */}
                <div className="md:w-1/2 flex flex-col max-h-[80vh] relative">
                  {/* Accent Top Bar */}
                  <div
                    className="absolute top-0 left-0 w-full h-1.5 z-10 hidden md:block"
                    style={{
                      backgroundColor:
                        selectedFeature.data?.color ||
                        partyColors[selectedFeature.data?.party_code] || partyColors[selectedFeature.data?.party] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party_code] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party] ||
                        (isDark ? "#38bdf8" : "#0284c7"),
                    }}
                  />

                  <div
                    className={cn(
                      "flex justify-between items-center px-6 py-5 border-b hidden md:flex",
                      isDark
                        ? "border-slate-700 bg-[#1e293b]"
                        : "border-indigo-200 bg-indigo-50",
                    )}
                  >
                    <h2
                      className={cn(
                        "font-bold text-xl",
                        isDark ? "text-slate-100" : "text-slate-900",
                      )}
                    >
                      Area Details
                    </h2>
                    <button
                      onClick={() => setSelectedFeature(null)}
                      className={cn(
                        "p-1.5 rounded-full hover:bg-black/10 transition",
                        isDark
                          ? "text-slate-300 hover:text-white"
                          : "text-slate-500 hover:text-black",
                      )}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* General Details */}
                    <div
                      className="space-y-3 pl-1 border-l-2"
                      style={{
                        borderColor:
                          selectedFeature.data?.color ||
                          partyColors[selectedFeature.data?.party_code] || partyColors[selectedFeature.data?.party] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party_code] || DEFAULT_PARTY_COLORS[selectedFeature.data?.party] ||
                          (isDark ? "#38bdf8" : "#3b82f6"),
                      }}
                    >
                      <h3
                        className={cn(
                          "font-bold uppercase tracking-widest text-[11px] ml-3",
                          isDark ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        General Information
                      </h3>

                      <div
                        className={cn(
                          "p-4 sm:p-5 rounded-xl border shadow-sm ml-3",
                          isDark
                            ? "bg-[#1a2333] border-slate-700"
                            : "bg-gradient-to-br from-white to-slate-50 border-slate-200",
                        )}
                      >
                        {(() => {
                          const data = selectedFeature.data;
                          if (!data)
                            return (
                              <p className="text-sm opacity-60">
                                No data available.
                              </p>
                            );

                          return (
                            <div className="space-y-4">
                              
                              <div
                                className="flex flex-col gap-1.5 p-3 rounded-lg"
                                style={{
                                  backgroundColor: isDark
                                    ? "rgba(0,0,0,0.2)"
                                    : "rgba(0,0,0,0.03)",
                                }}
                              >
                                <div className="flex justify-between items-start text-sm mb-1.5">
                                  <span
                                    className={cn(
                                      "font-medium mt-1",
                                      isDark
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    Winning Party
                                  </span>
                                  <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="font-bold px-2.5 py-1 rounded shadow-sm text-white text-xs border border-black/10"
                                        style={{
                                          backgroundColor:
                                            data.color ||
                                            partyColors[data.party_code] ||
                                            partyColors[data.party] ||
                                            DEFAULT_PARTY_COLORS[data.party_code] ||
                                            DEFAULT_PARTY_COLORS[data.party] ||
                                            "#555",
                                        }}
                                      >
                                        {data.party || "N/A"}
                                      </span>
                                    </div>
                                    {data.party && PARTY_FULL_NAMES[data.party] && (
                                      <span className={cn(
                                        "text-[10px] mt-1 font-medium",
                                        isDark ? "text-slate-500" : "text-slate-400"
                                      )}>
                                        {PARTY_FULL_NAMES[data.party]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span
                                    className={cn(
                                      "font-medium",
                                      isDark
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    Winner
                                  </span>
                                  <span
                                    className={cn(
                                      "font-bold uppercase text-right ml-2 text-[13px]",
                                      isDark
                                        ? "text-slate-100"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {data.candidate || "N/A"}
                                  </span>
                                </div>

                                {(data.same_party || data.same_constituency || data.last_party || data.last_constituency_name) && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {data.same_party && (
                                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                                        SAME PARTY
                                      </span>
                                    )}
                                    {data.same_constituency && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                                        SAME CONSTITUENCY
                                      </span>
                                    )}
                                  </div>
                                )}

                                {(data.last_party || data.last_constituency_name) && (
                                  <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-black/5">
                                    {data.last_party && (
                                      <div className="flex justify-between items-center text-[11px]">
                                        <span className="opacity-60">Last Party</span>
                                        <span className="font-bold">{data.last_party}</span>
                                      </div>
                                    )}
                                    {data.last_constituency_name && (
                                      <div className="flex justify-between items-center text-[11px]">
                                        <span className="opacity-60">Last Constituency</span>
                                        <span className="font-bold">{data.last_constituency_name}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div
                                className="border-t border-dashed my-1"
                                style={{
                                  borderColor: isDark ? "#334155" : "#e2e8f0",
                                }}
                              ></div>

                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Constituency No
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    isDark
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                  )}
                                >
                                  {data.constituency_no || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Reserved Status
                                </span>
                                <span
                                  className={cn(
                                    "font-bold px-2 py-0.5 rounded-md text-[10px] tracking-wide",
                                    data.reserved === "GEN"
                                      ? isDark
                                        ? "bg-slate-700 text-slate-300"
                                        : "bg-slate-200 text-slate-700"
                                      : data.reserved === "SC"
                                        ? "bg-indigo-600 text-white"
                                        : data.reserved === "ST"
                                          ? "bg-emerald-600 text-white"
                                          : "bg-amber-500 text-white",
                                  )}
                                >
                                  {data.reserved || "GEN"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Sub-Region
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    isDark
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                  )}
                                >
                                  {data.sub_region || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Education
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    isDark
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                  )}
                                >
                                  {data.education || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Age
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    isDark
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                  )}
                                >
                                  {data.age || "N/A"} yrs
                                </span>
                              </div>
                              {data.last_party && (
                                <div className="flex justify-between items-center text-sm">
                                  <span
                                    className={cn(
                                      "font-medium",
                                      isDark
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                    )}
                                  >
                                    Last Party
                                  </span>
                                  <span
                                    className="font-bold px-1.5 py-0.5 rounded text-white text-[10px]"
                                    style={{
                                      backgroundColor: partyColors[data.last_party] || "#999"
                                    }}
                                  >
                                    {data.last_party}
                                  </span>
                                </div>
                              )}
                              <div
                                className="border-t border-dashed my-3"
                                style={{
                                  borderColor: isDark ? "#334155" : "#e2e8f0",
                                }}
                              ></div>
                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Winner Votes
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    isDark
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                  )}
                                >
                                  {(data.votes || 0).toLocaleString()} ({(data.vote_share || 0).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isDark
                                      ? "text-slate-400"
                                      : "text-slate-500",
                                  )}
                                >
                                  Valid Votes Polled
                                </span>
                                <span
                                  className={cn(
                                    "font-bold",
                                    isDark
                                      ? "text-slate-200"
                                      : "text-slate-800",
                                  )}
                                >
                                  {(data.valid_votes || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div
                className={cn(
                  "p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 border",
                  isDark
                    ? "bg-[#1e293b] text-slate-200 border-slate-700"
                    : "bg-indigo-50 text-slate-800 border-indigo-100",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 border-4 border-t-transparent rounded-full animate-spin",
                    isDark ? "border-cyan-500" : "border-blue-500",
                  )}
                ></div>
                <p className="font-medium text-sm">
                  Loading geographic data...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="bg-red-50 p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 text-red-900 border border-red-200 max-w-md text-center">
                <p className="font-bold text-red-700">Error</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-4 py-2 rounded transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
            </>
          ) : activeView === "swing" ? (
            <div className={cn("absolute inset-0 z-50 p-6 overflow-y-auto", isDark ? "bg-[#0f172a] text-white" : "bg-white text-slate-900")}>
              <div className="max-w-5xl mx-auto h-full flex flex-col">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Voter Swing Analysis</h2>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                      Visualize how constituencies shifted between parties from {previousYear || "the previous election"} to {year}.
                    </p>
                  </div>
                  {/* Compare With dropdown removed by user request */}
                </div>
                
                <div className="flex-1 min-h-[500px] w-full">
                  {sankeyData.nodes.length > 0 ? (
                    <div className="h-full w-full">
                       <SankeyChart 
                         data={sankeyData} 
                         width={1000} 
                         height={600} 
                         isDark={isDark} 
                         yearA={previousYear || "Previous"} 
                         yearB={String(year)} 
                       />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-50">
                      Not enough data to calculate swings for this period.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeView === "compare" ? (
            <div className={cn("absolute inset-0 z-50 overflow-y-auto", isDark ? "bg-[#0f172a] text-white" : "bg-white text-slate-900")}>
              <CompareACsView 
                activeStateId={activeState.id} 
                allData={allData} 
                availableYears={availableYears} 
                isDark={isDark} 
                partyColors={partyColors} 
              />
            </div>
          ) : null}
        </div>{" "}
        {/* End of flex-1 map area */}
        {/* Right Side Panel */}
        {activeView === "map" && (
          <div
            className={cn(
              "w-[280px] sm:w-[320px] h-full overflow-y-auto shrink-0 border-l relative z-10 transition-colors hidden sm:flex flex-col shadow-2xl",
              isDark
                ? "bg-[#0f172a] border-slate-800"
                : "bg-indigo-50/30 border-indigo-100",
            )}
          >
            <div
              className={cn(
                "p-5 border-b flex justify-between items-center relative overflow-hidden",
                isDark ? "bg-[#0B1120] border-slate-800" : "bg-gradient-to-r from-indigo-50/50 to-white border-slate-200",
              )}
            >
              <div className={cn("absolute top-0 left-0 w-1 h-full", isDark ? "bg-indigo-500" : "bg-indigo-500")}></div>
              <h2
                className={cn(
                  "font-black uppercase tracking-widest text-[11px] ml-2",
                  isDark ? "text-indigo-400" : "text-indigo-700"
                )}
              >
                State Summary &mdash; {activeState.name}
              </h2>

            </div>

            <div className="p-6 flex-1 flex flex-col space-y-8">
              <p
                className={cn(
                  "text-[13px] leading-relaxed p-4 rounded-xl shadow-sm border",
                  isDark 
                    ? "bg-[#1e293b] text-slate-300 border-slate-700" 
                    : "bg-indigo-50/80 text-slate-700 border-indigo-100 shadow-sm"
                )}
              >
                This map displays historical {year} election outcomes for <strong>{activeState.name}</strong>. The colored zones indicate the{" "}
                <strong>
                  {metric === "party"
                    ? "Winning Party"
                    : metric === "margin_pct"
                      ? "Margin of Victory (%)"
                      : metric === "vote_share"
                        ? "Vote Share (%)"
                        : metric === "turnout"
                        ? "Voter Turnout (%)"
                        : "Assembly Map"}
                </strong>{" "}
                across the state's assembly constituencies.
              </p>

              {["party", "candidate", "reserved", "lok_sabha"].includes(
                metric,
              ) ? (
                <div className={cn(
                  "space-y-4 p-4 rounded-xl border shadow-sm",
                  isDark ? "bg-[#1e293b] border-slate-700" : "bg-indigo-50/80 border-indigo-100"
                )}>
                  <h3
                    className={cn(
                      "font-black tracking-tight text-sm flex items-center gap-2",
                      isDark ? "text-slate-100" : "text-slate-900",
                    )}
                  >
                    <BarChart3 size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                    Total Seats by Faction
                  </h3>
                  <div className="h-48 w-full relative min-h-[192px] -mt-2">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={Object.entries(partyCounts)
                            .filter(([_, count]) => Number(count) > 0)
                            .map(([name, value]) => ({ 
                                name: metric === "reserved" 
                                    ? name === "SC" ? "Scheduled Caste (SC)" : name === "ST" ? "Scheduled Tribe (ST)" : "General (GEN)" 
                                    : name, 
                                value: Number(value) 
                            }))}
                          cx="50%"
                          cy="80%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {Object.entries(partyCounts)
                            .filter(([_, count]) => Number(count) > 0)
                            .map(([name, _], index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  partyColors[name] ||
                                  (metric === "reserved" && (name.toUpperCase() === "SC"
                                    ? "#4F46E5"
                                    : name.toUpperCase() === "ST"
                                      ? "#059669"
                                      : (name.toUpperCase() === "GEN" || name.toUpperCase() === "GENERAL") ? "#F59E0B" : "#808080")) ||
                                  (name.toUpperCase() === "GEN" ? "#F59E0B" : "#808080")
                                }
                                stroke={isDark ? "#0f172a" : "#ffffff"}
                                strokeWidth={2}
                              />
                            ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#1e293b" : "#ffffff",
                            borderColor: isDark ? "#334155" : "#e2e8f0",
                            borderRadius: "8px",
                            color: isDark ? "#f8fafc" : "#0f172a",
                          }}
                          itemStyle={{ fontSize: "13px", fontWeight: "bold" }}
                          formatter={(value: number, name: string) => [
                            value + " seats",
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold",
                          isDark ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        Total Seats
                      </span>
                      <span
                        className={cn(
                          "text-3xl font-black",
                          isDark ? "text-slate-100" : "text-slate-900",
                        )}
                      >
                        {Object.values(partyCounts).reduce(
                          (a, b) => Number(a) + Number(b),
                          0,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {Object.entries(partyCounts)
                      .filter(([_, count]) => Number(count) > 0)
                      .sort((a: any, b: any) => Number(b[1]) - Number(a[1]))
                      .slice(0, 8)
                      .map(([name, count], index) => {
                        const total = Object.values(partyCounts).reduce(
                          (a, b) => Number(a) + Number(b),
                          0,
                        );
                        const pct = ((Number(count) / Number(total)) * 100).toFixed(1);
                        const color =
                          partyColors[name] ||
                          (metric === "reserved" && (name.toUpperCase() === "SC"
                            ? "#4F46E5"
                            : name.toUpperCase() === "ST"
                              ? "#059669"
                              : (name.toUpperCase() === "GEN" || name.toUpperCase() === "GENERAL") ? "#F59E0B" : "#808080")) ||
                           (name.toUpperCase() === "GEN" ? "#F59E0B" : "#808080");
                        const displayName = metric === "reserved"
                              ? name === "SC"
                                ? "Scheduled Caste (SC)"
                                : name === "ST"
                                  ? "Scheduled Tribe (ST)"
                                  : "General (GEN)"
                              : name || "N/A";
                        return (
                          <button
                            key={index}
                            className={cn("flex justify-between items-center text-sm p-2 mb-1 rounded-md transition-colors w-full text-left border border-transparent", highlightedParty === name ? (isDark ? "bg-slate-800 border-slate-700 shadow-sm" : "bg-indigo-100 shadow-sm border-indigo-200") : "hover:bg-slate-500/5")}
                            onClick={() => setHighlightedParty(highlightedParty === name ? null : name)}
                            title={`Click to isolate ${name}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full border shadow-sm"
                                style={{
                                  backgroundColor: color,
                                  borderColor: "rgba(0,0,0,0.1)",
                                }}
                              ></div>
                              <span
                                className={cn(
                                  "font-semibold truncate max-w-[140px]",
                                  isDark ? "text-slate-300" : "text-slate-700",
                                )}
                              >
                                {displayName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "font-medium text-xs",
                                  isDark ? "text-slate-400" : "text-slate-500",
                                )}
                              >
                                {pct}%
                              </span>
                              <span
                                className={cn(
                                  "font-bold w-6 text-right",
                                  isDark ? "text-slate-100" : "text-slate-900",
                                )}
                              >
                                {String(count)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

              ) : legendCounts.length > 0 ? (
                <div className={cn(
                  "space-y-4 p-4 rounded-xl border shadow-sm",
                  isDark ? "bg-[#1e293b] border-slate-700" : "bg-indigo-50/80 border-indigo-100"
                )}>
                  <h3
                    className={cn(
                      "font-black tracking-tight text-sm flex items-center gap-2",
                      isDark ? "text-slate-100" : "text-slate-900",
                    )}
                  >
                    <BarChart3 size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                    Distribution Summary
                  </h3>
                  <div className="h-48 w-full mt-2 min-h-[192px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <BarChart
                        data={legendCounts}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={isDark ? "#334155" : "#e2e8f0"}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 10,
                            fill: isDark ? "#94a3b8" : "#64748b",
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: isDark ? "#94a3b8" : "#64748b",
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          cursor={{ fill: isDark ? "#334155" : "#f1f5f9" }}
                          contentStyle={{
                            backgroundColor: isDark ? "#1e293b" : "#ffffff",
                            borderColor: isDark ? "#334155" : "#e2e8f0",
                            borderRadius: "8px",
                            color: isDark ? "#f8fafc" : "#0f172a",
                          }}
                          itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                          formatter={(value: number) => [value, "Count"]}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {legendCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div
                    className="space-y-3 pt-2 border-t"
                    style={{ borderColor: isDark ? "#334155" : "#e2e8f0" }}
                  >
                    {legendCounts.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm py-1.5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded border border-black/10 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span
                            className={cn(
                              "font-medium",
                              isDark ? "text-slate-300" : "text-slate-700",
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "font-bold",
                            isDark ? "text-slate-100" : "text-slate-900",
                          )}
                        >
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm opacity-60">
                  Select a metric to see the summary data.
                </div>
              )}

              {trendData && trendData.data.length > 0 && metric === "party" && (
                <div className={cn(
                  "mt-4 space-y-4 p-4 rounded-xl border shadow-sm",
                  isDark ? "bg-[#1e293b] border-slate-700" : "bg-indigo-50/80 border-indigo-100"
                )}>
                  <h3
                    className={cn(
                      "font-black tracking-tight text-sm flex items-center gap-2",
                      isDark ? "text-slate-100" : "text-slate-900",
                    )}
                  >
                    <BarChart3 size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                    Seat Fluctuation (Top 5 Parties)
                  </h3>
                  <div className="h-48 w-full mt-2 min-h-[192px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <LineChart data={trendData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />
                        <XAxis dataKey="year" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#1e293b" : "#ffffff",
                            borderColor: isDark ? "#334155" : "#e2e8f0",
                            borderRadius: "8px",
                            color: isDark ? "#f8fafc" : "#0f172a",
                          }}
                          itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                          labelStyle={{ fontSize: "12px", marginBottom: "4px" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                        {trendData.topParties.map((party, idx) => (
                          <Line 
                            key={party} 
                            type="monotone" 
                            dataKey={party} 
                            stroke={partyColors[party] || DEFAULT_PARTY_COLORS[party] || `hsl(${idx * 60}, 70%, 50%)`} 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Solid Bottom Source Bar */}
      <footer
        className={cn(
          "shrink-0 w-full px-4 py-2 text-xs flex justify-between items-center border-t shadow-md z-20",
          isDark
            ? "bg-[#0f172a] border-slate-800 text-slate-400"
            : "bg-indigo-50 border-indigo-200 text-slate-600",
        )}
      >
        <div className="flex-1 overflow-hidden mr-4 marquee-container">
          <div className="animate-marquee whitespace-nowrap text-amber-600 dark:text-amber-500/80 font-semibold tracking-wide">
            Disclaimer: This platform is an independent, non-partisan project built solely for exploring historical electoral data and has no political agenda. The map and data may not be fully accurate. Please consult official ECI sources for certified results. Recent 2026 data is not fully available for all aspects, so N/A is showing.
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <span className="font-bold mr-2 uppercase tracking-widest text-[10px]">
            Source:
          </span>
          {year === "2026" ? (
             <a href="https://data.opencity.in/dataset/west-bengal-assembly-elections-2026-final-results/resource/b9efa164-cf94-4adf-a2af-d5d7ececb44a" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400 font-medium">
               OpenCity.in (2026 Final Results)
             </a>
          ) : (
            <>
               <span className="mr-1">Election Data – TCPD</span>
               <span className="opacity-70">(Trivedi Centre for Political Data)</span>
            </>
          )}
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
