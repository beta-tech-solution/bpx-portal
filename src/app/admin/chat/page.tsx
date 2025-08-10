
"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase/config";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
  
  const handleDeleteChat = async (chatId: string) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const messagesQuery = query(collection(chatRef, 'messages'));
        const messagesSnapshot = await getDocs(messagesQuery);
        
        const deletePromises = messagesSnapshot.docs.map(messageDoc => 
            deleteDoc(doc(db, `chats/${chatId}/messages`, messageDoc.id))
        );
        
        await Promise.all(deletePromises);
        await deleteDoc(chatRef);
        
        toast({ title: "Chat Deleted", description: "The entire chat session has been removed." });
    } catch(e) {
        console.error("Error deleting chat:", e);
        toast({ title: "Error", description: "Could not delete chat session.", variant: "destructive" });
    }
  }

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
                className="flex items-center gap-4 p-4 border-b group hover:bg-muted/50"
              >
                <div
                    className="flex-grow flex items-center gap-4 cursor-pointer"
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
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the entire chat history with {session.userName}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteChat(session.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
