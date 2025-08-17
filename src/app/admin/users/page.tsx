
"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, PlusCircle, Users, Loader2, Copy, ShieldCheck, ShieldAlert } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db, app as defaultApp } from "@/lib/firebase/config"
import { collection, query, orderBy, Timestamp, doc, updateDoc, getDocs, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore'
import { format, subMinutes, subDays, eachDayOfInterval } from 'date-fns'
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Textarea } from "@/components/ui/textarea"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { initializeApp, deleteApp } from "firebase/app"
import { Switch } from "@/components/ui/switch"


const userChartConfig = {
  count: { label: "New Users", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  balance: number;
  status: 'Active' | 'Suspended' | 'Pending';
  role: 'Admin' | 'User';
 /* lastSeen?: Timestamp; */ 
  createdAt?: Timestamp;
  bpexchUsername?: string;
  bpexchPassword?: string;
  adminMessage?: string;
  emailVerified: boolean;
  adminVerified?: boolean;
}

// This is a client-side action, not a server action.
// It is safe because Firestore security rules should prevent unauthorized deletion.
async function deleteUserClientSideAction(uid: string) {
    if (!uid) {
        throw new Error("User ID is required.");
    }
    // We can't delete from Auth on client side without re-authentication.
    // This is a known limitation. Admin will have to manually delete from Firebase Console for full cleanup.
    // The primary goal here is to remove the user from the app's database.
    try {
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);
        return { success: true, message: "User deleted from database. Remember to delete them from the Firebase Auth console." };
    } catch(error: any) {
        console.error("Error deleting user from Firestore:", error);
        throw new Error(error.message || "An error occurred while deleting the user from the database.");
    }
}


