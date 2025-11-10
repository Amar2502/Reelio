import React from "react";
import { ScriptResponse, API_BASE } from "../types";

type Props = {
  script: ScriptResponse;
  setScript: (val: ScriptResponse) => void;
  setStep: (v: number) => void;
};

export default function VisualPreviewSection({ script, setScript, setStep }: Props) {
  const handleGenerate = async () => {
    const res = await fetch(`${API_BASE}/generate_previews/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(script),
    });
    const data = await res.json();
    setScript(data);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Previews</button>
      {script?.scenes?.map((scene, i) => (
        <div key={i}>
          <p>{scene.voiceover}</p>
          {scene.preview_urls?.map((url, j) => (
            <button
              key={j}
              onClick={() => {
                scene.selected_url = url;
                setScript({ ...script });
              }}
            >
              Select {j + 1}
            </button>
          ))}
        </div>
      ))}
      <button onClick={() => setStep(3)}>Next: Audio</button>
    </div>
  );
}
