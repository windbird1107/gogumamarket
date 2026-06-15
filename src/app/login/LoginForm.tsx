"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-bold text-guma-purple-dark">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="goguma@example.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-bold text-guma-purple-dark">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-guma-purple py-3 font-bold text-white transition hover:bg-guma-purple-dark disabled:opacity-60"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>

      <p className="text-center text-sm text-guma-purple-dark/80">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-bold text-guma-purple-dark underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
