import Link from "next/link";
import SweetPotatoMascot from "@/components/SweetPotatoMascot";
import { createClient } from "@/lib/supabase/server";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; posted?: string }>;
}) {
  const { confirmed, posted } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, price, category, status, created_at, profiles(nickname)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      {confirmed && (
        <p className="mb-6 rounded-full bg-guma-leaf/20 px-4 py-2 text-sm font-bold text-guma-purple-dark">
          🎉 이메일 인증이 완료됐어요! 로그인해보세요.
        </p>
      )}

      {posted && (
        <p className="mb-6 rounded-full bg-guma-leaf/20 px-4 py-2 text-sm font-bold text-guma-purple-dark">
          🍠 판매글이 등록됐어요!
        </p>
      )}

      <SweetPotatoMascot size={100} mood="happy" />

      <h1 className="mt-4 text-3xl font-bold text-guma-purple-dark">고구마마켓</h1>
      <p className="mt-2 max-w-xs text-center text-guma-purple-dark/70">
        우리 동네 따뜻한 중고거래, 고구마마켓에서 시작해요 🍠
      </p>

      {!user && (
        <div className="mt-6 flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-guma-purple px-6 py-3 font-bold text-white transition hover:bg-guma-purple-dark"
          >
            회원가입
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-guma-purple px-6 py-3 font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
          >
            로그인
          </Link>
        </div>
      )}

      {user && (
        <p className="mt-6 rounded-full bg-guma-yellow/30 px-4 py-2 text-sm font-bold text-guma-purple-dark">
          오늘도 좋은 거래 되세요! 🍠
        </p>
      )}

      <div className="mt-10 w-full max-w-md">
        <h2 className="mb-3 text-left text-lg font-bold text-guma-purple-dark">
          최근 등록된 판매글
        </h2>

        {!posts || posts.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-guma-purple-dark/60">
            아직 등록된 판매글이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((post) => {
              const isFree = Number(post.price) === 0;
              const seller = post.profiles as unknown as { nickname: string } | null;
              return (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-guma-purple-light px-2 py-0.5 text-xs font-bold text-guma-purple-dark">
                        {post.category}
                      </span>
                      <span className="text-xs text-guma-purple-dark/50">
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-bold text-guma-purple-dark">
                      {post.title}
                    </h3>
                    <p className="mt-1 font-bold text-guma-purple-dark">
                      {isFree ? "나눔" : `${Number(post.price).toLocaleString()}원`}
                    </p>
                    <p className="mt-1 text-xs text-guma-purple-dark/60">
                      {seller?.nickname ?? "알 수 없음"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
