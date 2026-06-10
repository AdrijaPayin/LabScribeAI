# 🔬 LabScribe AI — Intelligent Lab Report Assistant

An AI-powered tool that transforms raw experimental data and observations into fully structured, professional lab reports using the Claude API. Students input their data, and the AI generates polished academic content for every section.

---

## 🚀 Features

- **3-Step Guided Workflow** — Experiment info → Data entry → Generate
- **Section-by-Section Generation** — Generate each part independently or all at once
- **Live Report Preview** — See the formatted report update in real-time
- **7 Report Sections Auto-Generated:**
  - Abstract
  - Introduction & Theory
  - Methodology / Procedure
  - Results & Analysis (with error analysis)
  - Discussion
  - Conclusion
  - Suggested Improvements to Methodology
- **Example Loader** — Pre-filled Wheatstone Bridge experiment for testing
- **Copy Individual Sections** — One-click copy for any section
- **Export Full Report** — Download complete report as `.txt`
- **10 Experiment Types** — Electronics, Thermodynamics, Fluid Mechanics, and more

---

## 🛠️ Tech Stack

- **React 18** + Vite
- **Claude claude-sonnet-4-20250514** via Anthropic API
- **Lucide React** for icons
- **CSS Modules** for styling

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/labscribe-ai.git
cd labscribe-ai
npm install
npm run dev
```

Open `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo → Deploy

No environment variables needed — API key is stored in browser localStorage.

## 🌐 Deploy to Netlify

```bash
npm run build
# Upload /dist folder to netlify.com/drop
```

---

## 📖 How to Use

### Step 1 — Experiment Information
- Enter the experiment title and type
- Add your name, roll number, and date
- Write the objective clearly

### Step 2 — Data & Theory
- List apparatus and materials
- Write the relevant theory and formulas
- Paste your raw observation data (tables OK)
- Add calculations and lab notes

### Step 3 — Generate
- Click **Generate All Sections** for a complete report, or
- Click **Generate** next to each section individually
- Click any completed section to highlight it in the preview
- **Export** the full report as a text file

---

## 📁 Project Structure

```
labscribe-ai/
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx          # Main application
    ├── App.module.css   # Styles
    └── index.css        # Global styles
```

---

## 🎓 Academic Context

Part of a 10-project series demonstrating generative AI applications in engineering education.

**Built with:** Claude API (Anthropic) | React | Vite

---

## 📄 License

MIT License — Free for educational use.