export default function AdminUsersPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [userChartData, setUserChartData] = React.useState<{ date: string; count: number }[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const usersData: User[] = [];
            const thirtyDaysAgo = subDays(new Date(), 29);
            const dailyCounts: { [key: string]: number } = {};

            const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
            days.forEach(day => {
                dailyCounts[format(day, 'yyyy-MM-dd')] = 0;
            });

            querySnapshot.forEach((doc) => {
                const userData = { id: doc.id, ...doc.data() } as User;

                if (userData.status !== 'Suspended') {
                    userData.status = (userData.bpexchUsername && userData.bpexchPassword) ? 'Active' : 'Pending';
                }

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
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({ title: "Error", description: "Could not fetch user data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchUsers();
  }, [toast]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }
  
  const handleAdd = () => {
      setSelectedUser(null);
      setIsFormOpen(true);
  }

  const handleViewDetails = (user: User) => {
      setSelectedUser(user);
      setIsDetailsOpen(true);
  }
  
  const handleDelete = async (userId: string) => {
    try {
        const result = await deleteUserClientSideAction(userId);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        toast({ title: "User Removed", description: result.message });
    } catch (error: any) {
        console.error("Failed to delete user:", error);
        toast({ title: "Error", description: error.message || "Could not delete user.", variant: "destructive" });
    }
  }

  {/* const isUserOnline = (lastSeen: Timestamp | undefined) => {
      if (!lastSeen) return false;
      const fiveMinutesAgo = subMinutes(new Date(), 5);
      return lastSeen.toDate() > fiveMinutesAgo;
  }

  const formatLastSeen = (lastSeen: Timestamp | undefined) => {
      if (!lastSeen) return "Never";
      if(isUserOnline(lastSeen)) return "Online";
      return format(lastSeen.toDate(), 'PPpp');
  } */}

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (users.length === 0) {
      return <div className="text-center text-muted-foreground p-8">No users found.</div>;
    }

    if (isMobile) {
      return (
        <div className="space-y-4">
{users
  .filter(user => {
    if (!searchTerm) return true; // show all if no search
    const term = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term)
    );
  })
  .map((user) => (
            <Card key={user.id} onClick={() => handleViewDetails(user)}>
              <CardContent className="p-4 flex flex-col gap-3">
                 <div>
                    <p className="font-semibold break-words">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-mono">PKR {user.balance?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>{user.role}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
  <span className="text-muted-foreground">Status:</span>
  <Badge variant={user.status === 'Active' ? 'secondary' : (user.status === 'Pending' ? 'default' : 'destructive')}>
    {user.status}
  </Badge>
</div>

                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <Badge variant={user.emailVerified || user.adminVerified ? 'secondary' : 'destructive'}>
                        {user.emailVerified || user.adminVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove the user from the application database. You will still need to delete them from the Firebase Authentication console manually.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
       <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              {/*  <TableHead>Last Seen</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
  {users
    .filter(user => {
      if (!searchTerm) return true; // show all if no input
      const term = searchTerm.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term)
      );
    })
    .map((user) => (
      <TableRow
        key={user.id}
        onClick={() => handleViewDetails(user)}
        className="cursor-pointer"
      >
        <TableCell>
          <div className="font-medium">{user.fullName}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </TableCell>

        <TableCell>
          <Badge variant={user.emailVerified || user.adminVerified ? 'secondary' : 'destructive'}>
            {user.emailVerified || user.adminVerified ? (
              <ShieldCheck className="mr-1 h-3 w-3" />
            ) : (
              <ShieldAlert className="mr-1 h-3 w-3" />
            )}
            {user.emailVerified || user.adminVerified ? 'Verified' : 'Not Verified'}
          </Badge>
        </TableCell>

        <TableCell className="font-mono">PKR {user.balance?.toFixed(2) || '0.00'}</TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                user.status === "Active"
                  ? "secondary"
                  : user.status === "Pending"
                  ? "default"
                  : "destructive"
              }
            >
              {user.status}
            </Badge>
          </div>
        </TableCell>

        <TableCell>
          <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>{user.role}</Badge>
        </TableCell>

        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the user from the application database. You will still need to delete them from the Firebase Authentication console manually. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(user.id);
                    }}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    ))}
</TableBody>

            </Table>
        </div>
    );
  }


  return (
    <>
    <div className="animate-fade-in grid gap-8 max-w-7xl mx-auto">
      <Card className={isMobile ? "max-w-[400px] mx-auto" : ""}>
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
  <div className="flex flex-col items-center md:items-start">
    <CardTitle className="font-headline">User Management</CardTitle>
    <CardDescription>View, edit, or delete user accounts.</CardDescription>
  </div>

  <div className="flex-1 flex justify-center">
    <Input
      placeholder="Search by name or phone..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-sm"
    />
  </div>

  <Button onClick={handleAdd}>
    <PlusCircle className="mr-2 h-4 w-4" />
    Add User
  </Button>
</CardHeader>

        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    
      <Card className={isMobile ? "max-w-[320px] mx-auto" : ""}>
          <CardHeader>
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary" />New User Registrations</CardTitle>
                      <CardDescription>New user sign-ups over the last 30 days.</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ChartContainer config={userChartConfig} className="h-[250px] min-w-[600px] w-full">
                  <BarChart data={userChartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
      </Card>
    </div>
    <UserFormDialog open={isFormOpen} setOpen={setIsFormOpen} user={selectedUser} />
    <UserDetailsDialog open={isDetailsOpen} setOpen={setIsDetailsOpen} user={selectedUser} />
    </>
  )
}

const UserFormSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    balance: z.coerce.number().min(0, "Balance must be non-negative"),
    status: z.enum(['Active', 'Suspended', 'Pending']),
    role: z.enum(['User', 'Admin']),
    password: z.string().optional(),
    bpexchUsername: z.string().optional(),
    bpexchPassword: z.string().optional(),
    adminMessage: z.string().optional(),
    adminVerified: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof UserFormSchema>;

function UserFormDialog({ open, setOpen, user }: { open: boolean, setOpen: (open: boolean) => void, user: User | null }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const form = useForm<UserFormValues>({
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            balance: 0,
            status: 'Pending',
            role: 'User',
            password: "",
            bpexchUsername: "",
            bpexchPassword: "",
            adminMessage: "",
            adminVerified: false,
        },
    });

     React.useEffect(() => {
        if (open) {
            const getInitialStatus = (user: User | null) => {
                if (!user) return 'Pending';
                if (user.status === 'Suspended') return 'Suspended';
                if (user.bpexchUsername && user.bpexchPassword) return 'Active';
                return 'Pending';
            };

            form.reset({
                fullName: user?.fullName || "",
                email: user?.email || "",
                balance: user?.balance || 0,
                status: getInitialStatus(user),
                role: user?.role || 'User',
                password: "",
                bpexchUsername: user?.bpexchUsername || "",
                bpexchPassword: user?.bpexchPassword || "",
                adminMessage: user?.adminMessage || "",
                adminVerified: user?.adminVerified || false,
            });
        }
    }, [user, form, open]);


    const handleSubmit = async (data: UserFormValues) => {
        setIsLoading(true);
        
        let finalStatus = data.status;
        if (data.status !== 'Suspended') {
            finalStatus = (data.bpexchUsername && data.bpexchPassword) ? 'Active' : 'Pending';
        }

        try {
            if (user) { 
                // Editing an existing user
                const userRef = doc(db, 'users', user.id);
                await updateDoc(userRef, { 
                    fullName: data.fullName, 
                    // Email cannot be changed here as it's tied to auth
                    balance: data.balance, 
                    status: finalStatus, 
                    role: data.role,
                    bpexchUsername: data.bpexchUsername,
                    bpexchPassword: data.bpexchPassword,
                    adminMessage: data.adminMessage,
                    adminVerified: data.adminVerified,
                });
                toast({ title: "User Updated", description: "User details have been saved successfully." });
            } else {
                // Creating a new user
                if (!data.password) {
                    form.setError("password", { type: "manual", message: "Password is required for new users." });
                    setIsLoading(false);
                    return;
                }
                
                // --- Robust Isolated Firebase Auth Instance ---
                // Create a temporary, uniquely named Firebase app instance.
                const tempAppName = `temp-user-creation-${Date.now()}`;
                const tempApp = initializeApp(defaultApp.options, tempAppName);
                const tempAuth = getAuth(tempApp);

                try {
                    const userCredential = await createUserWithEmailAndPassword(tempAuth, data.email, data.password);
                    const newUser = userCredential.user;

                    // Now use the primary Firestore instance to write the user's data
                    await setDoc(doc(db, "users", newUser.uid), {
                        uid: newUser.uid,
                        fullName: data.fullName,
                        email: data.email,
                        balance: data.balance,
                        status: finalStatus,
                        role: data.role,
                        createdAt: serverTimestamp(),
                        bpexchUsername: data.bpexchUsername,
                        bpexchPassword: data.bpexchPassword,
                        adminMessage: data.adminMessage,
                        emailVerified: false,
                        adminVerified: data.adminVerified,
                    });
                    
                    toast({ title: "User Created", description: "New user has been added successfully." });
                } finally {
                    // IMPORTANT: Clean up the temporary app instance
                    await deleteApp(tempApp);
                }
            }
            setOpen(false);
        } catch (error: any) {
            console.error("Error saving user:", error);
            if (error.code === 'auth/email-already-in-use') {
                form.setError("email", { type: 'manual', message: 'This email address is already in use.' });
            } else {
                toast({ title: "Error", description: error.message || "Could not save user details.", variant: "destructive" });
            }
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
                        <ScrollArea className="max-h-[70vh] flex-grow pr-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="user@example.com" {...field} disabled={!!user} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {user && (
                                <FormField
                                    control={form.control}
                                    name="adminVerified"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Manual Verification</FormLabel>
                                            <FormMessage />
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                )}
                                <FormField
                                    control={form.control}
                                    name="balance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Balance</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {!user && (
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="User">User</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Card>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">BPExch Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                         <FormField
                                            control={form.control}
                                            name="bpexchUsername"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>BPExch Username/Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="bpexch_user" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="bpexchPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>BPExch Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                                 <FormField
                                    control={form.control}
                                    name="adminMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message for User</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter a message to display to this user on their BPExch login page." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6 mt-auto border-t">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const DetailRow = ({ label, value }: { label: string, value: string | undefined | null }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        if(value) {
            navigator.clipboard.writeText(value);
            toast({ title: `${label} Copied!`, description: value });
        }
    }
    return (
        <div className="flex justify-between items-center py-2 border-b">
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value || 'N/A'}</p>
            </div>
            {value && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}

function UserDetailsDialog({ open, setOpen, user }: { open: boolean, setOpen: (open: boolean) => void, user: User | null }) {
    if (!user) return null;

    const isUserOnline = (lastSeen: Timestamp | undefined) => {
        if (!lastSeen) return false;
        const fiveMinutesAgo = subMinutes(new Date(), 5);
        return lastSeen.toDate() > fiveMinutesAgo;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">{user.fullName}</DialogTitle>
                    <DialogDescription>
                        Complete details for this user.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-2">
                        <DetailRow label="Full Name" value={user.fullName} />
                        <DetailRow label="Email" value={user.email} />
                        <div className="flex justify-between items-center py-2 border-b">
                            <div>
                                <p className="text-sm text-muted-foreground">Email Verified</p>
                                <p className="font-medium">{user.emailVerified || user.adminVerified ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                        <DetailRow label="Phone" value={user.phone} />
                        <DetailRow label="Gender" value={user.gender} />
                        <DetailRow label="Balance" value={`PKR ${user.balance?.toFixed(2) || '0.00'}`} />
                        <DetailRow label="Status" value={user.status} />
                        <DetailRow label="Role" value={user.role} />
                        <DetailRow label="Joined On" value={user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'} />
                        {/*<DetailRow label="Last Seen" value={user.lastSeen ? (isUserOnline(user.lastSeen) ? 'Online' : format(user.lastSeen.toDate(), 'PPpp')) : 'Never'} /> */}
                        
                        <h3 className="font-headline text-lg pt-4">BPExch Details</h3>
                        <DetailRow label="BPExch Username" value={user.bpexchUsername} />
                        <DetailRow label="BPExch Password" value={user.bpexchPassword} />
                        
                        <h3 className="font-headline text-lg pt-4">Message for User</h3>
                        <div className="text-sm p-3 bg-muted rounded-md min-h-[60px]">
                           {user.adminMessage || <span className="text-muted-foreground">No message set.</span>}
                        </div>
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
