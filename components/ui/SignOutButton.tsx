"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
