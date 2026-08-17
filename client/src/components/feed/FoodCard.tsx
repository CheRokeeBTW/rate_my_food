import FoodImg from '../../../public/FoodImg.jpeg';
import Image from "next/image";
import SecondFoodImg from '../../../public/Siritho_iPhone_Food-2.jpg'
import Rating from './RatingBar';
import { FeedPost } from '@/app/services/posts.service';

type FoodCardProps = {
    post: FeedPost;
};

export default function FoodCard({ post }: FoodCardProps){

    return (
        <div>
            <header className='flex justify-center text-lg font-mono p-0.5'>
                {post.title}
            </header>
            <div>
                <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    preload
                    width={650}
                    height={800}
                    className='rounded-xl'
                />
            </div>
        </div>
    )
}