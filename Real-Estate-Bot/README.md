
# 🏠 Real Estate Bot

A smart assistant for real estate discovery powered by Gemini AI and Google Maps.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Real-Estate-Bot.git
cd Real-Estate-Bot
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

- Create a `.env` file from the example template:

```bash
cp .env.example .env
```

- Fill in the required keys in `.env`:

| Key                | Description                          |
|--------------------|--------------------------------------|
| `GEMINI_API_KEY`   | Your Gemini AI API Key               |
| `GOOGLE_MAPS_KEY`  | Your Google Maps API Key (for distance calculation) |

---

## 💻 Running the Project

### Start the API server (for distance calculation)

```bash
pnpm run dev:api
```

> **Note:** This is only required if you're using the distance tool.

### Start the Frontend/Full App

```bash
pnpm run dev
```

---

## 📌 Notes

- The default setup uses **Gemini** for AI responses.
- Google Maps is used to calculate distances between locations.
- If you don’t need distance calculations, you can skip running `pnpm run dev:api`.

---
