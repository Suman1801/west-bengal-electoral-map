import React, { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import { cn } from "../lib/utils";

interface SankeyData {
  nodes: { name: string; id: string; color: string }[];
  links: { source: number; target: number; value: number }[];
}

interface SankeyChartProps {
  data: SankeyData;
  width: number;
  height: number;
  isDark?: boolean;
  yearA?: string;
  yearB?: string;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({
  data,
  width,
  height,
  isDark = false,
  yearA = "Last Poll",
  yearB = "Current Poll",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = React.useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({ show: false, x: 0, y: 0, text: "" });

  // Group nodes by type (source vs target) to create legends
  const uniqueParties = useMemo(() => {
    const parties = new Map<string, string>();
    data.nodes.forEach(node => {
      parties.set(node.name, node.color);
    });
    return Array.from(parties.entries());
  }, [data.nodes]);

  const sankey = useMemo(() => {
    return d3Sankey<any, any>()
      .nodeWidth(80)
      .nodePadding(15)
      .extent([
        [0, 50],
        [width, height - 80],
      ])
      .nodeAlign(sankeyCenter);
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { nodes, links } = sankey(JSON.parse(JSON.stringify(data)));

    // Links
    const link = svg
      .append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(links)
      .join("g")
      .style("mix-blend-mode", isDark ? "screen" : "multiply");

    const gradients = svg.append("defs")
        .selectAll("linearGradient")
        .data(links)
        .join("linearGradient")
        .attr("id", (d: any, i: number) => `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (d: any) => d.source.x1)
        .attr("x2", (d: any) => d.target.x0);

    gradients.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", (d: any) => d.source.color);

    gradients.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", (d: any) => d.target.color);

    link
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any, i: number) => `url(#gradient-${i})`)
      .attr("stroke-opacity", isDark ? 0.4 : 0.25)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .style("cursor", "pointer")
      .on("mouseover", function (e: MouseEvent, d: any) {
         d3.select(this).attr("stroke-opacity", isDark ? 0.8 : 0.6);
         setTooltip({
            show: true,
            x: e.clientX,
            y: e.clientY,
            text: d.source.name === d.target.name
              ? `${d.source.name} retained ${d.value} seats`
              : `${d.target.name} has got ${d.value} seats from ${d.source.name}`
         });
      })
      .on("mousemove", function (e: MouseEvent, d: any) {
         setTooltip({
            show: true,
            x: e.clientX,
            y: e.clientY,
            text: d.source.name === d.target.name
              ? `${d.source.name} retained ${d.value} seats`
              : `${d.target.name} has got ${d.value} seats from ${d.source.name}`
         });
      })
      .on("mouseout", function (e: MouseEvent, d: any) {
         d3.select(this).attr("stroke-opacity", isDark ? 0.4 : 0.25);
         setTooltip(prev => ({ ...prev, show: false }));
      });

    // Nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g");

    node
      .append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => d.color)
      .attr("fill-opacity", 0.9)
      .attr("stroke", isDark ? "#ffffff" : "#000000")
      .attr("stroke-width", 0.5)
      .attr("rx", 1);

    // Node Labels: Seats
    node
      .append("text")
      .attr("x", (d: any) => (d.x0 + d.x1) / 2)
      .attr("y", (d: any) => (d.y0 + d.y1) / 2 - 4)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", (d: any) => {
          const h = d.y1 - d.y0;
          return h < 20 ? "0px" : "14px";
      })
      .style("font-weight", "900")
      .style("pointer-events", "none")
      .text((d: any) => d.value);

    // Node Labels: Name
    node
      .append("text")
      .attr("x", (d: any) => (d.x0 + d.x1) / 2)
      .attr("y", (d: any) => (d.y0 + d.y1) / 2 + 10)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", (d: any) => {
          const h = d.y1 - d.y0;
          return h < 35 ? "0px" : "11px";
      })
      .style("font-weight", "700")
      .style("opacity", 0.9)
      .style("pointer-events", "none")
      .text((d: any) => d.name);

    // External Node Labels (for small nodes)
    node
        .filter((d: any) => (d.y1 - d.y0) < 20)
        .append("text")
        .attr("x", (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", (d: any) => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "start" : "end")
        .attr("fill", isDark ? "#94a3b8" : "#475569")
        .style("font-size", "10px")
        .style("font-weight", "600")
        .text((d: any) => `${d.name}: ${d.value}`);

    // Year Labels
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", 35)
      .attr("fill", isDark ? "#cbd5e1" : "#1e293b")
      .style("font-weight", "800")
      .style("font-size", "18px")
      .text(`year(${yearA})`);

    svg
      .append("text")
      .attr("x", width)
      .attr("y", 35)
      .attr("text-anchor", "end")
      .attr("fill", isDark ? "#cbd5e1" : "#1e293b")
      .style("font-weight", "800")
      .style("font-size", "18px")
      .text(`year(${yearB})`);

  }, [data, sankey, width, isDark, yearA, yearB]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Legend Ribbon */}
      <div className={cn("flex flex-wrap items-center justify-center gap-2 mb-6 p-2 rounded-lg", isDark ? "bg-slate-900/50" : "bg-slate-50")}>
        {uniqueParties.map(([name, color]) => (
          <div key={name} className="flex items-center">
            <div 
              className="px-2 py-0.5 text-[10px] font-bold text-white uppercase rounded shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: color }}
            >
              <img 
                src={`/logos/${name.split(' - ')[0] || name}.png`} 
                alt={name} 
                className="w-3.5 h-3.5 object-contain bg-white rounded-full p-[1px]"
                onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = '/logos/IND.png';
  }}
              />
              {name}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex-1 min-h-0 relative">
        <svg
          ref={svgRef}
          width={width}
          height={height - 60}
          className="overflow-visible"
        />
        {tooltip.show && (
          <div
            className={cn(
              "fixed z-50 pointer-events-none px-3 py-2 text-sm font-semibold rounded shadow-xl transform -translate-x-1/2 -translate-y-full",
              isDark ? "bg-slate-800 text-white border border-slate-700" : "bg-[#222] text-white"
            )}
            style={{
              left: tooltip.x,
              top: tooltip.y - 15,
            }}
          >
            {tooltip.text}
            <div className={cn(
               "absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent",
               isDark ? "border-t-slate-800" : "border-t-[#222]"
            )}></div>
          </div>
        )}
      </div>
    </div>
  );
};
