import SweetPotatoMascot from "@/components/SweetPotatoMascot";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <SweetPotatoMascot size={88} mood="happy" />
          <h1 className="text-2xl font-bold text-guma-purple-dark">로그인</h1>
          <p className="text-sm text-guma-purple-dark/70">고구마마켓에 다시 오신 걸 환영해요</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
