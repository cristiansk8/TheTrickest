"use client"
import Image from "next/image";
import Appbar from "./Appbar";
import Link from "next/link";
import MotionTransition from "./transition-component";


const Header = () => {
    return (
        <MotionTransition position="bottom" className="absolute z-40 inline-block w-full top-5 md:top-10">
            <header className="flex gap-4 p-4 bg-gradient-to-b shadow">
                <Appbar />
            </header>
        </MotionTransition>
    );
}

export default Header;