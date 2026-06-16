import Image from "next/image";

type Props = {
  src?: string | null;
  nickname?: string | null;
  size?: number;
  className?: string;
};

// 프로필 사진. 사진이 없으면 닉네임 첫 글자로 된 동그란 기본 아바타를 보여줘요.
export default function Avatar({ src, nickname, size = 40, className = "" }: Props) {
  const fallbackChar = nickname?.trim()?.[0] ?? "🍠";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-guma-purple-light text-guma-purple-dark ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {src ? (
        <Image
          src={src}
          alt={nickname ? `${nickname}님의 프로필 사진` : "프로필 사진"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <span className="font-bold">{fallbackChar}</span>
      )}
    </span>
  );
}
