import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemoryMatchGame from './games/MemoryMatchGame'; // Relative path
import ErrorBoundary from '@/components/ErrorBoundary'; // Import ErrorBoundary using alias (adjust if needed)

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  stage: string;
  gender: string;
}

// Define the structure for game props
interface GameProps {
  patientId: string;
  difficulty: number;
  onGameComplete: (score: number, timeTaken: number) => void;
}

// Define the structure for the game itself
interface GameDefinition {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<GameProps>;
}

interface PuzzleGamesProps {
  patient: Patient;
}

// Placeholder function for RL-based difficulty adjustment
// --- Refactor Placeholder Components ---
const PlaceholderGameComponent: React.FC<GameProps & { gameTitle: string }> = ({ difficulty, gameTitle }) => (
    <div className="p-4 border rounded bg-gray-100">
        {gameTitle} Placeholder (Difficulty: {difficulty})
        <p className="text-xs text-gray-500">Implementation pending...</p>
    </div>
);

const SudokuGamePlaceholder: React.FC<GameProps> = (props) => <PlaceholderGameComponent {...props} gameTitle="Sudoku Game" />;
const CrosswordGamePlaceholder: React.FC<GameProps> = (props) => <PlaceholderGameComponent {...props} gameTitle="Crossword Game" />;
const JigsawPuzzleGamePlaceholder: React.FC<GameProps> = (props) => <PlaceholderGameComponent {...props} gameTitle="Jigsaw Puzzle Game" />;
// --- End Refactor ---


const getInitialDifficulty = (patientStage: string): number => {
  switch (patientStage) {
    case 'early': return 1;
    case 'moderate': return 2;
    case 'advanced': return 3; // Maybe start easier for advanced
    default: return 1;
  }
};

const determineGamesForPatient = (patient: Patient): GameDefinition[] => {
  // Use the actual MemoryMatchGame component and refactored placeholders
  if (patient.stage === 'early' || patient.stage === 'moderate') {
    return [
      { id: "memory", title: "Memory Match", description: "Improve memory by matching pairs.", component: MemoryMatchGame },
      { id: "sudoku", title: "Sudoku", description: "Challenge logic with number puzzles.", component: SudokuGamePlaceholder } // <-- Using placeholder
    ];
  } else { // Assuming 'advanced' stage based on previous logic
    return [
       { id: "memory_simple", title: "Simple Memory Match", description: "Match pairs of simple items.", component: MemoryMatchGame },
       { id: "jigsaw", title: "Simple Jigsaw", description: "Piece together simple pictures.", component: JigsawPuzzleGamePlaceholder }, // <-- Using placeholder
    ];
  }
};

const PuzzleGames: React.FC<PuzzleGamesProps> = ({ patient }) => {
  const [difficultyLevels, setDifficultyLevels] = useState<Record<string, number>>({});

  // Recalculate games when patient changes
  const games = determineGamesForPatient(patient);
  console.log(`[PuzzleGames] Determined games for patient ${patient.name} (stage: ${patient.stage}):`, games.map(g => g.id)); // <-- Add this log

  // Effect to reset difficulties when patient changes or games list changes
  useEffect(() => {
      const initialLevels: Record<string, number> = {};
      games.forEach(game => {
          initialLevels[game.id] = Math.max(1, getInitialDifficulty(patient.stage));
      });
      setDifficultyLevels(initialLevels);
  // Recalculate when patient or the list of determined games changes
  }, [patient.id, games]); // Use patient.id for stability if patient object changes frequently


  const handleGameComplete = (gameId: string, score: number, timeTaken: number) => {
    console.log(`Game ${gameId} completed! Score: ${score}, Time: ${timeTaken}s`);
    const currentDifficulty = difficultyLevels[gameId];
    // Ensure currentDifficulty is a number before calculations
    if (typeof currentDifficulty !== 'number') {
        console.error(`Invalid difficulty level for game ${gameId}:`, currentDifficulty);
        return;
    }

    let nextDifficulty = currentDifficulty;

    // Example RL Logic: Adjust difficulty based on performance
    if (score >= 75 && timeTaken < (currentDifficulty * 45)) {
        nextDifficulty = Math.min(currentDifficulty + 1, 3);
    } else if (score < 40 || timeTaken > (currentDifficulty * 90)) {
        nextDifficulty = Math.max(currentDifficulty - 1, 1);
    }

    if (nextDifficulty !== currentDifficulty) {
        setDifficultyLevels(prevLevels => ({
            ...prevLevels,
            [gameId]: nextDifficulty
        }));
        console.log(`Adjusted difficulty for ${gameId} from ${currentDifficulty} to ${nextDifficulty}`);
    }
    // toast({ title: "Game Complete!", description: `Your score: ${score}. Difficulty adjusted.` });
  };

  return (
    <Card className="glass-card mt-6">
        <CardHeader>
            <CardTitle className="text-xl font-bold">Mental Puzzle Games for {patient.name}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => {
                    const GameComponent = game.component;
                    const currentDifficulty = difficultyLevels[game.id] || 1; // Default to 1 if undefined
                    return (
                        // --- Wrap GameComponent in ErrorBoundary ---
                        <ErrorBoundary key={game.id} fallback={<div className="p-4 border border-red-500 rounded bg-red-100 text-red-700">Error loading {game.title}.</div>}>
                            <div className="game-card p-4 bg-white/70 rounded-lg border shadow-sm h-full flex flex-col"> {/* Added h-full and flex */}
                                <h3 className="font-medium text-lg mb-2">{game.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                                <div className="flex-grow"> {/* Allow game to take available space */}
                                    <GameComponent
                                        patientId={patient.id}
                                        difficulty={currentDifficulty}
                                        onGameComplete={(score, time) => handleGameComplete(game.id, score, time)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Current Difficulty: {currentDifficulty}</p>
                            </div>
                        </ErrorBoundary>
                        // --- End Wrap ---
                    );
                })}
            </div>
             {games.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No suitable games found for the current patient stage.</p>
            )}
        </CardContent>
    </Card>
  );
};

export default PuzzleGames;