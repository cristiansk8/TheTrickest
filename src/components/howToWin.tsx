'use client';

import React from 'react'
import localFont from 'next/font/local';
import {Button} from "@nextui-org/react";
import { useTranslations } from 'next-intl';

const myFont = localFont({
    src: './fonts/blox.woff',
    display: 'auto'
});

const HowWin = () => {
    const t = useTranslations('howToWin');

    const steps = [
        { key: 'step1', image: t('step1Image') },
        { key: 'step2', image: t('step2Image') },
        { key: 'step3', image: t('step3Image') },
    ];

    return (
        <div>
            <div className="flex w-full flex-wrap content-center justify-center px-7">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <div className="max-w-xsborder" key={index}>
                            <img className="h-52 w-full object-contain" src={step.image} alt={t(`${step.key}Title`)} />
                            <div className='p-1 text-left'>
                                <h3 className={`mx-auto mb-2 text-xl text-center md:text-6xl md:mx-0 md:mb-8 tracking-wide ${myFont.className}`}>
                                    {t(`${step.key}Title`)}
                                </h3>
                                <p>{t(`${step.key}Caption`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='flex justify-center items-center'>
                    <Button color="primary" variant="light">{t('participate')}</Button>
                </div>
            </div>
        </div>
    )
}

export default HowWin