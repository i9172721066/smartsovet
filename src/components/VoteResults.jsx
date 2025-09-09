import { useState, useEffect } from "react";
import { getTally, getInitiators } from "../lib/store";

export default function VoteResults({ ballotId }) {
  const [results, setResults] = useState(null);
  const [initiators, setInitiators] = useState([]);

  useEffect(() => {
    const tally = getTally(ballotId);
    setResults(tally);
    setInitiators(getInitiators(ballotId));
  }, [ballotId]);

  if (!results) {
    return <div className="p-4">Загрузка результатов...</div>;
  }

  const total = results.total;
  const percentageYes = total ? Math.round((results.yes / total) * 100) : 0;
  const percentageNo = total ? Math.round((results.no / total) * 100) : 0;
  const percentageAbstain = total
    ? Math.round((results.abstain / total) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Результаты голосования</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {results.yes}
            </div>
            <div className="text-sm text-green-600">За ({percentageYes}%)</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{results.no}</div>
            <div className="text-sm text-red-600">Против ({percentageNo}%)</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {results.abstain}
            </div>
            <div className="text-sm text-gray-600">
              Воздержались ({percentageAbstain}%)
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Всего проголосовало: {total}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${percentageYes}%` }}
            />
          </div>
        </div>

        {initiators.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Инициаторы:</h3>
            <div className="space-y-2">
              {initiators.map((initiator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <div className="font-medium">{initiator.name}</div>
                    <div className="text-sm text-gray-500">
                      {initiator.phone}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(initiator.timestamp).toLocaleString("ru-RU")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
