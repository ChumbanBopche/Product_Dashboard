"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  return {
    isAuthenticated,
    logout,
  };
}