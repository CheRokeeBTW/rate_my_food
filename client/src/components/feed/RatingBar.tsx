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
    const stars = Array.from({ length: 10 }, (_, index) => index + 1);

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
        <div>
            <div 
                className="flex gap-2 justify-center mt-5 hover:cursor-pointer"
                onMouseLeave={() => setHover(null)}
            >
                {stars.map(star => (
                    <button
                        key = {star}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => setHover(star)}
                        className={`hover:cursor-pointer ${hovered !== null
                        ? star <= hovered
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-yellow-400"
                        : "text-yellow-400"
                    }`}
                    >
                        <Star
                            className="transition-transform duration-150 hover:scale-110"
                            size={32} fill={star <= (hovered ?? selected ?? 0) ? "currentColor" : "none"} 
                        />
                    </button>
                ))}
            </div>
                <div className="flex justify-center mt-5 font-sans">
                    Rate this photo
                </div>
        </div>
    )
}