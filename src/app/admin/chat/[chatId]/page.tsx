
import ChatView from "@/components/admin/chat-view";

// This function is required for static exports (output: 'export') with dynamic routes.
// It tells Next.js not to pre-render any specific chat pages during the mobile build.
export async function generateStaticParams() {
  return [];
}

// The page itself is now a simple server component.
export default function AdminChatPage({ params }: { params: { chatId: string }}) {
  // It passes the chatId to the client component which handles all the logic.
  return <ChatView chatId={params.chatId} />;
}
