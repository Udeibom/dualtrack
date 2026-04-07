"use client";

export default function LogsModal({
  title,
  logs,
  onClose,
}: {
  title: string;
  logs: any[];
  onClose: () => void;
}) {
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const groupLogsByDate = (logs: any[]) => {
    const grouped: Record<string, any[]> = {};
    logs.forEach((log) => {
      if (!grouped[log.date]) grouped[log.date] = [];
      grouped[log.date].push(log);
    });
    return grouped;
  };

  const calculateDayTotal = (logs: any[]) => {
    return logs.reduce((sum, log) => sum + log.duration, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/60  text-gray-900 flex justify-center items-start pt-10 z-50">
      <div className="bg-white text-gray-900 w-full max-w-lg rounded-xl p-5 max-h-[80vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-900">No logs yet</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupLogsByDate(logs)).map(
              ([date, dayLogs]) => (
                <div key={date}>
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-gray-900">{date}</p>
                    <p className="text-sm text-gray-900">
                      {formatDuration(
                        calculateDayTotal(dayLogs)
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dayLogs.map((log) => (
                      <div
                        key={log.id}
                        className="border rounded-lg p-2 flex justify-between"
                      >
                        <p>{log.tasks?.name}</p>
                        <p>{formatDuration(log.duration)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}