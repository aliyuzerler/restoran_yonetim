"use client";

import { useEffect, useState, useCallback } from "react";

export type Route =
  | { name: "landing" }
  | { name: "login" }
  | { name: "register" }
  | { name: "onboarding" }
  | { name: "dashboard"; tab?: string }
  | { name: "public-restaurant"; slug: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash || hash === "/") return { name: "landing" };
  const parts = hash.split("/").filter(Boolean); // ["login"] or ["r","slug"] or ["dashboard"] or ["dashboard","menu"]
  if (parts.length === 0) return { name: "landing" };
  if (parts[0] === "login") return { name: "login" };
  if (parts[0] === "register") return { name: "register" };
  if (parts[0] === "onboarding") return { name: "onboarding" };
  if (parts[0] === "dashboard") {
    return { name: "dashboard", tab: parts[1] };
  }
  if (parts[0] === "r" && parts[1]) {
    return { name: "public-restaurant", slug: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === "restaurant" && parts[1]) {
    return { name: "public-restaurant", slug: decodeURIComponent(parts[1]) };
  }
  return { name: "landing" };
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined" ? parseHash() : { name: "landing" }
  );
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function useNavigate() {
  return useCallback((path: string) => {
    window.location.hash = path;
  }, []);
}

export function buildPath(route: Route): string {
  switch (route.name) {
    case "landing":
      return "/";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "onboarding":
      return "/onboarding";
    case "dashboard":
      return route.tab ? `/dashboard/${route.tab}` : "/dashboard";
    case "public-restaurant":
      return `/r/${route.slug}`;
  }
}
