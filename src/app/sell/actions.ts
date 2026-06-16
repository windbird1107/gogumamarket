"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SellFormState = { error: string } | undefined;

export async function createPost(
  _prevState: SellFormState,
  formData: FormData
): Promise<SellFormState> {
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

  const imageFiles = formData.getAll("images") as File[];
  const image_urls: string[] = [];

  for (const file of imageFiles) {
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
    image_urls.push(urlData.publicUrl);
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    description,
    price,
    category,
    image_urls,
  });

  if (error) return { error: "등록에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/");
  redirect("/?posted=1");
}
