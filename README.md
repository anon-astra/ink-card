# Ink — X post cards

Svelte 5 + Vite. One X text post at a time, almost-black background (#09090b), Inter Bold, and a 1200px-wide PNG download. The preview is the actual export canvas.

## GitHub Pages

1. Create a public repository named `ink-card`, initialized with a README.
2. Add these files to its `main` branch, including `.github/workflows/deploy.yml`.
3. Open Settings → Pages. Set Source to **GitHub Actions**.
4. Run the **Deploy to GitHub Pages** workflow in Actions, or push a change.

GitHub Actions installs packages, builds Svelte, and publishes `dist`. Vite uses relative asset paths, so repository subpaths work.

## Local development

Node.js 22+:

```
npm install
npm run dev
```

## Post loading

Public post links are sent directly to the third-party FxTwitter API. No login, API key, backend, or browser cookies are required. Availability depends on that service and its browser CORS support. Private/deleted/unavailable posts cannot be retrieved. Paste text manually if fetching fails. No credentials or post history are stored.

Review the imported text before exporting. Images, videos, reply threads, engagement statistics, and embedded quoted posts are not included. The editor accepts up to 5,000 characters.

## Validation

JavaScript syntax checked. Full Svelte build, live post loading, PNG download, and optional WebMCP support are not yet verified because dependency downloads were blocked in the authoring environment. The included GitHub Actions workflow will run the production build.
