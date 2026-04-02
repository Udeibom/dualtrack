export default function WeeklySummary({
  summary,
  latestMessage,
}: {
  summary: string;
  latestMessage: any;
}) {
  if (!summary && !latestMessage) return null;

  return (
    <>
      {latestMessage && (
        <div className="card mb-8">
          <p className="card-title">💌 Today’s Note</p>
          <p className="text-[13px] text-gray-300 leading-relaxed">
            {latestMessage.text}
          </p>
        </div>
      )}

      {summary && (
        <div className="card mb-8">
          <p className="card-title">This week</p>
          <p className="text-[13px] leading-relaxed text-gray-300 whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}
    </>
  );
}