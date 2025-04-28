import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Keep imports for now

// Define interfaces and helper functions (assuming they exist elsewhere or should be defined here)
interface MemoryCard {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface GameProps {
  patientId: string;
  difficulty: number;
  onGameComplete: (score: number, timeTaken: number) => void;
}

// --- Placeholder Helper Functions (Replace with actual implementations if they exist elsewhere) ---
const getCardSymbols = (difficulty: number): string[] => {
    console.log(`[Helper] getCardSymbols called with difficulty: ${difficulty}`);
    const baseSymbols = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍', '🥝', '🥭', '🥥', '🍅'];
    let numPairs;
    switch (difficulty) {
        case 1: numPairs = 6; break; // 12 cards total (4x3 grid ideally, but using 4x4 for now)
        case 2: numPairs = 8; break; // 16 cards total (4x4 grid)
        case 3: numPairs = 10; break; // 20 cards total (needs 5x4 grid)
        default: numPairs = 6;
    }
    const selectedSymbols = baseSymbols.slice(0, numPairs);
    const symbols = [...selectedSymbols, ...selectedSymbols]; // Create pairs
    console.log(`[Helper] getCardSymbols generated ${symbols.length} symbols:`, symbols);
    return symbols;
};

const shuffleArray = <T,>(array: T[]): T[] => {
    console.log('[Helper] shuffleArray called with array length:', array.length);
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    console.log('[Helper] shuffleArray finished.');
    return shuffled;
};
// --- End Placeholder Helper Functions ---


const MemoryMatchGame: React.FC<GameProps> = ({ patientId, difficulty, onGameComplete }) => {
    console.log(`[MemoryMatchGame] Rendering with difficulty: ${difficulty}`);

    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isGameWon, setIsGameWon] = useState(false);

    // Initialize or reset the game board
    const initializeGame = useCallback(() => {
        console.log('[MemoryMatchGame] Initializing game...');
        try {
            console.log(`[MemoryMatchGame] Calling getCardSymbols with difficulty: ${difficulty}`);
            const symbols = getCardSymbols(difficulty);
            console.log('[MemoryMatchGame] Symbols received:', symbols); // Log symbols

            if (!symbols || symbols.length === 0) {
                console.error('[MemoryMatchGame] getCardSymbols returned empty or invalid data.');
                setCards([]); // Ensure cards is empty if symbols are bad
                return;
            }

            console.log('[MemoryMatchGame] Calling shuffleArray...');
            const shuffledSymbols = shuffleArray(symbols);
            console.log('[MemoryMatchGame] Shuffled symbols received:', shuffledSymbols); // Log shuffled symbols

            if (!shuffledSymbols || shuffledSymbols.length === 0) {
                 console.error('[MemoryMatchGame] shuffleArray returned empty or invalid data.');
                 setCards([]);
                 return;
            }

            const initialCards: MemoryCard[] = shuffledSymbols.map((symbol, index) => ({
                id: index,
                value: symbol,
                isFlipped: false,
                isMatched: false,
            }));
            console.log('[MemoryMatchGame] Mapped to initialCards:', initialCards); // Log final card objects

            setCards(initialCards);
            setFlippedIndices([]);
            setMoves(0);
            setStartTime(Date.now());
            setIsGameWon(false);
            console.log('[MemoryMatchGame] Game state updated successfully. Cards:', initialCards.length);
        } catch (error) {
            console.error('[MemoryMatchGame] Error during initialization:', error);
            setCards([]); // Reset cards on error
        }
    }, [difficulty]); // Dependency is just difficulty

    useEffect(() => {
        console.log('[MemoryMatchGame] Initialization effect triggered.');
        initializeGame();
    // IMPORTANT: The dependency array should include things that, when changed, require the effect to re-run.
    // Since initializeGame is memoized with useCallback and depends on difficulty,
    // putting initializeGame here is correct. Alternatively, just [difficulty] would also work
    // if initializeGame was defined directly inside useEffect, but useCallback is generally preferred.
    }, [initializeGame]);

