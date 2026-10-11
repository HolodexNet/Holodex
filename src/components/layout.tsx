import { Suspense, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HomeIcon,
  HeartIcon,
  SearchIcon,
  CalendarIcon,
  UsersIcon,
  BookmarkIcon,
  MultiviewIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  SidebarIcon,
  ArrowUpRightIcon,
  CloseIcon,
  PlayIcon,
  GlobeIcon,
} from "@/components/icons";
import { Avatar, Choice, IconButton, LoadingCards } from "./common";
import { api } from "@/lib/api";
import { channelName, usePreferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Holodex home"
      className="flex items-center gap-2.5"
    >
      <svg
        width="31"
        height="32"
        viewBox="0 0 32 34"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 7 16 0l13 7v19l-13 8-13-8V7Z"
          fill="var(--primary)"
          fillOpacity=".18"
        />
        <path d="m9 10 8 4v11l-8-4V10Z" fill="var(--primary)" />
        <path d="m19 8 8 4v11l-8-4V8Z" fill="var(--primary)" />
        <path
          d="m9 10 10-5 8 4-10 5-8-4Z"
          fill="var(--primary)"
          fillOpacity=".65"
        />
      </svg>
      <span className="text-[23px] font-bold tracking-[-.06em]">
        holodex<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
function Navigation({ close }: { close?: () => void }) {
  const { favorites, prefs, queue } = usePreferences();
  const location = useLocation();
  const upcomingActive =
    location.pathname === "/" &&
    new URLSearchParams(location.search).get("view") === "upcoming";
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    cn("nav-item", isActive && "nav-active");
  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Main navigation" className="space-y-1">
        <NavLink
          end
          to="/"
          className={(state) =>
            itemClass({ isActive: state.isActive && !upcomingActive })
          }
          onClick={close}
        >
          <HomeIcon />
          Home
        </NavLink>
        <NavLink to="/favorites" className={itemClass} onClick={close}>
          <HeartIcon />
          Favorites
          {favorites.length > 0 && (
            <span className="nav-count">{favorites.length}</span>
          )}
        </NavLink>
        <NavLink to="/search" className={itemClass} onClick={close}>
          <SearchIcon />
          Search
        </NavLink>
        <NavLink to="/channels" className={itemClass} onClick={close}>
          <UsersIcon />
          Channels
        </NavLink>
        <div className="my-5 border-t" />
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[.08em] text-muted-foreground">
          YOUR SPACE
        </p>
        <NavLink to="/?view=upcoming" className="nav-item" onClick={close}>
          <CalendarIcon />
          Upcoming
        </NavLink>
        <NavLink to="/library" className={itemClass} onClick={close}>
          <BookmarkIcon />
          Watch later
        </NavLink>
        <NavLink to="/multiview" className={itemClass} onClick={close}>
          <MultiviewIcon />
          Multiview
          {queue.length > 0 && (
            <span className="nav-count">{queue.length}</span>
          )}
        </NavLink>
      </nav>
      {favorites.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold tracking-[.08em] text-muted-foreground">
              FAVORITE CHANNELS
            </p>
            <Link
              to="/channels"
              aria-label="Manage favorite channels"
              className="text-muted-foreground hover:text-primary-ink"
            >
              <SettingsIcon className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-1">
            {favorites.slice(0, 5).map((channel) => (
              <Link
                onClick={close}
                to={`/search?channel=${channel.id}&name=${encodeURIComponent(channelName(channel, prefs.englishNames))}`}
                key={channel.id}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <Avatar channel={channel} className="size-6" />
                <span className="truncate text-xs">
                  {channelName(channel, prefs.englishNames)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-auto pt-8">
        <NavLink to="/settings" className={itemClass} onClick={close}>
          <SettingsIcon />
          Settings
        </NavLink>
        <a
          href="https://github.com/HolodexNet/Holodex"
          target="_blank"
          rel="noreferrer"
          className={cn("nav-item", upcomingActive && "nav-active")}
        >
          <GlobeIcon />
          About Holodex
          <ArrowUpRightIcon className="ml-auto size-3.5!" />
        </a>
        <div className="mt-5 px-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Made for the VTuber community.
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            Discover a little more.
          </p>
        </div>
      </div>
    </div>
  );
}
export function Layout() {
  const { prefs, dark, update, queue, clearQueue, storageError } =
    usePreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const orgs = useQuery({
    queryKey: ["orgs"],
    queryFn: ({ signal }) => api.orgs(signal),
    staleTime: 3_600_000,
  });
  const options = [
    { value: "all", label: "All organizations" },
    ...(
      orgs.data || [
        { name: "Hololive" },
        { name: "Nijisanji" },
        { name: "Independents" },
      ]
    ).map((o) => ({ value: o.name, label: o.name })),
  ];
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.closest("input,textarea,select") ||
            event.target.isContentEditable)
        )
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      "/": "Your VTuber home",
      "/favorites": "Favorites",
      "/search": "Search",
      "/channels": "Channels",
      "/settings": "Settings",
      "/library": "Watch later",
      "/multiview": "Multiview",
    };
    document.title = `${titles[location.pathname] || (location.pathname.startsWith("/watch/") ? "Watch" : "Page not found")} · Holodex`;
  }, [location.pathname]);
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-100 rounded-lg bg-card px-4 py-3 focus:not-sr-only"
      >
        Skip to content
      </a>
      <header className="app-header fixed inset-x-0 top-0 z-30 flex h-[72px] items-center border-b bg-card/95 px-4 backdrop-blur-md lg:px-7">
        <div className="flex w-auto shrink-0 items-center gap-2 lg:w-[211px]">
          <IconButton
            label="Open navigation"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <SidebarIcon />
          </IconButton>
          <Logo />
        </div>
        <form
          className="relative ml-7 hidden max-w-[440px] flex-1 sm:block"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(search.trim())}`);
          }}
        >
          <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search Holodex"
            placeholder="Search streams, clips, and channels"
            className="h-10 rounded-xl border-transparent bg-muted/65 pr-10 pl-10 text-[13px] shadow-none focus-visible:border-primary"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-card px-1.5 py-.5 text-[10px] text-muted-foreground">
            /
          </kbd>
        </form>
        <div className="ml-auto flex items-center gap-1.5 pl-3">
          <div className="mr-4 hidden items-center gap-2 text-xs text-muted-foreground xl:flex">
            <span className="size-1.5 rounded-full bg-primary" />A little closer
            to your favorites
          </div>
          <IconButton
            label="Search"
            className="sm:hidden"
            onClick={() => navigate("/search")}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            className="max-[380px]:hidden"
            label={
              dark ? "Switch to light appearance" : "Switch to dark appearance"
            }
            onClick={() =>
              update({
                appearance: dark ? "light" : "dark",
              })
            }
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton label="Settings" onClick={() => navigate("/settings")}>
            <SettingsIcon />
          </IconButton>
          <span className="mx-2 hidden h-5 border-l sm:block" />
          <Link
            to="/favorites"
            aria-label="Your favorite channels"
            className="ml-1 flex size-9 items-center justify-center rounded-full bg-accent text-primary-ink max-[380px]:hidden"
          >
            <HeartIcon className="size-4.5" />
          </Link>
        </div>
      </header>
      <aside className="fixed bottom-0 left-0 top-[72px] z-20 hidden w-[224px] flex-col border-r bg-sidebar px-4 py-6 lg:flex">
        <div className="mb-6 px-1">
          <Choice
            label="Organization"
            value={prefs.org}
            onChange={(org) => update({ org })}
            options={options}
            className="h-10 w-full rounded-xl border-border bg-background text-xs font-medium"
          />
        </div>
        <Navigation />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[285px]!">
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="mb-5">
              <Choice
                label="Organization"
                value={prefs.org}
                onChange={(org) => update({ org })}
                options={options}
                className="w-full"
              />
            </div>
            <Navigation close={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen pt-[72px] outline-none lg:ml-[224px]"
      >
        <div className="mx-auto max-w-[1800px] px-4 pb-14 pt-7 sm:px-7 lg:px-9 lg:pt-9">
          {storageError && (
            <p role="status" className="mb-4 rounded-lg bg-accent p-3 text-sm">
              Browser storage is unavailable. Changes will last for this visit.
            </p>
          )}
          <Suspense fallback={<LoadingCards />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      {queue.length > 0 && location.pathname !== "/multiview" && (
        <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border bg-popover p-3 shadow-xl lg:ml-[112px]">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary-ink">
            <MultiviewIcon className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold">{queue.length} / 4 streams</p>
            <p className="text-[11px] text-muted-foreground max-[380px]:hidden">
              Your multiview is ready.
            </p>
          </div>
          <Button size="sm" render={<Link to="/multiview" />}>
            <PlayIcon />
            Open
          </Button>
          <IconButton
            label="Clear selected streams"
            size="icon-sm"
            onClick={clearQueue}
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}
