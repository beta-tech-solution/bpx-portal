
"use client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

const users = [
  { id: 'usr_1', name: 'John Doe', email: 'john.d@example.com', balance: '$1,250.50', status: 'Active' },
  { id: 'usr_2', name: 'Jane Smith', email: 'jane.s@example.com', balance: '$800.00', status: 'Active' },
  { id: 'usr_3', name: 'Sam Wilson', email: 'sam.w@example.com', balance: '$2,100.75', status: 'Suspended' },
  { id: 'usr_4', name: 'Alice Johnson', email: 'alice.j@example.com', balance: '$300.20', status: 'Active' },
];

type User = typeof users[0];

export default function AdminUsersPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  }
  
  const handleAdd = () => {
      setSelectedUser(null);
      setOpen(true);
  }

  return (
    <>
    <div className="animate-fade-in">
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
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell className="font-mono">{user.balance}</TableCell>
                    <TableCell>
                    <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
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
                            <Input id="name" defaultValue={user?.name} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="balance">Balance</Label>
                            <Input id="balance" type="text" defaultValue={user?.balance.replace('$', '')} required />
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
