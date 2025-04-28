import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Spline from '@splinetool/react-spline'; // Import Spline

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12 lg:p-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* ... existing header code ... */}
      </div>

      {/* Add the Spline component here */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] my-8 md:my-12"> {/* Adjust height as needed */}
        <Spline scene="https://prod.spline.design/y2TEYKFA6gPM2qpv/scene.splinecode" />
      </div>
      {/* End Spline component */}


      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        {/* ... existing logo/title code ... */}
         <div className="text-center">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-800">
             Welcome to Memora.AI
           </h1>
           <p className="text-lg md:text-xl text-gray-600 mb-8">
             Your AI-powered companion for Alzheimer's care and memory support.
           </p>
           <Link href="/chat">
             <Button size="lg" className="bg-memora-purple hover:bg-memora-purple-dark text-white">
               Start Chatting <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </Link>
         </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8 mt-16"> {/* Added gap and margin */}
        {/* ... existing feature cards ... */}
         <a
           href="#" // Update link later
           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 block" // Added block display
           // target="_blank" // Uncomment if linking externally
           // rel="noopener noreferrer" // Uncomment if linking externally
         >
           <h2 className={`mb-3 text-2xl font-semibold`}>
             Personalized Chat{' '}
             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
               -&gt;
             </span>
           </h2>
           <p className={`m-0 max-w-[30ch] text-sm opacity-70`}> {/* Increased opacity */}
             Engage with an AI assistant tailored to individual needs and memory stages.
           </p>
         </a>

         <a
           href="#" // Update link later
           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 block" // Added block display
           // target="_blank" // Uncomment if linking externally
           // rel="noopener noreferrer" // Uncomment if linking externally
         >
           <h2 className={`mb-3 text-2xl font-semibold`}>
             Caregiver Support{' '}
             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
               -&gt;
             </span>
           </h2>
           <p className={`m-0 max-w-[30ch] text-sm opacity-70`}> {/* Increased opacity */}
             Access insights and tools designed to assist caregivers in providing better support.
           </p>
         </a>

         <a
           href="#" // Update link later
           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 block" // Added block display
           // target="_blank" // Uncomment if linking externally
           // rel="noopener noreferrer" // Uncomment if linking externally
         >
           <h2 className={`mb-3 text-2xl font-semibold`}>
             Memory Aids{' '}
             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
               -&gt;
             </span>
           </h2>
           <p className={`m-0 max-w-[30ch] text-sm opacity-70`}> {/* Increased opacity */}
             Utilize features like reminders, photo association, and daily orientation prompts.
           </p>
         </a>
      </div>
    </main>
  );
}