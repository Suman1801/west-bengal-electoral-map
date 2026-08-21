# India Electoral Map & Analytics Dashboard

![License: Custom](https://img.shields.io/badge/License-All_Rights_Reserved-red.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)

A high-performance, interactive geospatial React application for analyzing and visualizing India's State Assembly election data. This thesis-grade dashboard allows data journalists, researchers, and political analysts to explore multi-dimensional electoral metrics down to the constituency level.

## 🌟 Features

- **Advanced Geospatial Mapping**: High-definition choropleth bounds displaying boundaries using Leaflet and GeoJSON.
- **Multi-Dimensional Metrics**: Analyze beyond just winners—visualize Vote Share (%), Margin of Victory, Voter Turnout, Gender Parity (Female/1000 Male), and Average Elector Age.
- **Strict Analytical Data Schema**: Built to join robust statistical datasets linking `state_code` + `ac_no` + `year` to prevent data collision.
- **Dynamic Visuals**: Beautiful bar chart data aggregation (via Recharts), customized color scaling for quantitative datasets.
- **Adaptive UI**: Seamless Light/Dark mode transitions, dynamic zooming, and responsive layouts designed for both desktop analysis and mobile overviews.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/india-electoral-map.git
   cd india-electoral-map
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

## 🏗️ Architecture & Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + `lucide-react` for iconography
- **Mapping Engine**: `react-leaflet` powered by Leaflet.js
- **Data Parsing**: `papaparse` for frictionless client-side CSV processing
- **Charting**: `recharts` for clean composable charting components
- **Routing**: Client-side geographic bounds management (no server-side rendering required for static analytical datasets).

## 📊 Data Schema Structure
This application relies on a strict, predictable data structure. See example subset below:

```csv
state_code,ac_no,year,ac_name,lok_sabha_id,lok_sabha_name,candidate,party_code,votes,valid_votes,electors,reserved,sex_ratio_female_per_1000_male,avg_elector_age,runner_up,runner_votes,nota_votes,total_candidates
WB,1,2026,Mekliganj,3,Jalpaiguri,John Doe,AITC,104500,200000,240000,SC,980,45.2,Jane Doe,85000,1200,6
```

## 📜 License
Copyright (c) 2026 Suman Bhowmick. All Rights Reserved.

This software and its documentation are the property of Suman Bhowmick. Please see the `LICENSE` file for more details regarding permissions and redistribution restrictions.

---
**Maintained by Suman Bhowmick**
