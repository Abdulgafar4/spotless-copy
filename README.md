# domuclean

Domu Cleanis a sleek, full-stack booking web app built with Next.js 14 (App Router), Tailwind CSS, and TypeScript. Designed for speed and scalability, Domu Cleanhandles authentication, bookings, and user dashboard features out of the box.

## 🔧 Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Package Management**: Bun / PNPM (pick one and stick to it)

## 📁 Folder Structure
```
app/            → Application routes (App Router)
  ├── layout.tsx     → Root layout
  ├── page.tsx       → Home page
  ├── login/         → Login page
  ├── signup/        → Sign-up page
  ├── dashboard/     → User dashboard
  └── booking/       → Booking system
components.json → UI component definitions (TBD)
public/         → Static assets
styles/         → Global CSS
```

## 🚀 Getting Started
```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

## 📦 Scripts
| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Build the app            |
| `npm run start`| Start the production app |

## 📌 Features
- Authentication flow (Login/Signup)
- Booking system interface
- User dashboard
- Clean UI with Tailwind


