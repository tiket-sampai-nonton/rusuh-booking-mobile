# Rusuh Booking Tiket

Rusuh Booking Tiket is an Expo app for discovering events and booking tickets on web, Android, and iOS. Guests can browse an event, join its queue, enter checkout details, pay through the payment page, and view their e-tickets without signing in.

The app uses TypeScript, Expo Router, React Native, NativeWind, TanStack Query, and Zustand. Its code lives in `apps/client/src`: `presentation` contains screens and components, `application` contains use cases, `domain` contains rules and ports, and `infrastructure` connects those ports to external services. See [architecture](.genesis/docs/ARCHITECTURE.md).

## Run locally

Install Node.js and npm, then install the client dependencies:

```sh
cd apps/client
npm install
cp .env.example .env
```

Edit `.env` for your environment. `EXPO_PUBLIC_API_BASE_URL` points to the separate backend API, `EXPO_PUBLIC_USE_MOCKS` selects mock or real adapters, and `EXPO_PUBLIC_ENV` selects the environment. The template also documents EAS project and channel settings. Public Expo variables are included in the app, so never put secrets in them.

```sh
npm run web      # web development server
npm run start    # Expo development server
npm run android  # build and run Android locally
npm run ios      # build and run iOS locally
```

Native builds require the relevant Android or iOS development tools and a simulator or device. For configuration details, see [the environment template](apps/client/.env.example) and [pipeline documentation](.genesis/docs/PIPELINE.md).

From `apps/client`, run `npm run typecheck`, `npm run lint`, or `npm test -- <test-path>` for focused checks.
