export function generateInsights({
  tasks,
  matchedTasks,
  logs,
}: {
  tasks: any[];
  matchedTasks: any[];
  logs: any[];
}) {
  const insights: string[] = [];

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const matched = matchedTasks.filter((t) => t.matched).length;

  const plannerScore = total ? completed / total : 0;
  const realityScore = total ? matched / total : 0;

  // 1. Overplanning detection
  if (plannerScore > realityScore + 0.3) {
    insights.push(
      "You are consistently overestimating what you can complete. Try planning fewer, higher-quality tasks."
    );
  }

  // 2. Underplanning detection
  if (logs.length > tasks.length) {
    insights.push(
      "You are doing more than you plan. Consider capturing your real capacity to improve planning accuracy."
    );
  }

  // 3. Low execution
  if (realityScore < 0.5) {
    insights.push(
      "Less than 50% of your planned tasks are actually happening. Focus on execution, not intention."
    );
  }

  // 4. Strong alignment
  if (realityScore > 0.8) {
    insights.push(
      "Strong execution alignment. Your planning is realistic and effective."
    );
  }

  return insights;
}