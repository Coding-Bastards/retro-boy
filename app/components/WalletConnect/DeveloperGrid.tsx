import { initializeEruda } from "@/components/ErudaProdiver"

export default function DeveloperGrid() {
  return (
    <div className="border text-sm font-black flex gap-3 items-center -mt-2 border-white/10 rounded-lg p-2">
      <div className="pl-1">DEV</div>
      <button
        onClick={initializeEruda}
        className="bg-white text-black h-5 flex items-center px-2 rounded"
      >
        DEBUG
      </button>
    </div>
  )
}
