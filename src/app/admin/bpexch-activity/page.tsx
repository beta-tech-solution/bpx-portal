
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, getDoc, doc, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

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
      item.ip.includes(searchTerm)
    );
  }, [activity, searchTerm]);

  return (
    <Card className="animate-fade-in">
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
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                {filteredActivity.length > 0 ? filteredActivity.map(item => (
                    <TableRow key={item.id}>
                    <TableCell>
                        <div className="font-medium">{item.userName}</div>
                        <div className="text-sm text-muted-foreground">{item.userEmail}</div>
                    </TableCell>
                    <TableCell className="font-mono">{item.ip}</TableCell>
                    <TableCell>{item.timestamp}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No activity found.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
