import FoodImg from '../../../public/FoodImg.jpeg';
import Image from "next/image";
import SecondFoodImg from '../../../public/Siritho_iPhone_Food-2.jpg'
import Rating from './RatingBar';
import { FeedPost } from '@/app/services/posts.service';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

type FoodCardProps = {
    post: FeedPost;
    onSwipeLeft: () => void
};

export default function FoodCard({ post, onSwipeLeft }: FoodCardProps){
const x = useMotionValue(0);

const rotate = useTransform(
    x,
    [-400, 0],
    [-20, 0]
);

return (
    <motion.div
        className="cursor-grab active:cursor-grabbing"
        style={{
            x,
            rotate,
            touchAction: "pan-y",
        }}
        drag="x"
        dragConstraints={{
            left: -1000,
            right: 0,
        }}
        dragElastic={0}
        onDragEnd={(_, info) => {
            if (info.offset.x < -120) {
                animate(x, -1000, {
                    duration: 0.3,
                    ease: "easeOut",
                    onComplete: () => {
                        onSwipeLeft();
                    },
                });
            } else {
                animate(x, 0, {
                    duration: 0.2,
                    ease: "easeOut",
                });
            }
        }}
    >
            <header className='flex justify-center text-lg font-mono p-1.5'>
                {post.title}
            </header>
            <div>
                <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    preload
                    width={650}
                    height={800}
                    draggable={false}
                    className='rounded-xl'
                />
            </div>
        </motion.div>
    )
}