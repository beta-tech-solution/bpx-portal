
"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, X, Paperclip, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { db, auth } from "@/lib/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, doc, query, onSnapshot, orderBy, addDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { format, formatDistanceToNow } from 'date-fns'

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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user] = useAuthState(auth)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatId, setChatId] = useState<string | null>(null)
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
     // Ensure audio element is created on client
    notificationAudioRef.current = new Audio('/notification.mp3');
    notificationAudioRef.current.preload = 'auto';
  }, []);

  useEffect(() => {
    if (!user) return

    const userChatId = user.uid;
    setChatId(userChatId);
    
    const chatDocRef = doc(db, 'chats', userChatId);

    const unsubscribeChat = onSnapshot(chatDocRef, (docSnap) => {
        if(docSnap.exists()){
            const data = docSnap.data();
            if(!data.userRead) {
                setUnreadCount(prev => prev + 1);
            }
        }
    });

    const q = query(collection(db, `chats/${userChatId}/messages`), orderBy("timestamp", "asc"));
    
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

      // Play sound only for new incoming messages from admin
      if (messages.length > 0 && msgs.length > messages.length) {
        const lastMsg = msgs[msgs.length - 1];
        if(lastMsg.senderId === 'admin') {
           notificationAudioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }
      }

      setMessages(msgs);
    });

    return () => {
        unsubscribeChat();
        unsubscribeMessages();
    }
  }, [user])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && chatId) {
        // When opening, mark messages as read by user
        setUnreadCount(0);
        await updateDoc(doc(db, 'chats', chatId), { userRead: true });
    }
  }

  const handleSendMessage = async (attachment?: { url: string; name: string }) => {
    if ((!newMessage.trim() && !attachment) || !user || !chatId) return;
    setSending(true);

    try {
        const chatDocRef = doc(db, 'chats', chatId);
        const messagesColRef = collection(chatDocRef, 'messages');

        await addDoc(messagesColRef, {
            senderId: user.uid,
            text: newMessage.trim(),
            timestamp: serverTimestamp(),
            ...(attachment && { attachmentUrl: attachment.url, attachmentName: attachment.name }),
        });

        // Create or update the chat session document
        await setDoc(chatDocRef, {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            lastMessage: attachment ? `Attachment: ${attachment.name}` : newMessage.trim(),
            lastMessageTimestamp: serverTimestamp(),
            adminRead: false,
            userRead: true,
        }, { merge: true });

        setNewMessage("");
    } catch(err) {
        console.error("Error sending message:", err)
        toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
    } finally {
        setSending(false);
    }
  }
  
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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 1);
  };

  return (
    <>
      <div className={cn("fixed bottom-4 right-4 z-50 transition-all duration-300", isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100")}>
        <Button onClick={toggleOpen} size="icon" className="rounded-full w-14 h-14 shadow-lg">
          <MessageSquare />
          {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>}
        </Button>
      </div>

      <Card className={cn("fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] flex flex-col transition-all duration-300 origin-bottom-right", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
        <CardHeader className="flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Support Chat</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleOpen}>
            <X className="h-4 w-4"/>
          </Button>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                 {messages.map(msg => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                    {msg.senderId !== user?.uid && <Avatar className="h-8 w-8"><AvatarFallback>{getInitials('Admin')}</AvatarFallback></Avatar>}
                     <div className={cn("max-w-xs md:max-w-xs rounded-lg px-3 py-2", msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
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
                     {msg.senderId === user?.uid && <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback></Avatar>}
                  </div>
                 ))}
                 {messages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground pt-8">
                        Send a message to start a conversation.
                    </div>
                 )}
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
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={sending}
            />
            <Button onClick={() => handleSendMessage()} disabled={sending}>
                {sending ? <Loader2 className="animate-spin" /> : <Send className="h-5 w-5"/>}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
