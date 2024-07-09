import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { videoURLtoID } from "@/lib/utils";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";

// VideoIdInput.tsx
export function VideoIdInput() {
  const [urlField, setUrlField] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = videoURLtoID(urlField);
    if (!id) {
      alert("Invalid video URL [" + id + "]");
      return;
    }
    navigate("?id=" + id);
  };

  return (
    <div className="content">
      <Label htmlFor="videoId" className="text-base-11">
        Put in a video ID
      </Label>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm items-center space-x-2"
      >
        <Input
          id="videoId"
          value={urlField}
          onInput={(e) => setUrlField(e.currentTarget.value)}
        />
        <Button type="submit">Load</Button>
      </form>
    </div>
  );
}
