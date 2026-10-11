import {
  Component,
  lazy,
  Suspense,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesProvider } from "@/lib/preferences";
import { ApiError } from "@/lib/api";
import { Layout } from "@/components/layout";
import { HomePage } from "@/pages/home";
import { LoadingCards } from "@/components/common";

const SearchPage = lazy(() =>
  import("@/pages/search").then((m) => ({ default: m.SearchPage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings").then((m) => ({ default: m.SettingsPage })),
);
const ChannelsPage = lazy(() =>
  import("@/pages/collection").then((m) => ({ default: m.ChannelsPage })),
);
const LibraryPage = lazy(() =>
  import("@/pages/collection").then((m) => ({ default: m.LibraryPage })),
);
const MultiviewPage = lazy(() =>
  import("@/pages/collection").then((m) => ({ default: m.MultiviewPage })),
);
const WatchPage = lazy(() =>
  import("@/pages/collection").then((m) => ({ default: m.WatchPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/collection").then((m) => ({ default: m.NotFoundPage })),
);

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        !(error instanceof ApiError && error.status < 500) && count < 1,
      refetchOnWindowFocus: true,
    },
  },
});
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "Holodex could not render this page",
      error,
      info.componentStack,
    );
  }
  render() {
    return this.state.failed ? (
      <div className="mx-auto mt-20 max-w-md rounded-2xl border bg-card p-8">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="my-4 text-sm text-muted-foreground">
          Refresh Holodex to try again. Your saved preferences will stay here.
        </p>
        <button
          onClick={() => location.reload()}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Refresh Holodex
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <PreferencesProvider>
          <TooltipProvider delay={350}>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="m-8 pt-20">
                    <LoadingCards />
                  </div>
                }
              >
                <Routes>
                  <Route element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route
                      path="favorites"
                      element={<HomePage favoritesOnly />}
                    />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="channels" element={<ChannelsPage />} />
                    <Route path="library" element={<LibraryPage />} />
                    <Route path="multiview" element={<MultiviewPage />} />
                    <Route path="watch/:id" element={<WatchPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
