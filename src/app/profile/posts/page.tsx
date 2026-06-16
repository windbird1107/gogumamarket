import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";

export default async function MyPostsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, price, category, created_at, image_urls")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const postList = posts ?? [];

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/profile" className="text-sm text-guma-purple-dark/60 hover:underline">
          ← 프로필로
        </Link>
        <h1 className="mb-4 mt-2 text-2xl font-bold text-guma-purple-dark">
          내 판매글 {postList.length}
        </h1>

        {postList.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-guma-purple-dark/60">
            아직 등록한 판매글이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {postList.map((post) => (
              <li key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  price={Number(post.price)}
                  category={post.category}
                  createdAt={post.created_at}
                  imageUrls={(post.image_urls as string[]) ?? []}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
