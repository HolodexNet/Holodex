import React, { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shadcn/ui/card";
import { useToast } from "@/shadcn/ui/use-toast";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

export default function ResetClientPage(): JSX.Element {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const navigate = useNavigate();

  const resetClientData = async (): Promise<void> => {
    setIsResetting(true);
    try {
      // Clear all localStorage
      localStorage.clear();

      // Clear all IndexedDB databases
      const databases = await window.indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          await new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(db.name as string);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
          });
        }
      }

      // Notify other windows to reset and reload
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel("app_data_reset");
        channel.postMessage("RESET_AND_RELOAD");
      }

      toast({
        title: "Reset Successful",
        description:
          "Your client-side data has been reset successfully. The page will now reload.",
        duration: 5000,
      });

      // Force reload of the current page
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Give some time for the toast to be visible
    } catch (error) {
      console.error("Error resetting client data:", error);
      toast({
        title: "Reset Failed",
        description:
          "There was an error resetting your client-side data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsResetting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Client Data - Holodex</title>
      </Helmet>
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Reset Client Data
            </CardTitle>
            <CardDescription>
              Clear all locally stored data and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Warning: This action will reset all your client-side data. This
              includes:
            </p>
            <ul className="mb-4 list-inside list-disc">
              <li>All local storage data</li>
              <li>All IndexedDB data</li>
              <li>User preferences</li>
              <li>Your login session</li>
            </ul>
            <p className="mb-4">
              Note: Your favorites and playlists are stored server-side and will
              not be affected.
            </p>
            <p className="mb-4">
              This action cannot be undone. All open windows of this website
              will be refreshed.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="destructive"
              onClick={resetClientData}
              disabled={isResetting}
            >
              <span className="i-heroicons:trash mr-2" />
              {isResetting ? "Resetting..." : "Reset Client Data"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
