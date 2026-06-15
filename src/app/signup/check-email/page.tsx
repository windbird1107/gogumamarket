import Link from "next/link";
import SweetPotatoMascot from "@/components/SweetPotatoMascot";

export default function CheckEmailPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-col items-center gap-3">
          <SweetPotatoMascot size={96} mood="sleepy" />
          <h1 className="text-2xl font-bold text-guma-purple-dark">이메일을 확인해주세요</h1>
          <p className="text-sm leading-relaxed text-guma-purple-dark/70">
            가입하신 이메일로 인증 링크를 보냈어요.
            <br />
            메일함에서 링크를 눌러 가입을 완료해주세요.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 inline-block rounded-xl bg-guma-purple px-6 py-3 font-bold text-white transition hover:bg-guma-purple-dark"
        >
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
