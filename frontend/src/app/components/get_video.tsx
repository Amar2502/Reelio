import React from "react";
import { ScriptResponse, API_BASE } from "../types";

type Props = {
  script: ScriptResponse;
  setStep: (v: number) => void;
  setShowLoader: (v: "video" | null) => void;
};

export default function FinalVideoSection({ script, setShowLoader }: Props) {
  const handleGenerateVideo = async () => {
    try {
      setShowLoader("video");
      await fetch(`${API_BASE}/generate_video/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      alert("Video generation started!");
    } finally {
      setShowLoader(null);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateVideo}>Generate Final Video</button>
    </div>
  );
}
