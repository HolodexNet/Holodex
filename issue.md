
# Holodex Next (React) vs Vue v2 Disparity and TODOs

This issue outlines the functional disparities, missing features, and bugs between the Vue (v2/dev branch) implementation of Holodex and the new React (packages/react) implementation.

## 1. Missing Routes & Pages
Based on the routing differences, the following pages and features are currently missing in the React implementation:

- **Library (`/library`)**: The user library page for saved videos and playlists is not yet implemented.
- **Relay Bot Settings (`/relaybot`)**: Settings for configuring relay bots.
- **TL Script Manager (`/scriptmanager`)**: The manager interface for Translation scripts is missing (though the editor exists).
- **Extension Page (`/extension`)**: The info/install page for the browser extension.
- **Add Channel (`/addChannel`)**: The form/page to request adding a new channel to Holodex.
- **Home (`/home`)**: While `/org/:org` exists, the explicit `/home` route map and logic may need alignment for backwards compatibility or redirects.
- **404 Page (`/404`)**: Needs a dedicated 404 route matching the Vue implementation (though `*` catch-all exists, explicit `/404` might be needed for programmatic redirects).

## 2. Component Disparities & Missing Features

### Multiview
- **Sync Bar Notifications**: Toast notifications in `SyncToolbar.tsx` are not implemented (`// TODO: Toast notification`).
- **Aspect Presets**: Initial values for user-customized presets per aspect class are missing in `multiview.ts` (`// TODO: The initial value should come from multiview-utils.ts`).

### Video & Player
- **Styling Missing**: Some text colors in `VideoMenu.css` are missing and need to be ported (`/* TODO: there was some text colors here */`).

### TLDex (Live Translations)
- **Styling**: Inner glow styling in `Subtitle.vue` reference component needs to be implemented in Tailwind (`/*TODO an inner glow from the left hand side edge... */`).
- **Chat Download**: The UI copy and logic for downloading all active chat in `es-MX/ui.yml` points to a missing/incomplete feature (`unloadChatTitle: '¿Descargar TODO el chat activo?'`).

### Favorites & Home
- **Tab Flags**: Hardcoded or questionable flags in `favoritesHome.tsx` need addressing (`// TODO: probably use a different flag than "Oshis", but idk between Members or What`).

### User Services
- **Error Handling**: Explicit error handling in `user.service.ts` needs definition (`// TODO: define onError`).

## 3. General Cleanup and Architecture Improvements

- **Navigation**: Uncomment the navigator in `useFrame.ts` upon release (`/** TODO: at release uncomment this navigator */`).
- **Event Bus Typing**: Improve typing for `handleOnce` in `eventbus.ts` (`// TODO: find out a better way to type handleOnce`).

## 4. Overall V2 -> V3 Migration Checklist (from README)
The following major sections still need to be fully verified for feature parity against V2:

- [ ] HomePage
- [ ] Favorites Page
- [ ] Search
- [ ] Profile
- [ ] Settings (Blocked List and Orgs components are commented out in the router)
- [ ] About
- [ ] TLDex
- [ ] Editing Components
- [ ] Migrate components to our own Shadcn-Radix variant (Kitchensink Page)
