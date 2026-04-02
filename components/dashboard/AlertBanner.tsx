export default function AlertBanner({
  myLogs,
  partnerLogs,
  partnerProfile,
}: {
  myLogs: any[];
  partnerLogs: any[];
  partnerProfile: any;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const myTodayTotal = myLogs
    .filter((l) => l.date === todayStr)
    .reduce((s, l) => s + l.duration, 0);

  const partnerTodayTotal = partnerLogs
    .filter((l) => l.date === todayStr)
    .reduce((s, l) => s + l.duration, 0);

  const hasLoggedToday = myTodayTotal > 0;
  const partnerHasLoggedToday = partnerTodayTotal > 0;

  if (hasLoggedToday) return null;

  return (
    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-red-400">
          {!partnerHasLoggedToday
            ? "You both haven’t logged today"
            : `${partnerProfile?.name || "Your partner"} already logged today`}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {!partnerHasLoggedToday
            ? "One of you should break the silence."
            : "Catch up before the day ends."}
        </p>
      </div>

      <a
        href="/logs/new"
        className="text-xs px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      >
        Log now
      </a>
    </div>
  );
}