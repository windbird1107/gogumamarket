"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error: string } | undefined;

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const nickname = (formData.get("nickname") as string)?.trim();

  if (!email || !password || !nickname) {
    return { error: "모든 항목을 입력해주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상으로 입력해주세요." };
  }
  if (nickname.length < 2 || nickname.length > 12) {
    return { error: "닉네임은 2~12자로 입력해주세요." };
  }

  const supabase = await createClient();

  const { data: existingNickname } = await supabase
    .from("profiles")
    .select("id")
    .eq("nickname", nickname)
    .maybeSingle();

  if (existingNickname) {
    return { error: "이미 사용 중인 닉네임이에요." };
  }

  const origin = (await headers()).get("origin");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "이미 가입된 이메일이에요." };
    }
    return { error: error.message };
  }

  redirect("/signup/check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
