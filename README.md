# West Bengal Electoral Map 2026

![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)

An interactive, high-performance geospatial React application designed to visualize and analyze the 2026 West Bengal Legislative Assembly election results. This dashboard allows researchers, journalists, and political enthusiasts to explore detailed electoral metrics down to the constituency level.

## 🌟 Features

- **Interactive Geospatial Mapping:** High-definition choropleth maps displaying all West Bengal assembly constituencies using Leaflet and GeoJSON.
- **Constituency-Level Data:** Hover or click on any constituency to see the winning candidate, party, vote share, margin of victory, and historical comparison.
- **Dynamic Data Visualization:** Built-in charts (via Recharts) breaking down total seats by political party and highlighting the top parties.
- **Smart Logo Resolution:** Automatically fetches and displays political party logos (e.g., AITC, BJP, CPM, INC), with a smart fallback to generated colored circles for missing logos.
- **Multi-Metric Analysis:** Switch between different analytical lenses like "Winning Party", "Total Votes", "Vote Share (%)", "Margin of Victory", and "Reservation Status (SC/ST/GEN)".
- **Adaptive UI:** Seamless Light/Dark mode transitions, dynamic zooming, and a responsive layout designed for both desktop and mobile viewing.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/west-bengal-electoral-map.git
   cd west-bengal-electoral-map
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 🏗️ Architecture & Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + `lucide-react` for iconography
- **Mapping Engine:** `react-leaflet` powered by Leaflet.js
- **Data Parsing:** `papaparse` for fast client-side CSV processing
- **Charting:** `recharts` for clean, composable data visualization
- **Deployment:** Ready for deployment on Vercel, Netlify, or standard static hosting.

## 📂 Data Sources
The application relies on static local data found in the `public/` directory:
- `west-bengal-topo.json`: GeoJSON boundary data for the map shapes.
- `wb-results-2026.csv`: Electoral results data.
- `public/logos/`: Image assets for political party logos.

## 📜 License
Copyright (c) 2026 Suman Bhowmick. All Rights Reserved.

This software and its documentation are the property of Suman Bhowmick. Please see the `LICENSE` file for more details regarding permissions and redistribution restrictions.

---
**Maintained by Suman Bhowmick**
