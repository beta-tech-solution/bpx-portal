
"use client"

import ChatView from "@/components/admin/chat-view";

// The page itself is now a simple server component that was causing issues with the build process.
// The new build configuration in next.config.ts now ignores the /admin path during mobile builds,
// so we can revert this page to its original, simpler form where it directly renders the client component.
// The generateStaticParams function has been removed as it's no longer needed with this strategy.
export default function AdminChatPage({ params }: { params: { chatId: string }}) {
  return <ChatView chatId={params.chatId} />;
}
