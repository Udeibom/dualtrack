export const buildDailySeries = (logs: any[]) => {
  const map: any = {};

  logs.forEach((log) => {
    const d = log.date;

    if (!map[d]) {
      map[d] = { date: d, growth: 0, waste: 0, neutral: 0 };
    }

    const category = log.tasks?.category || "neutral";
    map[d][category] += log.duration;
  });

  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];

    result.push(
      map[key] || { date: key, growth: 0, waste: 0, neutral: 0 }
    );
  }

  return result;
};

export const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};