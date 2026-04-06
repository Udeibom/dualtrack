"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { useDashboard } from "@/hooks/useDashboard";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import AlertBanner from "@/components/dashboard/AlertBanner";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import WeeklyComparison from "@/components/dashboard/WeeklyComparison";
import GoalsSection from "@/components/dashboard/GoalsSection";
import MessagingSection from "@/components/dashboard/MessagingSection";
import LogsModal from "@/components/dashboard/LogsModal";

export default function Home() {
  const { user, loading } = useAuth();

  const {
    profile,
    partnerProfile,
    myLogs,
    partnerLogs,
    myGoals,
    partnerGoals,
    latestMessage,
    streak,
    summary,
    partnerSummary,
    mySeries,
    partnerSeries,
    loadDashboard,
    setLatestMessage,
  } = useDashboard(user);

  const [showMyLogs, setShowMyLogs] = useState(false);
  const [showPartnerLogs, setShowPartnerLogs] = useState(false);

  useEffect(() => {
    if (!user || loading) return;
    loadDashboard();
  }, [user, loading, loadDashboard]);

  if (!user && !loading) {
    return <div>Landing Page</div>;
  }

  if (loading || !user || streak === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <DashboardHeader />

      <StatsCards
        streak={streak}
        myLogs={myLogs}
        partnerLogs={partnerLogs}
        onOpenMyLogs={() => setShowMyLogs(true)}
        onOpenPartnerLogs={() => setShowPartnerLogs(true)}
      />

      {/* MODALS */}
      {showMyLogs && (
        <LogsModal
          title="Your Logs"
          logs={myLogs}
          onClose={() => setShowMyLogs(false)}
        />
      )}

      {showPartnerLogs && (
        <LogsModal
          title="Partner Logs"
          logs={partnerLogs}
          onClose={() => setShowPartnerLogs(false)}
        />
      )}

      <AlertBanner
        myLogs={myLogs}
        partnerLogs={partnerLogs}
        partnerProfile={partnerProfile}
      />

      <MessagingSection
        profile={profile}
        setLatestMessage={setLatestMessage}
      />

      <WeeklySummary
        summary={summary}
        partnerSummary={partnerSummary}
        partnerProfile={partnerProfile}
        latestMessage={latestMessage}
      />

      <WeeklyComparison
        profile={profile}
        mySeries={mySeries}
        partnerSeries={partnerSeries}
      />

      <GoalsSection
        myGoals={myGoals}
        partnerGoals={partnerGoals}
        partnerProfile={partnerProfile}
      />
    </div>
  );
}