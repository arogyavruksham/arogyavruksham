import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 md:bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-[#E23F33]" />
      <p className="mt-4 text-gray-500 font-sans">Loading product...</p>
    </div>
  );
}
