# Mini Arcade

Mini Arcade is a retro-style web application built with React and Vite. It features classic playable mini-games, authentic CRT styling, and real-time leaderboards powered by Supabase.

## Features

- **Classic Mini-Games:** Includes playable versions of Dinosaur Game, Flappy Game, and Tetris.
- **Retro Aesthetic:** Styled with a pixel-art font and a CRT scanline overlay effect for an authentic arcade feel.
- **Real-Time Leaderboards:** Track high scores across different games using Supabase.
- **Authentication:** Secure Google Sign-In to save and manage user scores.
- **Customizable Skins:** Change the look and feel of games dynamically with different skin options.
- **Responsive Layout:** Designed to provide a mobile-friendly, full-screen gaming experience without scrolling interruptions.

## Technologies

- React 18
- Vite
- Tailwind CSS
- Supabase (Database & Authentication)

## Getting Started

### Prerequisites

- Node.js (version 18 or above recommended)
- A Supabase project for the backend

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd Mini-Games
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Setup:**

   Create a `.env` file in the root directory and add your Supabase credentials. You can see the required variables in `.env.example`:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

## Supabase Configuration

This project requires a Supabase backend to function properly. You will need to:
1. Create a new Supabase project.
2. Enable Google Authentication in the Auth settings of your project.
3. Apply the SQL schema located in the `supabase/` directory to create the necessary tables for tracking scores. Ensure row-level security (RLS) policies are correctly configured.

## Build for Production

To create a production-ready build, run:

```bash
npm run build
```

This will output optimized static files to the `dist` directory. You can preview the production build locally via:

```bash
npm run preview
```
