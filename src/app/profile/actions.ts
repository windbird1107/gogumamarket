"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error: string } | { ok: true } | undefined;

function extractStoragePath(publicUrl: string): string | null {
  const marker = "/storage/v1/object/public/avatars/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function updateAvatar(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "사진을 선택해주세요." };
  }

  // 기존 아바타 경로 (교체 후 삭제용)
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: `사진 업로드에 실패했어요: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: "프로필 저장에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  // 이전 사진은 스토리지에서 정리
  const oldUrl = profile?.avatar_url as string | null;
  if (oldUrl) {
    const oldPath = extractStoragePath(oldUrl);
    if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
  return { ok: true };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const oldUrl = profile?.avatar_url as string | null;

  await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);

  if (oldUrl) {
    const oldPath = extractStoragePath(oldUrl);
    if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
}
