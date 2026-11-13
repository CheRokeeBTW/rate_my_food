
"use client";

import Image from "next/image";
import { UserAvatarProps } from "@/app/helper/types";

export default function UserAvatar({
  username,
  avatarUrl,
  size = 44,
  className = "",
}: UserAvatarProps) {
  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
   <div
    className={`relative shrink-0 overflow-hidden rounded-full bg-[#c79775] text-white ${className}`}
    style={{ width: size, height: size }}
  >
    {avatarUrl ? (
      <Image
        src={avatarUrl}
        alt={`${username}'s avatar`}
        fill
        sizes={typeof size === "number" ? `${size}px` : "100vw"}
        className="object-cover"
      />
    ) : (
      <span className="flex h-full w-full items-center justify-center font-bold">
        {initial}
      </span>
    )}
  </div>
  );
}
