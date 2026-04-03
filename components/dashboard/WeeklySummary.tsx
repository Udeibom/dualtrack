export default function WeeklySummary({
  summary,
  partnerSummary,
  partnerProfile,
  latestMessage,
}: {
  summary: string;
  partnerSummary: string;
  partnerProfile: any;
  latestMessage: any;
}) {
  if (!summary && !partnerSummary && !latestMessage) return null;

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

      {(summary || partnerSummary) && (
        <div className="card mb-8">
          <p className="card-title">This week</p>

          {summary && (
            <div className="mb-4">
              <p className="text-[12px] text-gray-400 mb-1">You</p>
              <p className="text-[13px] leading-relaxed text-gray-300 whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}

          {partnerSummary && (
            <div>
              <p className="text-[12px] text-gray-400 mb-1">
                {partnerProfile?.name || "Your Partner"}
              </p>
              <p className="text-[13px] leading-relaxed text-gray-300 whitespace-pre-line">
                {partnerSummary}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}