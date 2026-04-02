"use client";

import MessageInput from "@/components/MessageInput";

export default function MessagingSection({
  profile,
  setLatestMessage,
}: {
  profile: any;
  setLatestMessage: (msg: any) => void;
}) {
  if (!profile?.partner_id) return null;

  return (
    <>
      <div className="border p-4 mb-4 rounded">
        <p className="text-[13px] text-gray-500">
          Chat with partner
        </p>
      </div>

      <div className="card mb-8">
        <p className="card-title mb-3">Drop a note</p>

        <MessageInput
          partnerId={profile.partner_id}
          onMessageSent={(msg) => setLatestMessage(msg)}
        />
      </div>
    </>
  );
}