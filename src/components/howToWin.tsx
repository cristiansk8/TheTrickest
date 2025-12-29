import React from 'react'
import { howToWin } from "../../data";
import localFont from 'next/font/local';
import {Button} from "@nextui-org/react";

const myFont = localFont({
    src: './fonts/blox.woff',
    display: 'auto'
});

const HowWin = () => {
    return ( 
        <div>
            <div className="flex w-full flex-wrap content-center justify-center px-7">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {  
                        howToWin.map((tricket, index) => {
                            return (
                                <div className="max-w-xsborder    " key={index}>
                                    <img className="h-52 w-full object-contain" src={`${tricket.imagen}`} />
                                    <div className='p-1 text-left'>
                                        <h3 className={`mx-auto mb-2 text-xl
                text-center md:text-6xl md:mx-0 md:mb-8 tracking-wide ${myFont.className}`}>{tricket.titulo}</h3>
                                        <p>{tricket.caption}</p>
                                    </div>
                                </div> 
                            )
                        })
                    }
                </div>
                <div className='flex justify-center items-center'>
                    <Button color="primary" variant="light">Participar</Button>
                </div>
            </div>
        </div>

    )
}

export default HowWin