    // Check for matches when two cards are flipped
    useEffect(() => {
        if (flippedIndices.length === 2) {
            console.log('[MemoryMatchGame] Checking for match...');
            const [index1, index2] = flippedIndices;
            // Add checks to prevent accessing undefined cards if state updates are weird
            if (!cards[index1] || !cards[index2]) {
                console.warn('[MemoryMatchGame] Attempted match check with invalid indices:', index1, index2);
                setFlippedIndices([]); // Reset to avoid getting stuck
                return;
            }
            const card1 = cards[index1];
            const card2 = cards[index2];

            if (card1.value === card2.value) {
                console.log('[MemoryMatchGame] Match found!');
                setCards(prevCards =>
                    prevCards.map((card, index) =>
                        index === index1 || index === index2 ? { ...card, isMatched: true, isFlipped: true } : card
                    )
                );
                setFlippedIndices([]);
            } else {
                console.log('[MemoryMatchGame] No match found, flipping back.');
                const timeoutId = setTimeout(() => {
                    setCards(prevCards =>
                        prevCards.map((card, index) =>
                            (index === index1 || index === index2) && !prevCards[index].isMatched // Ensure not already matched
                             ? { ...card, isFlipped: false }
                             : card
                        )
                    );
                    setFlippedIndices([]);
                }, 1000);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [flippedIndices, cards]);

    // Check for game completion
     useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            console.log('[MemoryMatchGame] Game won!');
            setIsGameWon(true);
            const endTime = Date.now();
            const timeTaken = startTime ? Math.round((endTime - startTime) / 1000) : 0;
            const score = Math.max(0, 100 - moves - Math.floor(timeTaken / 5));
            onGameComplete(score, timeTaken);
        }
     }, [cards, moves, startTime, onGameComplete]); // Removed isGameWon from deps

    const handleCardClick = (index: number) => {
        console.log(`[MemoryMatchGame] Card clicked: ${index}`);
        if (!cards[index] || isGameWon || flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
             console.log('[MemoryMatchGame] Card click ignored.');
            return;
        }
        setMoves(prevMoves => prevMoves + 1);
        setCards(prevCards =>
            prevCards.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
        );
        setFlippedIndices(prevIndices => [...prevIndices, index]);
    };

    const gridColsClass = difficulty === 1 ? 'grid-cols-4' : difficulty === 2 ? 'grid-cols-4' : 'grid-cols-4';

    if (!Array.isArray(cards)) {
        console.error('[MemoryMatchGame] Cards state is not an array!', cards);
        return <div className="text-red-500">Error: Card data is invalid.</div>;
    }
    // Add a check for empty cards array after initialization attempt
    if (cards.length === 0 && startTime) { // Check startTime to ensure init was attempted
         console.warn('[MemoryMatchGame] Cards array is empty after initialization attempt.');
         // Optionally render a loading or error state here
    }


    return (
        <div className="memory-match-game">
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium">Moves: {moves}</p>
                {isGameWon && <p className="text-sm font-bold text-green-600">You Won!</p>}
            </div>
            {/* Add min-h-40 (minimum height) to ensure the grid container has space */}
            <div className={`grid ${gridColsClass} gap-2 md:gap-3 min-h-40 border border-dashed border-gray-400 p-1`}>
                {/* TEMPORARY: Render simple divs instead of Cards */}
                {cards.map((card, index) => (
                    <div
                        key={card?.id ?? index}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square flex items-center justify-center cursor-pointer border ${card?.isFlipped ? 'bg-blue-200' : 'bg-gray-200'} ${card?.isMatched ? 'opacity-50' : ''}`}
                        title={`Card ${index}`}
                    >
                        {card?.isFlipped || card?.isMatched ? card.value : `?`}
                    </div>
                ))}
                 {/* Add a message if cards array is empty but rendering */}
                 {cards.length === 0 && (
                    <div className={`col-span-full text-center text-gray-500`}>Loading cards...</div>
                 )}
            </div>
            {isGameWon && (
                <Button onClick={initializeGame} className="mt-4 w-full">Play Again</Button>
            )}
        </div>
    );
};

export default MemoryMatchGame;