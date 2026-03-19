# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expo/React Native mobile app that wraps a web-based Capital platform with native authentication and media capabilities. The app handles JWT-based auth, embeds web content via WebView, and provides camera/video features.

- **Stack**: Expo 54, React Native 0.81, React 19, TypeScript (strict)
- **Routing**: Expo Router with typed routes
- **State**: Zustand (store/session.ts)
- **Package Manager**: yarn
- **React Compiler**: enabled
- **New Architecture**: enabled

## Commands

```bash
# Development
npx expo start                    # Start dev server
npx expo start --clear            # Start with cache cleared
npx expo start --ios              # Start on iOS
npx expo start --android          # Start on Android

# Package management
npx expo install <package>        # Install with compatible version resolution
npx expo install --check          # Check for outdated packages
npx expo install --fix            # Auto-fix package versions

# Quality
npx expo lint                     # ESLint
npx expo doctor                   # Check project health

# CI/CD (EAS Workflows)
npm run draft                     # Preview update + website deploy
npm run development-builds        # Create dev builds (iOS + Android)
npm run preview-build             # iOS preview build
npm run android-preview-build     # Android preview build
npm run testflight                # Build + submit to TestFlight
npm run deploy                    # Full production deploy

# Direct EAS builds
npx eas-cli@latest build --platform ios -s       # Build iOS + submit
npx eas-cli@latest build --platform android -s   # Build Android + submit
```

## Architecture

### App Flow

```
index.tsx → redirects to /login
login.tsx → email input → JWT generation → stores token → navigates to /webview
webview.tsx → renders Capital web app with token in query param, footer tabs switch between Prism/Feed
_layout.tsx → root Stack navigator (headerless, no animations), ThemeProvider
```

### Key Patterns

- **Authentication**: Login generates a demo JWT (unsigned, RS256 header with fake signature) containing email and Cognito-style claims. Token stored in Zustand + AsyncStorage.
- **WebView**: Main content is an embedded web app at `test.capital.glasshouseventure.studio`. Token passed as query parameter. Footer tabs switch between `/api/prism` and `/api/feed` endpoints.
- **Theming**: Light/dark mode via `useColorScheme`. Colors defined in `constants/theme.ts`. Themed components in `components/themed/`.
- **Path alias**: `@/*` maps to project root.

### EAS Build Profiles (eas.json)

- `development` — dev client, internal distribution
- `development-simulator` — iOS simulator
- `preview` — internal distribution, auto-increment version
- `production` — App Store/Play Store, auto-increment version

### EAS Workflows (.eas/workflows/)

- `deploy-to-production.yml` — fingerprint check → conditional build → submit → OTA update
- `upload-to-testflight.yml` — build iOS production → submit to TestFlight
- `create-draft.yml` — triggered on branch push, publishes preview update
- `create-development-builds.yml` — Android + iOS device + iOS simulator builds
- `create-preview-build.yml` / `create-android-preview.yml` — platform-specific previews

## Documentation References

- Expo docs (AI-formatted): https://docs.expo.dev/llms-full.txt
- EAS docs: https://docs.expo.dev/llms-eas.txt
- Expo SDK docs: https://docs.expo.dev/llms-sdk.txt
- EAS Workflows: https://docs.expo.dev/eas/workflows/
- Workflow schema validation: https://exp.host/--/api/v2/workflows/schema

## Troubleshooting

If Expo Go errors occur, create a development build (`npm run development-builds`). Expo Go has limited native module support. New dev builds are also needed after installing packages with native code or adding config plugins.
