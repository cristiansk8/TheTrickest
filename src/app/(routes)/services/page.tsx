import Avatar from '@/components/avatar'
import CircleImage from '@/components/circle-image'
import SliderServices from '@/components/slider-services'
import TransitionPage from '@/components/transition-page'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Watermelon Code - Servicios de Desarrollo Web Frontend y Branding',
  description: 'Watermelon Code ofrece servicios de desarrollo web frontend especializados en la creación de sitios web y aplicaciones atractivas y funcionales. Además, proporcionamos servicios de branding para desarrollar una identidad de marca sólida y coherente, incluyendo diseño de logotipo, colores y elementos visuales. Contáctanos para obtener más información.',
  keywords: 'Watermelon Code, desarrollo web, frontend, branding, identidad de marca, diseño de logotipo, diseño web, interfaces web, experiencia del usuario, HTML, CSS, JavaScript, presencia en línea',
};

const ServicePage = () => {

  return (
    <>
      <TransitionPage />
      <CircleImage />
      <div className='grid items-center justify-center h-screen max-w-5xl
      gap-6 mx-auto md:grid-cols-2 md:grid-flow-col'>
        <div className='max-w-[450px'>
          <h1 className='text-2xl leading-tight text-center md:text-left md:text-4xl md:mb-5'>Nuestros <span className='font-bold text-watermelon'>Servicios</span> </h1>
          <p className="mb-3 text-xl text-gray-300">Ofrecemos servicios de desarrollo web frontend especializados en la creación de sitios web y aplicaciones atractivas y funcionales. Utilizando las últimas tecnologías, como HTML, CSS y JavaScript, diseño interfaces de usuario intuitivas y responsivas que reflejan la identidad de marca de mis clientes y mejoran su presencia en línea.</p>
          <button className="px-3 py-2 rounded-lg bg-watermelon hover:bg-watermelon/65">Contactanos</button>
        </div>

        {/* SLIDER */}
        <div>
          <SliderServices />
        </div>
      </div>


    </>
  )
}

export default ServicePage