import React from "react";
import { STAGE_LABELS } from "../constants/ballotStages";

export default function BallotStageIndicator({ stage }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      voting: "bg-blue-100 text-blue-800",
      tender: "bg-yellow-100 text-yellow-800",
      financing_calc: "bg-orange-100 text-orange-800",
      financing: "bg-purple-100 text-purple-800",
      additional_funding: "bg-red-100 text-red-800",
      in_progress: "bg-green-100 text-green-800",
      completed: "bg-teal-100 text-teal-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(stage)}`}
    >
      <div className="flex items-center">
        <span className="w-2 h-2 mr-2 rounded-full bg-current opacity-75"></span>
        <span>{STAGE_LABELS[stage] || stage}</span>
      </div>
    </div>
  );
}
