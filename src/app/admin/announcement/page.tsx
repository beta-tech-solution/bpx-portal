
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminAnnouncementPage() {
    const { toast } = useToast();
    const [announcement, setAnnouncement] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            setLoading(true);
            const announcementDocRef = doc(db, "settings", "globalAnnouncement");
            const docSnap = await getDoc(announcementDocRef);
            if (docSnap.exists()) {
                setAnnouncement(docSnap.data().message || "");
            }
            setLoading(false);
        };
        fetchAnnouncement();
    }, []);

    const handleSaveAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const announcementDocRef = doc(db, "settings", "globalAnnouncement");
            await setDoc(announcementDocRef, { message: announcement });
            toast({
                title: "Announcement Saved",
                description: "The global announcement has been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving announcement:", error);
            toast({ title: "Error", description: "Could not save the announcement.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <form onSubmit={handleSaveAnnouncement}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Megaphone />
                            Global Announcement
                        </CardTitle>
                        <CardDescription>
                            Set a site-wide announcement message that will be displayed to all users on their dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Enter announcement message here..."
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Announcement
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
