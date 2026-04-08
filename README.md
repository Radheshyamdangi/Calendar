# Interactive Calendar Component

 📖 Overview
 
This project is a React/Next.js interactive calendar designed with a wall-calendar aesthetic and modern UI/UX principles. It transforms a static design into a dynamic, responsive, and immersive experience. The calendar supports **day view, range selection, notes integration, search navigation, and dynamic hero images.

✨ Features
- **Wall Calendar Aesthetic**: Hero image + month ribbon styled like a physical calendar.
- Dynamic Navigation:
  - Left/right arrows for month switching.
  - Swipe gestures on mobile.
- Search Bar : Jump directly to a specific day, month, or year (`"Jan 15, 2022"`, `"Jan 2022"`, `"2023"`).
  
- Day & Range Selection:
  - Click a date to open full day view.
  - Select start and end dates for ranges.
    
- Notes Section:
  - Add notes for individual days or ranges.
  - Notes persist via localStorage.
    
- Month Summary Overlay:
  - Seasonal context (e.g., "Spring · Avg 27°C").
  - Events, tracked days, and notes count.
    
- Responsive Design:
  - Desktop: spacious layout with hero, grid, and notes.
  - Mobile: stacked layout with swipe navigation.
    
- Interactive Effects:
  - Hover tooltips for day previews.
  - Smooth transitions with Framer Motion.
  - Gradient hero backgrounds and dynamic overlays.

## 🛠️ Tech Stack
- **React / Next.js** – Core framework
- **Framer Motion** – Animations and transitions
- **Lucide Icons** – Navigation icons
- **Zustand** – Lightweight state management
- **Tailwind CSS / Custom CSS** – Styling and responsiveness

## 📂 Folder Structure
src/
├── components/
│   ├── Calendar/
│   │   ├── Calendar.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── DayView.tsx
│   │   ├── NotesSection.tsx
│   │   ├── MonthSummary.tsx
│   │   └── styles.css
│   └── Layout.tsx
├── hooks/
│   └── useDateRange.ts
├── store/
│   └── calendarStore.ts
├── utils/
│   ├── dateUtils.ts
│   └── hero.ts
└── pages/
└── index.tsx

Code

 🚀 Getting Started
 
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calendar-app.git
   
Install dependencies:

bash
cd calendar-app
npm install
Run locally:

bash
npm run dev
Open in browser:

Code
http://localhost:5174

🧩 Future Enhancements
Holiday markers and cultural events integration.

Weather API for real-time temperature and sunrise/sunset.

Theme switching based on season/month.
<img width="1911" height="870" alt="image" src="https://github.com/user-attachments/assets/1bc1edf6-f7d7-433f-bc98-ed1bd3d4177a" />
