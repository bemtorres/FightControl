export const Intro = ({ scenario }: { scenario: any }) => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="relative group">
      {/* Glow behind logo */}
      <div className="absolute -inset-10 bg-white/20 blur-[100px] rounded-full animate-pulse-slow" />

      {scenario?.tournament_logo ? (
        <img src={scenario.tournament_logo} className="h-72 object-contain relative z-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
      ) : (
        <h1 className="text-8xl font-black text-white italic tracking-tighter relative z-10 drop-shadow-2xl">
          {scenario?.name || 'FIGHTERS'}
        </h1>
      )}
    </div>

    <div className="mt-20 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold text-white tracking-[0.5em] animate-pulse">PRESS START</h2>
      <div className="h-px w-48 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  </div>
);
