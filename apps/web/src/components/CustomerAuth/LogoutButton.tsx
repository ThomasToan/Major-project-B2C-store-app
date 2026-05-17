"use client";

import { useState } from "react";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch("/api/customer-auth/logout", {
      method: "POST",
    });
    window.location.assign("/");
  }

  return (
    <button
      className="rounded-md border border-[color:var(--border-color)] px-4 py-2 text-sm font-semibold text-primary disabled:cursor-wait disabled:opacity-70"
      data-test-id="logout-button"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? "Logging out..." : "Logout"}
    </button>
  );
}
