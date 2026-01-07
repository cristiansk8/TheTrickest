import HowWin from '@/components/howToWin';
import Introduction from '@/components/introduction';
import Partners from '@/components/partners/partners';
import SkatersShowcase from '@/components/SkatersShowcase';
import TransitionPage from '@/components/transition-page';
import HomeLevelSection from '@/components/HomeLevelSection';
import HomeMapSection from '@/components/HomeMapSection';

export default function Home() {
  return (
    <main>
      <div className="flex">
        <TransitionPage />
        <Introduction />
      </div>

      {/* Challenges Section */}
      <HomeLevelSection />

      {/* <div className='pt-28 text-center'>
        <h1 className='text-slate-200 my-16 text-2xl md:text-4xl font-bold'>High Scores</h1>
        <HighScore />
      </div> */}
      <div className="pt-28 text-center" data-section="how-to-win">
        <div className="flex flex-col h-full py-5 md:pt-28 text-center bg-[#2e2257]">
          <h1 className="text-slate-200 my-16 text-2xl md:text-4xl font-bold">
            Sigue los pasos
          </h1>
          <HowWin />
        </div>
      </div>

      {/* Skaters Showcase Section */}
      <div className="pt-28 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-slate-200 uppercase tracking-wider mb-4">
            🛹 CONOCE LA COMUNIDAD
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Descubre skaters talentosos, sigue sus progresos y conecta con la
            comunidad Trickest
          </p>
        </div>

        <SkatersShowcase />
      </div>

      {/* Map Section */}
      <HomeMapSection />

      {/* Partners Section */}
      <div>
        <Partners />
      </div>

      {/* <div>
        <Footer />
      </div> */}
    </main>
  );
}
