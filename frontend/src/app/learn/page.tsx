'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AlphabetGrid from '@/components/AlphabetGrid';
import LetterDisplay from '@/components/LetterDisplay';
import LetterNavigation from '@/components/LetterNavigation';
import { useProgress } from '@/hooks/useProgress';
import { ALPHABET_MAP, getNextLetter, getPrevLetter } from '@/lib/alphabet';

export default function LearnPage() {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [showSelector, setShowSelector] = useState(false);
  const { progress, completedCount } = useProgress();
  const router = useRouter();

  const letterData = ALPHABET_MAP.get(selectedLetter)!;
  const letterProgress = progress?.letters[selectedLetter];

  const handlePractice = useCallback(() => {
    router.push(`/practice?letter=${selectedLetter}`);
  }, [router, selectedLetter]);

  const handleNext = useCallback(() => {
    setSelectedLetter(getNextLetter(selectedLetter).letter);
  }, [selectedLetter]);

  const handlePrev = useCallback(() => {
    setSelectedLetter(getPrevLetter(selectedLetter).letter);
  }, [selectedLetter]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header completedCount={completedCount} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Aprender</h1>
          <p className="text-text-secondary">
            Selecciona una letra para ver cómo se forma la seña.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm text-text-secondary uppercase tracking-wide">
                  Abecedario
                </h2>
                <button
                  onClick={() => setShowSelector(!showSelector)}
                  className="lg:hidden btn-ghost text-xs"
                >
                  {showSelector ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className={`${showSelector ? 'block' : 'hidden'} lg:block`}>
                <AlphabetGrid
                  selectedLetter={selectedLetter}
                  onSelectLetter={(l) => {
                    setSelectedLetter(l);
                    setShowSelector(false);
                  }}
                  progress={progress}
                />
              </div>
              <div className="lg:hidden block">
                {!showSelector && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','Ñ','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSelectedLetter(l)}
                        className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                          selectedLetter === l
                            ? 'bg-accent text-white'
                            : progress?.letters[l]?.completed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-100 text-text-secondary hover:bg-stone-200'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <LetterDisplay
              letter={letterData}
              letterProgress={letterProgress}
              onPractice={handlePractice}
            />

            <div className="mt-4 card p-4">
              <LetterNavigation
                currentLetter={selectedLetter}
                onPrev={handlePrev}
                onNext={handleNext}
                onOpenSelector={() => setShowSelector(true)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
