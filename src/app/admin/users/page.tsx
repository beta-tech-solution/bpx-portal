
"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, PlusCircle, Users, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase/config"
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore'
import { format, subMinutes } from 'date-fns'


const userChartConfig = {
  count: { label: "New Users", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  status: 'Active' | 'Suspended';
  lastSeen?: Timestamp;
}

export default function AdminUsersPage() {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
            usersData.push({ id: doc.id, ...doc.data() } as User);
        });
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
      const fiveMinutesAgo = subMinutes(new Date(), 2);
      return lastSeen.toDate() > fiveMinutesAgo;
  }

  const formatLastSeen = (lastSeen: Timestamp | undefined) => {
      if (!lastSeen) return "Never";
      return format(lastSeen.toDate(), 'PPpp');
  }

  const userChartData = [
    { date: "2023-10-01", count: 12 },
    { date: "2023-10-02", count: 15 },
    { date: "2023-10-03", count: 8 },
    { date: "2023-10-04", count: 20 },
    { date: "2023-10-05", count: 18 },
    { date: "2023-10-06", count: 25 },
    { date: "2023-10-07", count: 22 },
  ];

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
                        {isUserOnline(user.lastSeen) ? (
                            <span className="text-green-600 font-medium">Online</span>
                        ) : (
                            formatLastSeen(user.lastSeen)
                        )}
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
                    <CardDescription>New user sign-ups over a selected period.</CardDescription>
                </div>
                <Select defaultValue="7">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="180">Last 6 months</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <ChartContainer config={userChartConfig} className="h-[250px] w-full">
                <BarChart data={userChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
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
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: user ? "User Updated" : "User Created",
            description: `User details have been saved successfully.`
        })
        setOpen(false);
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
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" defaultValue={user?.fullName} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="balance">Balance</Label>
                            <Input id="balance" type="text" defaultValue={user?.balance.toString()} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select id="status" defaultValue={user?.status} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>Active</option>
                                <option>Suspended</option>
                            </select>
                        </div>
                    </div>
                     </ScrollArea>
                    <DialogFooter className="pt-4 pr-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
