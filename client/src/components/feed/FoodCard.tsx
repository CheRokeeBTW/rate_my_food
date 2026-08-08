import FoodImg from '../../../public/FoodImg.jpeg';
import Image from "next/image";
import SecondFoodImg from '../../../public/Siritho_iPhone_Food-2.jpg'
import Rating from './RatingBar';

type FoodCardProps = {
    title: string;
    imageUrl: string;
};

export default function FoodCard( {
    title,
    imageUrl,
}: FoodCardProps){

    return (
        <div>
            <header className='flex justify-center text-lg font-mono p-0.5'>
                {title}
            </header>
            <div>
                <Image 
                    src={imageUrl}
                    alt="FoodImg"
                    width={500}
                    height={500}
                    className='rounded-xl'
                />
            </div>
        </div>
    )
}