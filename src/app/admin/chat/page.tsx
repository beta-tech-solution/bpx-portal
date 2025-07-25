
"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase/config";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";

interface ChatSession {
  id: string;
  userName: string;
  lastMessage: string;
  lastMessageTimestamp: any;
  adminRead: boolean;
}

export default function AdminChatListPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "chats"), orderBy("lastMessageTimestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatSessions: ChatSession[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatSession));
      setSessions(chatSessions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 1);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <Card className="h-full flex flex-col animate-fade-in">
      <CardHeader>
        <CardTitle className="font-headline">Support Chat</CardTitle>
        <CardDescription>View and respond to user messages.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full">
          {sessions.length > 0 ? (
            sessions.map(session => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 border-b cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/admin/chat/${session.id}`)}
              >
                <Avatar>
                  <AvatarFallback>{getInitials(session.userName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{session.userName}</p>
                    {session.lastMessageTimestamp && (
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(session.lastMessageTimestamp.toDate(), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground truncate">{session.lastMessage}</p>
                    {!session.adminRead && (
                       <Badge variant="destructive" className="ml-2">New</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground">No chat sessions found.</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
