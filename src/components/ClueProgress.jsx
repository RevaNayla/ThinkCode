export default function ClueProgress({
  usedClues,
  totalClues,
  onClick
}) {
  return (
    <div className="p-3 bg-white rounded-xl shadow-md">
      <div className="flex justify-between text-sm mb-2">
        <span>Clue</span>
        <span>{usedClues}/{totalClues}</span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all"
          style={{ width: `${(usedClues / totalClues) * 100}%` }}
        />
      </div>

      <button
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
        disabled={usedClues >= totalClues}
        onClick={onClick}
      >
        Ambil Clue
      </button>
    </div>
  );
}
