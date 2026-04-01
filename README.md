# 🌿 Vitality - Holistic Health & Fitness Tracker

A beautiful, cross-platform health and wellness tracking app built with React, TypeScript, Vite, and Supabase. Designed as a Progressive Web App (PWA) that can be installed on Android devices and deployed to Vercel.

## ✨ Features

### 🍽️ 1. Intermittent Fasting
- Track fasting windows (16:8, 18:6, 20:4, OMAD)
- Real-time fasting timer with progress visualization
- Monitor hunger and energy levels
- Weekly fasting consistency percentage

### 🚫 2. Dietary Avoidances
- Track avoidance of processed sugars, refined carbs, ultra-processed foods
- Seed oils, alcohol, and late-night eating tracking
- Custom trigger foods support
- Success rate analytics (7-day and 30-day)

### 🚶 3. Movement & Walking
- Daily step count with 10,000 step goal
- Morning and evening walk tracking
- Walking meetings and active commuting
- Post-meal walk counter
- Weekly mileage totals

### 💪 4. Structured Exercise
- Resistance training with muscle group tracking
- Cardio sessions (running, cycling, swimming, HIIT)
- Flexibility and mobility work
- Active recovery tracking
- Duration, intensity, and feeling ratings

### 💧 5. Hydration
- Water intake tracking (2.5L daily goal)
- Morning water habit
- Caffeine after 2PM monitoring
- Herbal tea and electrolyte tracking

### 😴 6. Sleep & Recovery
- Sleep duration and quality tracking
- Screen curfew compliance
- Morning sunlight exposure
- Sleep consistency metrics

### 🥗 7. Mindful Eating
- Protein prioritization tracking
- Vegetable servings counter (5+ daily goal)
- Distraction-free meals
- 80% fullness rule tracking
- Weekly meal prep completion

### 📊 8. Progress Metrics
- Weekly weigh-ins
- Body measurements (monthly)
- Progress photos
- Energy and mood tracking (1-10 scale)
- Non-scale victories log

### ✅ 9. Accountability & Reflection
- Daily habit check-in
- Weekly reflection (what worked, what didn't)
- Monthly goal setting and review
- Intentions and gratitude journaling

## 🎨 Design System

This app follows the "Organic Atelier" design philosophy with:
- Deep forest greens and warm sand colors
- No harsh borders - tonal layering for depth
- Glassmorphism effects
- Manrope + Inter typography pairing
- Intentional asymmetry for an editorial feel

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React + Animated Icons |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **PWA** | vite-plugin-pwa |
| **Deployment** | Vercel |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works!)

### 1. Clone and Install

```bash
cd health-tracker
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL setup from `SUPABASE_SETUP.md`
4. Copy your project URL and anon key

### 3. Configure Environment

Create a `.env` file in the `health-tracker` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start Development

```bash
# Windows (double-click)
start-app.bat

# Or manually
npm run dev
```

Open: **http://localhost:5173**

## 📦 Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework Preset: **Vite**
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### 3. Configure Supabase CORS
In Supabase Dashboard → Settings → API:
- Add your Vercel domain to CORS allowed origins
- Example: `https://your-app.vercel.app`

## 📱 Install on Android

1. Open the deployed app in Chrome on Android
2. Tap menu (3 dots) → "Add to Home screen"
3. The app installs as a standalone PWA with offline support

## 📁 Project Structure

```
health-tracker/
├── src/
│   ├── components/     # Shared components
│   ├── pages/          # Route pages
│   ├── lib/            # Supabase client & API
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── .env.example        # Environment template
├── SUPABASE_SETUP.md   # Database setup guide
├── vercel.json         # Vercel config
└── package.json
```

## 🔧 Batch Files

| File | Purpose |
|------|---------|
| `start-app.bat` | Main startup with checks |
| `start-app-simple.bat` | Quick startup |
| `create-desktop-shortcut.bat` | Create desktop icon |
| `stop-app.bat` | Stop servers (legacy) |

## 🐛 Troubleshooting

### Supabase Connection Issues
- Check URL and anon key are correct
- Ensure RLS policies are set up
- Check browser console for errors

### CORS Errors
Add your domain to Supabase CORS settings:
- Local: `http://localhost:5173`
- Production: `https://your-app.vercel.app`

### Missing Tables
Run the SQL setup from `SUPABASE_SETUP.md` in the Supabase SQL Editor.

## 📄 License

MIT

---

Made with 💚 for your wellness journey
