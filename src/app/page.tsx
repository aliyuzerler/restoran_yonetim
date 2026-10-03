"use client";

import { useEffect } from "react";
import { useRoute } from "@/lib/router";
import { useAuthStore } from "@/stores/auth-store";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { LandingPage } from "@/components/landing/landing-page";
import { LoginPage } from "@/components/auth/login-page";
import { RegisterPage } from "@/components/auth/register-page";
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";
import { ResetPasswordPage } from "@/components/auth/reset-password-page";
import { OnboardingPage } from "@/components/auth/onboarding-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PublicRestaurantPage } from "@/components/public/public-restaurant-page";
import { AppLoader } from "@/components/providers/app-loader";

export default function Home() {
  const route = useRoute();
  const { init, initialized, user } = useAuthStore();
  const { load, restaurants, current } = useRestaurantStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user, load]);

  // Public route is always accessible
  if (route.name === "public-restaurant") {
    return <PublicRestaurantPage slug={route.slug} />;
  }

  // Show loader while auth initializes
  if (!initialized) {
    return <AppLoader />;
  }

  // Auth pages: redirect to dashboard if already logged in
  if (route.name === "login" || route.name === "register") {
    if (user) {
      if (restaurants.length === 0) return <OnboardingPage />;
      return <DashboardShell />;
    }
    return route.name === "login" ? <LoginPage /> : <RegisterPage />;
  }

  // Forgot password: redirect to dashboard if already logged in
  if (route.name === "forgot-password") {
    if (user) {
      if (restaurants.length === 0) return <OnboardingPage />;
      return <DashboardShell />;
    }
    return <ForgotPasswordPage />;
  }

  // Reset password: accessible regardless of auth (token-based)
  if (route.name === "reset-password") {
    return <ResetPasswordPage token={route.token} />;
  }

  // Onboarding: requires auth
  if (route.name === "onboarding") {
    if (!user) return <LoginPage />;
    return <OnboardingPage />;
  }

  // Dashboard: requires auth + at least one restaurant
  if (route.name === "dashboard") {
    if (!user) return <LoginPage />;
    if (restaurants.length === 0) return <OnboardingPage />;
    if (!current) return <AppLoader />;
    return <DashboardShell />;
  }

  // Landing: if logged in with restaurants, go to dashboard
  if (route.name === "landing") {
    if (user && restaurants.length > 0) {
      return <DashboardShell />;
    }
    if (user && restaurants.length === 0) {
      return <OnboardingPage />;
    }
    return <LandingPage />;
  }

  return <LandingPage />;
}
