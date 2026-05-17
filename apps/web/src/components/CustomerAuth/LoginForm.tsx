"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/customer-auth/login", {
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      setState("error");
      setMessage(body.message || "Could not log in.");
      return;
    }

    setState("success");
    setMessage("Logged in successfully.");
    window.location.assign(redirectTo);
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-primary text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--accent-strong)]"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label
          className="text-primary text-sm font-semibold"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--accent-strong)]"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      <button
        className="rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light disabled:cursor-wait disabled:opacity-70"
        disabled={state === "submitting"}
        type="submit"
      >
        {state === "submitting" ? "Logging in..." : "Login"}
      </button>
      {message ? (
        <p
          className={state === "error" ? "text-sm text-red-600" : "text-secondary text-sm"}
          data-test-id="auth-message"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
