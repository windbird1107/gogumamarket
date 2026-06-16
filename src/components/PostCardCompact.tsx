import Link from "next/link";
import Image from "next/image";

type Props = {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  likeCount?: number;
};

// 카테고리별 가로 스크롤 줄에서 쓰는 세로형 컴팩트 카드
export default function PostCardCompact({ id, title, price, imageUrls, likeCount }: Props) {
  const isFree = Number(price) === 0;
  const thumbnail = imageUrls[0];

  return (
    <Link
      href={`/posts/${id}`}
      className="flex w-36 shrink-0 flex-col rounded-2xl bg-white p-2.5 shadow-sm transition hover:shadow-md"
    >
      {thumbnail ? (
        <div className="relative h-32 w-full overflow-hidden rounded-xl">
          <Image src={thumbnail} alt={title} fill className="object-cover" sizes="144px" />
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-guma-purple-light/40 text-4xl">
          🍠
        </div>
      )}

      <h3 className="mt-2 truncate text-sm font-bold text-guma-purple-dark">{title}</h3>
      <div className="mt-0.5 flex items-center justify-between gap-1">
        <p className="text-sm font-bold text-guma-purple-dark">
          {isFree ? "나눔" : `${Number(price).toLocaleString()}원`}
        </p>
        {likeCount != null && likeCount > 0 && (
          <span className="shrink-0 text-xs font-bold text-guma-purple">❤️ {likeCount}</span>
        )}
      </div>
    </Link>
  );
}
