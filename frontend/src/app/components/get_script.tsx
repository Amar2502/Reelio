import React, { useState } from "react";
import { ScriptResponse, API_BASE } from "../types";

type Props = {
  setScript: (val: ScriptResponse) => void;
  setStep: (v: number) => void;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
  loading: boolean;
};

export default function GenerateScriptSection({
  setScript,
  setStep,
  setError,
  setLoading,
  loading,
}: Props) {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/generate_script/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setScript(data);
      setStep(2);
    } catch {
      setError("Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Enter your idea..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Script"}
      </button>
    </div>
  );
}
