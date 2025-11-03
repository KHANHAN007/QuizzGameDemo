# Frontend - Quiz Fun

React + Vite application for Quiz game.

## Tech Stack

- ⚛️ React 18
- ⚡ Vite
- 🎨 Ant Design 5
- 🎉 React Confetti
- 🔗 Axios
- 🚦 React Router

## Features

- 🏠 Home page with game intro
- 🎮 Interactive quiz gameplay
- ⏱️ Timer countdown
- 🏆 Score calculation
- 🎉 Confetti celebration
- ⚙️ Admin panel for question management
- 📤 CSV import/export

## Development

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:4000/api
```

## Project Structure

```
src/
├── pages/
│   ├── Home.jsx       # Landing page
│   ├── Play.jsx       # Quiz game
│   └── Admin.jsx      # Question management
├── components/
│   └── QuestionForm.jsx
├── api.js             # API client
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── styles.css         # Global styles
```

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variable

## Notes

- Backend must be running at configured API URL
- Default port: 5173
- Mobile responsive
