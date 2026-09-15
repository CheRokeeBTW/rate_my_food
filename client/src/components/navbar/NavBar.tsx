"use client"

import { useState } from 'react';
import uploadImage from '../../../public/upload-image-icon.svg';
import signInImage from '../../../public/sign-in-3303.svg';
import policyImage from '../../../public/terms-and-conditions-icon.svg';
import profileImg from '../../../public/profile-svgrepo-com.svg';
import Image from 'next/image';
import UploadModal from '../upload/UploadModal';
import { useTokenStore } from '@/stores/auth.stores';
import { useRouter } from 'next/navigation';

type NavBarProps = {
    onRequireAuth: () => void;
}

export default function NavBar({ onRequireAuth } : NavBarProps){
    const [uploadOpen, setUploadOpen] = useState<boolean>(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const router = useRouter();
    const accessToken = useTokenStore(state => state.accessToken);

    const checkLogin = () => {
        if(!accessToken){
            onRequireAuth();
            return;
        };

        setUploadOpen(true);
    };

    return(
        <div className="flex z-50 sticky w-fit justify-start h-10 items-center gap-7 py-8 px-5 hover:bg-zinc-900/80 transition rounded-br-xl">
            <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="hover: cursor-pointer flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg"
                aria-label="Open menu"
            >
                <span className="h-0.5 w-6 rounded bg-white" />
                <span className="h-0.5 w-6 rounded bg-white" />
                <span className="h-0.5 w-6 rounded bg-white" />
            </button>
            {menuOpen && (
                <div className='flex gap-7 py-8'>
                    <div
                        onClick={() => checkLogin()}
                        className='flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'
                    >
                        <Image src = {uploadImage} alt="uploadImage" width={24} height={24} />
                        <p className='text-xs'>Upload</p>
                    </div>
                    {!accessToken ? (
                        <div 
                            onClick={() => onRequireAuth()}
                            className='flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'
                        >
                            <Image src = {signInImage} alt="signInImage" width={24} height={24} />
                            <p className='text-xs' >Log in</p>
                        </div>
                    ) : (
                        <div 
                            onClick={() => router.push('/profile')}
                            className='flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'
                        >
                            <Image src = {profileImg} alt="signInImage" width={24} height={24}  className='scale-125'/>
                            <p className='text-xs' >Profile</p>
                        </div>
                    )}
                    <div className='flex flex-col items-center justify-center gap-1 transition-transform duration-200 hover:scale-110 hover:cursor-pointer'>
                        <Image src = {policyImage} alt="policyImage" width={18} height={18}/>
                        <p className='text-xs'>ToS</p>
                    </div>
                </div>
            )}
            {uploadOpen && (
                <UploadModal
                    onClose={() => setUploadOpen(false)}
                />
            )}
        </div>
    )
}