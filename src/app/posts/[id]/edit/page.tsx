import { redirect, notFound } from "next/navigation";
import SweetPotatoMascot from "@/components/SweetPotatoMascot";
import { createClient } from "@/lib/supabase/server";
import EditForm from "./EditForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, description, price, category, user_id, image_urls")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  if (post.user_id !== user.id) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <SweetPotatoMascot size={80} mood="happy" />
          <h1 className="text-2xl font-bold text-guma-purple-dark">판매글 수정</h1>
        </div>
        <EditForm
          postId={post.id}
          defaultTitle={post.title}
          defaultCategory={post.category}
          defaultPrice={Number(post.price)}
          defaultDescription={post.description}
          defaultImageUrls={(post.image_urls as string[]) ?? []}
        />
      </div>
    </div>
  );
}
