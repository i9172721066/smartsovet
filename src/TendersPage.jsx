import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listBallots } from "../lib/store";
import { BALLOT_STAGES } from "../constants/ballotStages";
import BallotStageIndicator from "../components/BallotStageIndicator";

export default function TendersPage() {
  const [ballots, setBallots] = useState([]);

  useEffect(() => {
    const allBallots = listBallots();
    const tenderBallots = allBallots.filter(
      (b) => b.status === BALLOT_STAGES.TENDER,
    );
    setBallots(tenderBallots);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Активные тендеры</h1>

      <div className="space-y-4">
        {ballots.map((ballot) => (
          <Link
            key={ballot.id}
            to={`/ballot/${ballot.id}`}
            className="block p-4 rounded-lg border hover:border-indigo-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium">{ballot.title}</h2>
                <p className="text-gray-600 mt-1">{ballot.description}</p>
              </div>
              <BallotStageIndicator stage={ballot.status} />
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Участники: {ballot.participants}
            </div>
          </Link>
        ))}

        {ballots.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет активных тендеров
          </div>
        )}
      </div>
    </div>
  );
}
