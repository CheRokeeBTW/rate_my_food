import { useState, useEffect } from "react";
import { getUserProfile } from "@/app/services/user.service";
import Image from "next/image";
import { Post } from "../helper/types";
import AverageRating from "@/components/feed/AverageRating";
import editImg from '../../../public/modify-icon.svg';

export default function updateUsername(){
    const [username, setUsername] = useState<string>("");

    return(
        <div>
            
        </div>
    )
}