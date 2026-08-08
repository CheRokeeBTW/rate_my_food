"use client";

import { useRouter } from "next/navigation";

export default function AuthModal({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
      "
      onClick={() => router.back()}
    >
      <div
        className="rounded-xl bg-zinc-900 p-8 w-[400px] h-[350px]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}