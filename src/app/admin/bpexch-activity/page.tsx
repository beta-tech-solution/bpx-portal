
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, getDoc, doc, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ip: string;
  timestamp: string;
}

export default function AdminBpexchActivityPage() {
  const [activity, setActivity] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'bpexch_logins'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const activityData: LoginActivity[] = [];
      const userCache = new Map();

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        let userName = 'Unknown';
        let userEmail = 'Unknown';
        
        if (data.userId) {
          if (userCache.has(data.userId)) {
              const userData = userCache.get(data.userId);
              userName = userData.name;
              userEmail = userData.email;
          } else {
              try {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  userName = userData.fullName;
                  userEmail = userData.email;
                  userCache.set(data.userId, { name: userName, email: userEmail });
                }
              } catch (e) {
                  console.error("Could not fetch user", e)
              }
          }
        }
        
        activityData.push({
          id: docSnapshot.id,
          userId: data.userId,
          userName,
          userEmail,
          ip: data.ip,
          timestamp: data.timestamp ? format((data.timestamp as any).toDate(), 'PPpp') : 'No date',
        });
      }
      setActivity(activityData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activity: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredActivity = useMemo(() => {
    return activity.filter(item => 
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ip && item.ip.includes(searchTerm))
    );
  }, [activity, searchTerm]);

  const renderContent = () => {
    if (loading) {
       return (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
       )
    }
    
    if (filteredActivity.length === 0 && !isMobile) {
        return (
             <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No activity found.</TableCell>
            </TableRow>
        )
    }

    if (isMobile) {
        if (filteredActivity.length === 0) {
            return <div className="text-center text-muted-foreground p-8">No activity found.</div>;
        }
        return (
             <div className="space-y-4">
                {filteredActivity.map(item => (
                    <Card key={item.id}>
                        <CardContent className="p-4 flex flex-col gap-3">
                             <div>
                                <p className="font-semibold break-words">{item.userName}</p>
                                <p className="text-sm text-muted-foreground">{item.userEmail}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">IP Address:</span>
                                <span className="font-mono">{item.ip}</span>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Timestamp:</span>
                                <span className="text-xs text-right">{item.timestamp}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
         <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredActivity.map(item => (
                    <TableRow key={item.id}>
                    <TableCell>
                        <div className="font-medium">{item.userName}</div>
                        <div className="text-sm text-muted-foreground">{item.userEmail}</div>
                    </TableCell>
                    <TableCell className="font-mono">{item.ip}</TableCell>
                    <TableCell>{item.timestamp}</TableCell>
                    </TableRow>
                ))}
                {filteredActivity.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No activity found.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
    )
  }

  return (
    <Card className={`animate-fade-in max-w-7xl mx-auto ${isMobile ? "max-w-[400px]" : ""}`}>
      <CardHeader>
        <CardTitle className="font-headline">BPExch Login Activity</CardTitle>
        <CardDescription>Review all user login attempts to the BPExch platform.</CardDescription>
        <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name, email, or IP..." 
                className="pl-8" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
