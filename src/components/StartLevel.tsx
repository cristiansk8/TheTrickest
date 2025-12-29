const StartLevel = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/pixel-art-background.png')" }}
    >
      <div className="text-center">
        <h1
          className="text-7xl text-white font-bold"
          style={{ fontFamily: 'monospace' }}
        >
          START LEVEL
        </h1>
        <button
          className="mt-8 px-8 py-4 bg-blue-600 text-white text-2xl font-bold border-4 border-blue-400 rounded-lg hover:bg-blue-700 transition-colors"
          style={{ fontFamily: 'monospace' }}
        >
          START LEVEL
        </button>
      </div>
    </div>
  );
};

export default StartLevel;
