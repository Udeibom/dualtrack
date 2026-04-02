import ComparisonChart from "@/components/ComparisonChart";

export default function WeeklyComparison({
  profile,
  mySeries,
  partnerSeries,
}: {
  profile: any;
  mySeries: any[];
  partnerSeries: any[];
}) {
  if (!profile?.partner_id || mySeries.length === 0) return null;

  return (
    <div className="card mb-8">
      <p className="text-[13px] text-gray-400 mb-2">
        Last 7 days performance
      </p>

      <div className="flex gap-4 text-[12px] text-gray-400 mb-3">
        <span className="text-indigo-400">● You</span>
        <span className="text-green-400">● Partner</span>
      </div>

      <p className="card-title mb-4">Weekly Comparison</p>

      <ComparisonChart
        myData={mySeries}
        partnerData={partnerSeries}
      />
    </div>
  );
}