import { useState } from 'react'

export default function AddFive() {
  const [number, setNumber] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const handleAdd = () => {
    const num = parseFloat(number)
    if (isNaN(num)) return
    const res = num + 5
    setResult(res)
    setHistory((prev) => [{ input: num, output: res }, ...prev.slice(0, 4)])
    setNumber('')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Add Five</h1>
        <p className="text-neutral-500 text-sm mt-1">Enter any number to add 5 to it</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-md">
        <label className="text-xs text-neutral-500 block mb-1">Enter Number</label>
        <div className="flex gap-3">
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. 10"
            className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-purple-400"
          />
          <button
            onClick={handleAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            + 5
          </button>
        </div>

        {result !== null && (
          <div className="mt-5 bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-xs text-purple-400 mb-1">Result</p>
            <p className="text-3xl font-bold text-purple-600">{result}</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-6 max-w-md">
          <h2 className="text-sm font-semibold text-black mb-3">Recent Calculations</h2>
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 last:border-0"
              >
                <span className="text-neutral-500 text-sm">{h.input} + 5</span>
                <span className="text-purple-600 font-semibold text-sm">= {h.output}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}