"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/providers";
import { useDashboard } from "@/hooks/useDashboard";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import AlertBanner from "@/components/dashboard/AlertBanner";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import WeeklyComparison from "@/components/dashboard/WeeklyComparison";
import GoalsSection from "@/components/dashboard/GoalsSection";
import MessagingSection from "@/components/dashboard/MessagingSection";

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
    mySeries,
    partnerSeries,
    loadDashboard,
    setLatestMessage,
  } = useDashboard(user);

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
      />

      <AlertBanner
        myLogs={myLogs}
        partnerLogs={partnerLogs}
        partnerProfile={partnerProfile}
      />

      <MessagingSection
        profile={profile}
        setLatestMessage={setLatestMessage}
      />

      <WeeklySummary summary={summary} latestMessage={latestMessage} />

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