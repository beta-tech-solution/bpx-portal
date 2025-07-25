
"use client"

import { useState, useEffect, useRef } from "react";
import { useParams } from 'next/navigation';
import { db, auth } from "@/lib/firebase/config";
import { collection, query, onSnapshot, orderBy, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Paperclip, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const CLOUDINARY_CLOUD_NAME = "datq7sbdp";
const CLOUDINARY_UPLOAD_PRESET = "bpxmaster";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  attachmentUrl?: string;
  attachmentName?: string;
}

export default function AdminChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user] = useAuthState(auth);
  const [chatUser, setChatUser] = useState({ name: 'User' });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const notificationAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);

    const chatDocRef = doc(db, 'chats', chatId as string);
    updateDoc(chatDocRef, { adminRead: true });

    const unsubscribeChatUser = onSnapshot(chatDocRef, (docSnap) => {
        if(docSnap.exists()){
            setChatUser({ name: docSnap.data().userName });
        }
    });

    const q = query(collection(db, `chats/${chatId}/messages`), orderBy("timestamp", "asc"));
    
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      // Play sound only for new incoming messages from the user
      if (messages.length > 0 && msgs.length > messages.length) {
        const lastMsg = msgs[msgs.length - 1];
        if(lastMsg.senderId !== 'admin') {
           notificationAudioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }
      }
      
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
        unsubscribeMessages();
        unsubscribeChatUser();
    };
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

   const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 1);
  };

  const handleSendMessage = async (attachment?: { url: string; name: string }) => {
    if ((!newMessage.trim() && !attachment) || !user) return;
    setSending(true);
    
    try {
        const chatDocRef = doc(db, 'chats', chatId as string);
        const messagesColRef = collection(chatDocRef, 'messages');

        await addDoc(messagesColRef, {
            senderId: 'admin',
            text: newMessage.trim(),
            timestamp: serverTimestamp(),
            ...(attachment && { attachmentUrl: attachment.url, attachmentName: attachment.name }),
        });

        await updateDoc(chatDocRef, {
            lastMessage: attachment ? `Attachment: ${attachment.name}` : newMessage.trim(),
            lastMessageTimestamp: serverTimestamp(),
            userRead: false,
        });

        setNewMessage("");
    } catch (error) {
        console.error("Error sending message:", error);
    } finally {
        setSending(false);
    }
  };
  
  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setSending(true);

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST', body: formData,
        });
        if(!uploadResponse.ok) throw new Error('Upload failed');
        const data = await uploadResponse.json();
        await handleSendMessage({ url: data.secure_url, name: file.name });
        toast({ title: "Attachment sent" });
    } catch(err) {
        console.error("Error attaching file", err);
        toast({ title: "Attachment failed", description: "Could not send the file.", variant: "destructive" });
    } finally {
        setSending(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  }


  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <Card className="h-full flex flex-col animate-fade-in">
      <audio ref={notificationAudioRef} src="/notification.mp3" preload="auto"></audio>
      <CardHeader className="border-b">
        <CardTitle className="font-headline flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(chatUser.name)}</AvatarFallback>
            </Avatar>
            {chatUser.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === 'admin' ? "justify-end" : "justify-start")}>
                 {msg.senderId !== 'admin' && <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(chatUser.name)}</AvatarFallback></Avatar>}
                 <div className={cn("max-w-xs md:max-w-md rounded-lg px-3 py-2", msg.senderId === 'admin' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.attachmentUrl && (
                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 text-xs text-blue-500 underline">
                           <FileText className="h-4 w-4" /> {msg.attachmentName || 'View Attachment'}
                        </a>
                    )}
                    <p className="text-xs text-right mt-1 opacity-70">
                        {msg.timestamp ? format(msg.timestamp.toDate(), 'p') : '...'}
                    </p>
                 </div>
                 {msg.senderId === 'admin' && <Avatar className="h-8 w-8"><AvatarFallback>{getInitials('Admin')}</AvatarFallback></Avatar>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <div className="flex items-center gap-2 w-full">
          <input type="file" ref={fileInputRef} onChange={handleAttachment} className="hidden" />
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={sending}>
             <Paperclip className="h-5 w-5" />
          </Button>
          <Input 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={sending}
          />
          <Button onClick={() => handleSendMessage()} disabled={sending}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
