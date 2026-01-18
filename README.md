# RezeptApp – Frontend 🎨

**Thema:** Rezept-App  
**Team:** Moayed Shawesh – Einzelarbeit  
**Modul:** Webtechnologien, HTW Berlin

---

## 🌍 Live (Render)

| Dienst | URL |
|--------|-----|
| **Frontend** | https://frontend-rezeptapp-e5m5.onrender.com |
| **Backend** | https://backend-rezeptapp-v72u.onrender.com |

> Das Frontend nutzt standardmäßig die Production-URL des Backends und kann lokal über `VITE_BACKEND_BASE_URL` umkonfiguriert werden.

---

## 📋 Projektbeschreibung

Das Frontend der **RezeptApp** ist eine Vue-3 Single-Page-App (SPA) zur Verwaltung von Rezepten, Favoriten, Essensplänen und Nährwert-Statistiken.  
Es kommuniziert über eine REST API mit dem Spring-Boot-Backend.

**Wichtige Use-Cases im Frontend:**
- 🔐 Registrierung, Login, Logout (Token-basiert)
- 🍲 Rezepte anzeigen, suchen/filtern, Details ansehen
- ➕ Rezept erstellen & ✏️ bearbeiten & 🗑️ löschen
- ❤️ Favoriten hinzufügen/entfernen + Favoritenliste
- 📅 Essensplan erstellen & als **PDF** exportieren
- 📊 Nährwert-Statistiken abrufen & grafisch darstellen (Chart.js)
- 🔔 Toast-System für Feedback/Fehler + Confirm-Toast

---

## ✨ Features (Kurzüberblick)

- **SPA Routing** mit `vue-router` inkl. Guard (`requiresAuth`)
- **State Management** mit `pinia` (Auth / Rezepte / Toasts)
- **API Client** mit zentralem `http.ts` (Bearer Token + Error-Handling)
- **Charts** mit Chart.js (z.B. Donut/Bar/Radar)
- **Modernes Styling** mit Custom CSS + CSS Variables
- **CI/CD**: Tests + Build laufen automatisch über GitHub Actions

---

## 🛠️ Tech Stack

| Kategorie | Technologie |
|-----------|-------------|
| Framework | Vue 3 (Composition API) |
| Sprache | TypeScript |
| Build Tool | Vite |
| Routing | Vue Router |
| State | Pinia |
| Charts | Chart.js |
| Testing | Vitest + Vue Test Utils |
| Linting/Format | ESLint + Prettier |
| CI/CD | GitHub Actions |
| Deployment | Render.com |
| Node Version | Node.js 24 (CI) |

---

## 🚀 Schnellstart (lokal)

### Voraussetzungen
- Node.js **>= 22.12** (oder **Node 24**, wie in CI)
- npm

### Installation & Start
```bash
# Repository klonen
git clone https://github.com/ShaweshMoayed/frontend-rezeptapp.git
cd frontend-rezeptapp

# Dependencies installieren
npm ci

# Entwicklungsserver starten
npm run dev
```

Danach erreichbar unter:
```
http://localhost:5173
```

---

## 🔧 Konfiguration (Environment Variables)

Die App funktioniert ohne `.env` Datei, da ein Fallback genutzt wird.  
Optional kannst du lokal die Backend-URL überschreiben:
```bash
VITE_BACKEND_BASE_URL=https://backend-rezeptapp-v72u.onrender.com
```

**Hinweis:** Eine `.env` Datei gehört nicht ins Repository (wird ignoriert via `.gitignore`).

---

## 📦 Verfügbare Scripts
```bash
npm run dev        # Dev Server
npm run build      # Production Build (type-check + build)
npm run preview    # Build lokal previewen
npm run test       # Tests (Vitest run)
npm run lint       # ESLint
npm run format     # Prettier
```

---

## 📡 REST API – verwendete Endpunkte (Auswahl)

