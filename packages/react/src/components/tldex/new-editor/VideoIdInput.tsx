import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { videoURLtoID } from "@/lib/utils";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { CLIPPER_LANGS } from "@/lib/consts";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/auth";
import { tldexLanguageAtom } from "@/store/tldex";

export function VideoIdInput() {
  const [searchParams] = useSearchParams();
  const liveTlLang = useAtomValue(tldexLanguageAtom);
  const id = searchParams.get("id") || "";
  const editorLanguage = searchParams.get("tleditor-language");
  const creditName = searchParams.get("caption-by");
  const user = useAtomValue(userAtom);

  const [urlField, setUrlField] = useState<string>(id);
  const [language, setLanguage] = useState<string>(
    editorLanguage || liveTlLang,
  );
  const [caption, setCaption] = useState<string>(
    creditName || user?.username || "",
  );
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = videoURLtoID(urlField);
    if (!videoId) {
      alert("Invalid video URL [" + urlField + "]");
      return;
    }
    const params = new URLSearchParams();
    params.set("id", videoId);
    if (language) params.set("tleditor-language", language);
    if (caption) params.set("caption-by", caption);
    navigate("?" + params.toString());
  };

  return (
    <div className="content">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="videoId">Video ID or URL</Label>
          <Input
            id="videoId"
            value={urlField}
            onChange={(e) => setUrlField(e.target.value)}
            placeholder="Enter video ID or URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Editor Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {CLIPPER_LANGS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Credit your captions under:</Label>
          <Input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter caption creator's name"
          />
        </div>

        <Button type="submit" className="w-full">
          Start
        </Button>
      </form>
    </div>
  );
}
