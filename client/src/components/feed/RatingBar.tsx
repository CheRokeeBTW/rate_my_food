"use client"

import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useTokenStore } from "@/stores/auth.stores";

type RatingProps = {
    postId: string;
    onRate: (value: number) => void;
    onRequireAuth: () => void;
};

export default function Rating({ postId, onRate, onRequireAuth } : RatingProps) {
    const [hovered, setHover] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const token = useTokenStore(state => state.accessToken);

    useEffect(() => {
        setSelected(null)
    }, [postId]); 

    const handleClick = (value: number) => {
        if(!token){
            onRequireAuth();
            return;
        }

        onRate(value);
        setSelected(value);
    };

    return(
        <>
            <div 
                className="mt-4 grid grid-cols-10 gap-1.5 hover:cursor-pointer"
                onMouseLeave={() => setHover(null)}
            >
                {Array.from({ length: 10 }, (_, index) => index + 1).map((number: number) => (
                  <button
                    key={number}
                    onClick={() => handleClick(number)}
                    aria-label={`${number} out of 10`}
                    onMouseEnter={() => setHover(number)}
                    className={`aspect-square rounded-lg text-[11px] font-bold transition sm:rounded-xl hover:cursor-pointer ${
                      hovered !== null && number <= hovered
                        ? "bg-[#ff6542] text-white shadow-[0_5px_16px_rgba(255,101,66,.22)]"
                        : "bg-white/[0.07] text-white/45 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
        </>
    )
}