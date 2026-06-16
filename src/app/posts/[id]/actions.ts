"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EditFormState = { error: string } | undefined;

function extractStoragePath(publicUrl: string): string | null {
  const marker = "/storage/v1/object/public/post-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export async function updatePost(
  postId: number,
  _prevState: EditFormState,
  formData: FormData
): Promise<EditFormState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category = formData.get("category") as string;
  const isFree = formData.get("isFree") === "on";
  const priceRaw = formData.get("price") as string;

  if (!title || title.length < 2) return { error: "제목을 2자 이상 입력해주세요." };
  if (!description || description.length < 5) return { error: "설명을 5자 이상 입력해주세요." };

  let price = 0;
  if (!isFree) {
    price = Number(priceRaw);
    if (!priceRaw || Number.isNaN(price) || price < 0) return { error: "가격을 올바르게 입력해주세요." };
  }

  // 기존에 유지할 이미지 URL 목록
  const keepUrls = formData.getAll("keepImageUrl") as string[];

  // 삭제할 이미지 (원본 목록에서 keepUrls에 없는 것)
  const { data: currentPost } = await supabase
    .from("posts")
    .select("image_urls")
    .eq("id", postId)
    .eq("user_id", user.id)
    .single();

  const currentUrls: string[] = (currentPost?.image_urls as string[]) ?? [];
  const toDelete = currentUrls.filter((url) => !keepUrls.includes(url));

  if (toDelete.length > 0) {
    const paths = toDelete.map(extractStoragePath).filter(Boolean) as string[];
    if (paths.length > 0) {
      await supabase.storage.from("post-images").remove(paths);
    }
  }

  // 새 이미지 업로드
  const newFiles = formData.getAll("newImages") as File[];
  const newUrls: string[] = [];

  for (const file of newFiles) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      return { error: `사진 업로드에 실패했어요: ${uploadError.message}` };
    }
    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
    newUrls.push(urlData.publicUrl);
  }

  const image_urls = [...keepUrls, ...newUrls];

  const { error } = await supabase
    .from("posts")
    .update({ title, description, price, category, image_urls })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) return { error: "수정에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) redirect("/login");

  const postId = formData.get("id") as string;

  // 삭제 전에 이미지 파일도 스토리지에서 제거
  const { data: post } = await supabase
    .from("posts")
    .select("image_urls")
    .eq("id", postId)
    .eq("user_id", user.id)
    .single();

  const imageUrls: string[] = (post?.image_urls as string[]) ?? [];
  if (imageUrls.length > 0) {
    const paths = imageUrls.map(extractStoragePath).filter(Boolean) as string[];
    if (paths.length > 0) {
      await supabase.storage.from("post-images").remove(paths);
    }
  }

  await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id);

  revalidatePath("/");
  redirect("/");
}
