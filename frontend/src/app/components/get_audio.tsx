import React from "react";
import { ScriptResponse, API_BASE } from "../types";

type Props = {
  script: ScriptResponse;
  setScript: (val: ScriptResponse) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  setShowLoader: (v: "audio" | null) => void;
  setStep: (v: number) => void;
};

export default function AudioSection({
  script,
  setScript,
  selectedVoice,
  setSelectedVoice,
  setShowLoader,
  setStep,
}: Props) {
  const generateAudio = async () => {
    try {
      setShowLoader("audio");
      const res = await fetch(`${API_BASE}/generate_audio/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...script, voice: selectedVoice }),
      });
      const data = await res.json();
      setScript(data);
      setStep(4);
    } finally {
      setShowLoader(null);
    }
  };

  return (
    <div>
      <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
        <option value="alloy">Alloy</option>
        <option value="verse">Verse</option>
      </select>
      <button onClick={generateAudio}>Generate Audio</button>
    </div>
  );
}
