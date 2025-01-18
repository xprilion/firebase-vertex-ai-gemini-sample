import React, { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { geminiApi } from "../config/firebase";

function App() {
  const [name, setName] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [character, setCharacter] = useState("");
  const [horoscope, setHoroscope] = useState("");
  const [loading, setLoading] = useState(false);

  const generateHoroscope = async () => {
    if (!name || !character || !zodiacSign) return;

    setLoading(true);
    try {
      const prompt = `Generate a creative and magical daily horoscope for a ${zodiacSign} named ${name} who loves the Harry Potter character ${character}. 
      Include specific references to Harry Potter lore and ${character}'s traits, while incorporating ${zodiacSign} characteristics.
      Make it personal, positive, and inspiring. Keep it under 50 words.`;

      const result = await geminiApi(prompt);
      setHoroscope(result);
    } catch (error) {
      console.error("Error generating horoscope:", error);
      setHoroscope("Failed to generate horoscope. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2070')] bg-cover bg-center">
      <div className="min-h-screen bg-black/50 flex items-center justify-center px-4">
        <div className="px-8">
          <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Wand2 className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-purple-600">
                Hogwarts Horoscope
              </h1>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="zodiacSign"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Zodiac Sign
                </label>
                <select
                  id="zodiacSign"
                  value={zodiacSign}
                  onChange={(e) => setZodiacSign(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select your zodiac sign</option>
                  <option value="Aries">Aries</option>
                  <option value="Taurus">Taurus</option>
                  <option value="Gemini">Gemini</option>
                  <option value="Cancer">Cancer</option>
                  <option value="Leo">Leo</option>
                  <option value="Virgo">Virgo</option>
                  <option value="Libra">Libra</option>
                  <option value="Scorpio">Scorpio</option>
                  <option value="Sagittarius">Sagittarius</option>
                  <option value="Capricorn">Capricorn</option>
                  <option value="Aquarius">Aquarius</option>
                  <option value="Pisces">Pisces</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="character"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Favorite Harry Potter Character
                </label>
                <input
                  type="text"
                  id="character"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Hermione Granger"
                />
              </div>

              <button
                onClick={generateHoroscope}
                disabled={loading || !name || !character || !zodiacSign}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Horoscope
                  </>
                )}
              </button>

              {horoscope && (
                <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-100">
                  <h2 className="text-xl font-semibold text-purple-800 mb-4">
                    Your Magical Horoscope
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {horoscope}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-8 text-white">
            Built with ❤️ by Anubhav.{" "}
            <a
              href="https://github.com/xprilion/firebase-vertex-ai-gemini-sample"
              className="text-blue-500"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
