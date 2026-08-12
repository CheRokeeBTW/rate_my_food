"use client"

import { useState } from 'react';
import uploadImage from '../../../public/upload-image-icon.svg';
import signInImage from '../../../public/sign-in-3303.svg';
import policyImage from '../../../public/terms-and-conditions-icon.svg';
import Image from 'next/image';
import UploadModal from '../upload/UploadModal';

type NavBarProps = {
    onLoginClick: () => void
}

export default function NavBar({ onLoginClick } : NavBarProps){
    const [uploadOpen, setUploadOpen] = useState(false);


    return(
        <div className="flex sticky top-0 justify-center bg-black h-10 min-w-50 min-h-13 rounded-l-full items-center gap-5 py-8">
            <div 
            onClick={() => setUploadOpen(true)}
            className='flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'
            >
            <Image src = {uploadImage} alt="uploadImage" width={24} height={24} />
            <p className='text-xs'>Upload</p>
            </div>
            <div 
            onClick={() => onLoginClick()}
            className='flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'
            >
            <Image src = {signInImage} alt="signInImage" width={24} height={24} />
            <p className='text-xs' >Log in</p>
            </div>
            <div className='flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'>
            <Image src = {policyImage} alt="policyImage" width={16} height={16} />
            <p className='text-xs'>ToS</p>
            </div>
            {uploadOpen && (
                <UploadModal
                onClose={() => setUploadOpen(false)}
                />
            )}
        </div>
    )
}