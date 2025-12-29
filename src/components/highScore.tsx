import React from 'react'
import { IoIosShareAlt } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import {highScore} from "../../data";
import {Button} from "@nextui-org/react";



const HighScore = () => {
    return (
        <div className="flex w-full flex-wrap content-center justify-center px-7">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {
                    highScore.map((tricket, index) => {
                        return (
                            <div className="max-w-xsborder    " key={index}>
                                <img className="h-52 w-full object-cover" src={`${tricket.imgURl}`} />
                                <div className='p-1 text-left'>
                                <h3>{tricket.name}</h3>
                                <ul className="mt-3 flex flex-wrap">
                                    <li className="mr-auto">
                                        <a href="#" className="flex text-gray-400 hover:text-gray-600">
                                            <IoIosShareAlt />
                                            {tricket.share}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="flex text-gray-400 hover:text-gray-600">
                                            <FaHeart />
                                            {tricket.likes}
                                        </a>
                                    </li>
                                </ul>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div>
                <Button>Ver todos</Button>
            </div>
        </div>
    )
}

export default HighScore