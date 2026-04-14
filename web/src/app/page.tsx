"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function Home() {
  const { token } = useAuth();
  const router = useRouter();
  useEffect(() => {
    router.replace(token ? "/cars" : "/login");
  }, [token, router]);
  return null;
}
