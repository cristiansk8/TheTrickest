import Avatar from '@/components/avatar'
import ContainerPage from '@/components/container'
import Team from '@/components/team'
import TechForge from '@/components/tech-forge'
import TransitionPage from '@/components/transition-page'
import { Metadata } from 'next'
import React from 'react'



export const metadata: Metadata = {
  title: 'Watermelon Code - Desarrollo y Diseño Web en Bogotá',
  description: 'Nuestra misión es impulsar la innovación y la transformación digital a través de soluciones tecnológicas de vanguardia. Nos comprometemos a colaborar estrechamente con nuestros clientes para comprender sus necesidades específicas y ofrecerles productos y servicios de alta calidad que impulsen su éxito en un mundo cada vez más digitalizado. Nos esforzamos por ser reconocidos como líderes en el campo del desarrollo tecnológico, destacando por nuestra excelencia en la creación de soluciones innovadoras y personalizadas. Aspiramos a ser el socio de confianza de nuestros clientes, superando constantemente sus expectativas y contribuyendo al crecimiento y la expansión de sus negocios en el panorama digital.',
  keywords: 'Watermelon Code, desarrollo web, diseño web, Bogotá, innovación, transformación digital, soluciones tecnológicas, vanguardia, excelencia, personalizado, confianza, éxito digital, líderes, colaboración, necesidades específicas, clientes, servicio completo, profesionalismo, satisfacción del cliente, crecimiento empresarial, expansión empresarial, Colombia',
};


const PageAboutMe = () => {
  return (
    <>
      <TransitionPage/>
      <ContainerPage>
        <TechForge/>       
        {/* <Avatar/> */}
        <Team/>
      </ContainerPage>
      
    </>
  )
}

export default PageAboutMe