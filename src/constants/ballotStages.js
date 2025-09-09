export const BALLOT_STAGES = {
  DRAFT: "draft",
  VOTING: "voting",
  TENDER: "tender",
  FINANCING_CALC: "financing_calc",
  FINANCING: "financing",
  ADDITIONAL_FUNDING: "additional_funding",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export const STAGE_LABELS = {
  [BALLOT_STAGES.DRAFT]: "Черновик",
  [BALLOT_STAGES.VOTING]: "Идёт голосование",
  [BALLOT_STAGES.TENDER]: "Идёт тендер",
  [BALLOT_STAGES.FINANCING_CALC]: "Расчет финансирования",
  [BALLOT_STAGES.FINANCING]: "Финансирование",
  [BALLOT_STAGES.ADDITIONAL_FUNDING]: "Досбор средств",
  [BALLOT_STAGES.IN_PROGRESS]: "На исполнении",
  [BALLOT_STAGES.COMPLETED]: "Выполнено",
};

export const STAGE_ORDER = [
  BALLOT_STAGES.DRAFT,
  BALLOT_STAGES.VOTING,
  BALLOT_STAGES.TENDER,
  BALLOT_STAGES.FINANCING_CALC,
  BALLOT_STAGES.FINANCING,
  BALLOT_STAGES.ADDITIONAL_FUNDING,
  BALLOT_STAGES.IN_PROGRESS,
  BALLOT_STAGES.COMPLETED,
];

export const canMoveToStage = (currentStage, targetStage) => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const targetIndex = STAGE_ORDER.indexOf(targetStage);
  // Позволяет двигаться вперед и на один шаг назад
  return targetIndex >= currentIndex - 1;
};

export const getNextStage = (currentStage) => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  return currentIndex < STAGE_ORDER.length - 1
    ? STAGE_ORDER[currentIndex + 1]
    : null;
};

export const getPreviousStage = (currentStage) => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  return currentIndex > 0 ? STAGE_ORDER[currentIndex - 1] : null;
};
