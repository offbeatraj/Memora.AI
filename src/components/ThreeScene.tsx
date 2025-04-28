
import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

export default function ThreeScene() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 rounded-xl overflow-hidden">
      <div className="text-center animate-float">
        <div className="flex justify-center mb-4">
          <div className="bg-memora-purple/30 rounded-full p-6">
            <Brain className="h-20 w-20 text-memora-purple" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-memora-purple-dark">Memora</h3>
        <p className="text-sm text-muted-foreground">Your Memory Assistant</p>
      </div>
    </div>
  );
}
