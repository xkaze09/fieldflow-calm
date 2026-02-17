import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Bell, KeyRound, LogOut } from "lucide-react";

export default function Settings() {
  const { user, signOut } = useAuth();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Notification state
  const [notifyMissedCalls, setNotifyMissedCalls] = useState(true);
  const [notifyNewJobs, setNotifyNewJobs] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setDisplayName(data.display_name ?? "");
      setCompanyName(data.company_name ?? "");
      setPhone(data.phone ?? "");
      setNotifyMissedCalls(data.notify_missed_calls);
      setNotifyNewJobs(data.notify_new_jobs);
      setNotifyEmail(data.notify_email);
      setNotifySms(data.notify_sms);
    }
  };

  const saveProfile = async () => {
    setProfileLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        company_name: companyName,
        phone,
      })
      .eq("user_id", user!.id);

    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
    setProfileLoading(false);
  };

  const saveNotifications = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        notify_missed_calls: notifyMissedCalls,
        notify_new_jobs: notifyNewJobs,
        notify_email: notifyEmail,
        notify_sms: notifySms,
      })
      .eq("user_id", user!.id);

    if (error) toast.error(error.message);
    else toast.success("Notification preferences saved!");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal and company details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button onClick={saveProfile} disabled={profileLoading}>
              {profileLoading ? "Saving…" : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Choose what you get notified about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="missedCalls">Missed call alerts</Label>
              <Switch id="missedCalls" checked={notifyMissedCalls} onCheckedChange={setNotifyMissedCalls} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="newJobs">New job alerts</Label>
              <Switch id="newJobs" checked={notifyNewJobs} onCheckedChange={setNotifyNewJobs} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotif">Email notifications</Label>
              <Switch id="emailNotif" checked={notifyEmail} onCheckedChange={setNotifyEmail} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotif">SMS notifications</Label>
              <Switch id="smsNotif" checked={notifySms} onCheckedChange={setNotifySms} />
            </div>
            <Button onClick={saveNotifications}>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle>Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPw">New Password</Label>
                <Input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPw">Confirm Password</Label>
                <Input id="confirmPw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" className="w-full" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