### 🔐 Authentifizierung

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/auth/register` | Nutzer registrieren |
| POST | `/auth/login` | Login (Token erhalten) |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | User-Infos (Token required) |

---

### 🍲 Rezepte & Favoriten

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/rezeptapp` | Rezepte (optional: search, category) |
| GET | `/rezeptapp/{id}` | Rezept-Detail |
| POST | `/rezeptapp` | Rezept erstellen |
| PUT | `/rezeptapp/{id}` | Rezept bearbeiten |
| DELETE | `/rezeptapp/{id}` | Rezept löschen |
| GET | `/rezeptapp/categories` | Kategorien |
| GET | `/rezeptapp/favorites` | Favoritenliste |
| GET | `/rezeptapp/favorites/ids` | Favoriten-IDs |
| POST | `/rezeptapp/{id}/favorite` | Favorit setzen |
| DELETE | `/rezeptapp/{id}/favorite` | Favorit entfernen |
| GET | `/rezeptapp/{id}/pdf` | Rezept als PDF |

---

### 📅 Essensplan & 📊 Stats

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/rezeptapp/plans/pdf` | Essensplan als PDF exportieren |
| POST | `/rezeptapp/stats` | Nährwert-Statistiken berechnen |

---

## 📁 Projektstruktur
```
src/
├── api/
│   ├── auth.api.ts
│   ├── http.ts
│   ├── plans.api.ts
│   ├── recipes.api.ts
│   ├── stats.api.ts
│   └── __tests__/                # API Tests
├── assets/
│   ├── recipe-fallbacks/
│   ├── base.css
│   ├── main.css
│   └── logo.svg
├── components/
│   ├── AppHeader.vue
│   ├── NutritionChart.vue
│   ├── RecipeCard.vue
│   ├── ToastHost.vue
│   └── __tests__/                # Component Tests
├── router/
│   ├── index.ts
│   └── __tests__/                # Router Guard Tests
├── stores/
│   ├── auth.store.ts
│   ├── recipes.store.ts
│   ├── toast.store.ts
│   └── __tests__/                # Store Tests
├── styles/
│   └── main.css
├── types/
│   └── recipe.ts
├── views/
│   ├── HomeView.vue
│   ├── RecipesView.vue
│   ├── RecipeDetailView.vue
│   ├── CreateRecipeView.vue
│   ├── EditRecipeView.vue
│   ├── FavoritesView.vue
│   ├── MealPlanView.vue
│   ├── StatsView.vue
│   ├── LoginView.vue
│   └── RegisterView.vue
├── App.vue
└── main.ts
```

---

## 🧪 Tests

Das Frontend enthält Unit-Tests für APIs, Stores, Router-Guard und zentrale UI-Komponenten.

### Testklassen (aktueller Stand)

| Bereich | Testdatei | Fokus |
|---------|-----------|-------|
| API | `auth.api.test.ts` | Auth Requests + Token |
| API | `http.test.ts` | Error-Handling + Header |
| API | `recipes.api.test.ts` | CRUD + Favoriten Calls |
| Components | `AppHeader.test.ts` | Login/Logout UI |
| Components | `RecipeCard.test.ts` | Render + Favorite Button |
| Components | `ToastHost.test.ts` | Toast Anzeige/Interaktion |
| Stores | `auth.store.test.ts` | Token/User Flow |
| Stores | `recipes.store.test.ts` | Laden/Filter/Favoriten |
| Stores | `toast.store.test.ts` | Toast push/remove/confirm |
| Router | `router.guard.test.ts` | requiresAuth Redirect |

### Tests ausführen
```bash
npm run test
```

Oder nur Teilbereiche:
```bash
npx vitest run src/api/__tests__
npx vitest run src/components/__tests__
npx vitest run src/stores/__tests__
npx vitest run src/router/__tests__
```

---

## 🔄 CI/CD (GitHub Actions)

**Workflow:** `.github/workflows/frontend.yml`

Bei jedem Push/PR werden automatisch ausgeführt:
- `npm ci`
- `npm run test`
- `npm run build`

---

## 🌐 Deployment (Render.com)

- Deployment erfolgt über **Render.com** (öffentlich erreichbar)
- Auto-Deploy bei Push auf `main`
- Backend-URL kann über `VITE_BACKEND_BASE_URL` konfiguriert werden (optional)

**Live URLs:**
- **Frontend:** https://frontend-rezeptapp-e5m5.onrender.com
- **Backend:** https://backend-rezeptapp-v72u.onrender.com

---

## 📝 Hinweis (Bewertungskriterien)

Dieses Projekt wurde im Rahmen des Moduls **Webtechnologien** an der **HTW Berlin** umgesetzt.
---