
"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, PlusCircle, Users, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase/config"
import { collection, onSnapshot, query, orderBy, Timestamp, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore'
import { format, subMinutes, subDays, eachDayOfInterval } from 'date-fns'
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const userChartConfig = {
  count: { label: "New Users", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  status: 'Active' | 'Suspended';
  role: 'Admin' | 'User';
  lastSeen?: Timestamp;
  createdAt?: Timestamp;
}

export default function AdminUsersPage() {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [userChartData, setUserChartData] = React.useState<{ date: string; count: number }[]>([]);

  React.useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: User[] = [];
        const thirtyDaysAgo = subDays(new Date(), 29);
        const dailyCounts: { [key: string]: number } = {};

        const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
        days.forEach(day => {
            dailyCounts[format(day, 'yyyy-MM-dd')] = 0;
        });

        querySnapshot.forEach((doc) => {
            const userData = { id: doc.id, ...doc.data() } as User
            usersData.push(userData);

            if (userData.createdAt) {
                const creationDate = format(userData.createdAt.toDate(), 'yyyy-MM-dd');
                if (dailyCounts[creationDate] !== undefined) {
                    dailyCounts[creationDate]++;
                }
            }
        });
        
        const chartData = Object.entries(dailyCounts).map(([date, count]) => ({
            date: format(new Date(date), 'MMM d'),
            count
        }));
        
        setUserChartData(chartData);
        setUsers(usersData);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  }
  
  const handleAdd = () => {
      setSelectedUser(null);
      setOpen(true);
  }

  const isUserOnline = (lastSeen: Timestamp | undefined) => {
      if (!lastSeen) return false;
      const fiveMinutesAgo = subMinutes(new Date(), 5);
      return lastSeen.toDate() > fiveMinutesAgo;
  }

  const formatLastSeen = (lastSeen: Timestamp | undefined) => {
      if (!lastSeen) return "Never";
      if(isUserOnline(lastSeen)) return "Online";
      return format(lastSeen.toDate(), 'PPpp');
  }

  if (loading) {
      return (
          <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <>
    <div className="animate-fade-in grid gap-8">
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <CardTitle className="font-headline">User Management</CardTitle>
            <CardDescription>View, edit, or delete user accounts.</CardDescription>
        </div>
         <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell className="font-mono">PKR {user.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                         {isUserOnline(user.lastSeen) && (
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Online"></div>
                         )}
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                        {formatLastSeen(user.lastSeen)}
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(user)}><Edit className="mr-2 h-4 w-4"/>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
    
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary" />New User Registrations</CardTitle>
                    <CardDescription>New user sign-ups over the last 30 days.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <ChartContainer config={userChartConfig} className="h-[250px] w-full">
                <BarChart data={userChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
    </div>
    <UserDialog open={open} setOpen={setOpen} user={selectedUser} />
    </>
  )
}

function UserDialog({ open, setOpen, user }: { open: boolean, setOpen: (open: boolean) => void, user: User | null }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const balance = parseFloat((form.elements.namedItem('balance') as HTMLInputElement).value);
        const status = (form.elements.namedItem('status') as HTMLSelectElement).value as User['status'];
        const role = (form.elements.namedItem('role') as HTMLSelectElement).value as User['role'];
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            if (user) { // Editing existing user
                const userRef = doc(db, 'users', user.id);
                await updateDoc(userRef, { fullName, email, balance, status, role });
                toast({ title: "User Updated", description: "User details have been saved successfully." });
            } else { // Adding new user
                if (!password) {
                    toast({ title: "Error", description: "Password is required for new users.", variant: "destructive" });
                    setIsLoading(false);
                    return;
                }
                 // We need a separate auth instance to create a user without signing in the admin
                const tempAuth = getAuth();
                const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
                const newUser = userCredential.user;

                await setDoc(doc(db, "users", newUser.uid), {
                    uid: newUser.uid,
                    fullName,
                    email,
                    balance,
                    status,
                    role,
                    createdAt: new Date(),
                });
                toast({ title: "User Created", description: "New user has been added successfully." });
            }
            setOpen(false);
        } catch (error: any) {
            console.error("Error saving user:", error);
            toast({ title: "Error", description: error.message || "Could not save user details.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">{user ? "Edit User" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        {user ? "Update the user's details below." : "Enter the details for the new user."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[70vh] p-1">
                    <div className="space-y-4 p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" defaultValue={user?.fullName} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={user?.email} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="balance">Balance</Label>
                            <Input id="balance" name="balance" type="number" step="0.01" defaultValue={user?.balance.toString() ?? '0'} required />
                        </div>
                        {!user && (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                        )}
                         <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={user?.status ?? 'Active'}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                             <Select name="role" defaultValue={user?.role ?? 'User'}>
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     </ScrollArea>
                    <DialogFooter className="pt-4 pr-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

    