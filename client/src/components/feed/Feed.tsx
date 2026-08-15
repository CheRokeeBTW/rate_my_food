"use client"

import FoodCard from "./FoodCard"
import FoodImg from '../../../public/FoodImg.jpeg';
import SecondFoodImg from '../../../public/Siritho_iPhone_Food-2.jpg'
import Rating from "./RatingBar";
import { useRouter } from "next/navigation";

type FeedProps = {
    onRequireAuth: () => void;
};

export function Feed({ onRequireAuth } : FeedProps){
    const router = useRouter();

    const handleRate = (value: number) => {
        console.log('Selected:', value);
    };

    return(
        <div>
            <FoodCard title = "Title Holder" imageUrl = {FoodImg.src} />
            <Rating onRate={handleRate} onRequireAuth={onRequireAuth}/>
        </div>
    )
}