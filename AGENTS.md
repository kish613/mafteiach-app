# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx`, `index.ts`: App entry.
- `src/components/`: Reusable UI (PascalCase, one component per file).
- `src/screens/`, `src/navigation/`: Screens and navigators.
- `src/api/`: API clients; use `src/api/chat-service.ts` to talk to OpenAI/Anthropic/Grok.
- `src/state/`: Zustand stores (persist with `AsyncStorage`). Follow `rootStore.example.ts` patterns.
- `src/utils/`, `src/types/`, `src/theme/`: Helpers, TS types, styling.
- `assets/`: Images and app assets.  `patches/`: dependency patches (do not remove).
- Tailwind/NativeWind via `tailwind.config.js` and `global.css`.

## Build, Test, and Development Commands
- Install: `bun install` (preferred) or `npm install`.
- Start (Expo): `bun run start` or `npm run start`.
  - Platform targets: `android`, `ios`, `web` (e.g., `npm run ios`).
- Lint: `npx eslint .` (or `bunx eslint .`). Fix warnings before PRs.
- EAS builds: `npx eas build -p ios|android` (requires EAS login; see `eas.json`).

## Coding Style & Naming Conventions
- TypeScript, functional components, React Hooks. 2‑space indentation.
- Components: `PascalCase` (`AppLogo.tsx`), functions/vars: `camelCase`, stores: `*Store.ts`.
- Prefer `className` with NativeWind; inline styles only for dynamic cases.
- Keep modules focused; colocate small helpers in `src/utils/`.

## Testing Guidelines
- No framework set up yet. If adding tests, use Jest + `@testing-library/react-native`.
- Name tests `*.test.ts`/`*.test.tsx`; colocate next to source or in `__tests__/`.
- Favor unit tests for `utils` and store logic; smoke tests for screens.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- PRs must include: concise description, linked issue, screenshots for UI, and simple test/QA steps.
- Keep diffs small and focused; update docs when behavior changes.

## Security & Configuration Tips
- Set API keys via env: `EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY`, `EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY`, `EXPO_PUBLIC_VIBECODE_GROK_API_KEY` (optionally `EXPO_PUBLIC_OPENAI_API_KEY`).
- Never commit secrets or `.env`. For CI, use `eas secret`.
- Use `src/api/chat-service.ts` abstractions; avoid calling provider SDKs directly in UI.

## Agent-Specific Notes
- Follow this structure when editing files. Avoid wide refactors.
- Prefer minimal patches; do not modify `patches/` or build identifiers without discussion.
