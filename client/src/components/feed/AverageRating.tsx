import { Star } from "lucide-react";

type AverageRatingProps = {
    rating: number | null;
};

export default function AverageRating({ rating }: AverageRatingProps) {
    const stars = Array.from({ length: 10 }, (_, index) => index + 1);

    if(!rating){
        return (
            <div>
                This post has no rating yet
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
                {stars.map((star) => {
                    const fillPercentage = Math.min(
                        Math.max(rating - (star - 1), 0),
                        1
                    ) * 100;

                    return (
                        <div key={star} className="relative">
                            <Star
                                size={24}
                                className="text-yellow-400"
                                fill="none"
                            />

                            <div
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    size={24}
                                    className="text-yellow-400"
                                    fill="currentColor"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center">
                <span className="text-2xl font-black tracking-tight">
                    {rating.toFixed(1)}
                </span>
            </div>
        </div>
    );
}