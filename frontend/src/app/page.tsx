"use client";

import React, { useState } from "react";

type Scene = {
  voiceover: string;
  keyword: string[];
  preview_urls?: string[];
  selected_url?: string;
  downloaded_files?: string[];
};

type ScriptResponse = {
  title: string;
  total_estimated_time?: string;
  description?: string;
  scenes: Scene[];
  voice_name?: string;
  audio_path?: string;
  audio_url?: string;
  final_video_url?: string;
  final_video_path?: string;
};

const API_BASE = "http://127.0.0.1:8000";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("tara");

  const handleGenerateScript = async () => {
    setError("");
    if (!prompt.trim()) return setError("Enter a topic first.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate_script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Script generation failed");
      const data = await res.json();
      console.log("Data from generate script: ", data);
      setScript(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate script.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPreviews = async () => {
    if (!script) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/get_urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error("Preview fetch failed");
      const data = await res.json();
      console.log("Data from get previews: ", data);
      setScript(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch previews.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreview = (sceneIdx: number, url: string) => {
    if (!script) return;
    const scenes = script.scenes.map((s, i) =>
      i === sceneIdx ? { ...s, selected_url: url } : s
    );
    setScript({ ...script, scenes });
  };

  const handleDownloadSelected = async () => {
    if (!script) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/download_selected_visuals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error("Download failed");
      const data = await res.json();
      console.log("Data from download selected visuals: ", data);
      setScript(data);
    } catch (err) {
      console.error(err);
      setError("Failed to download visuals.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!script) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/generate_audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error("Audio generation failed");
      const data = await res.json();
      console.log("Data from generate audio: ", data);
      setScript({ ...script, audio_path: data.audio_path });
    } catch (err) {
      console.error(err);
      setError("Failed to generate audio.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!script) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/generate_video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      if (!res.ok) throw new Error("Video generation failed");
      const data = await res.json();
      console.log("Data from generate video: ", data);
      setScript({ ...script, final_video_path: data.final_video_path });
    } catch (err) {
      console.error(err);
      setError("Failed to generate video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Reelio (Simplified)</h1>
      <p>{error && <b style={{ color: "red" }}>{error}</b>}</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter video idea..."
        style={{ width: "100%", height: 80 }}
      />
      <br />
      <button onClick={handleGenerateScript} disabled={loading}>
        Generate Script
      </button>

      {script && (
        <>
          <h3>Title: {script.title}</h3>
          <p>{script.description}</p>
          <button onClick={handleFetchPreviews}>Get Visuals</button>

          {script.scenes?.map((scene, idx) => (
            <div key={idx} style={{ border: "1px solid gray", marginTop: 10 }}>
              <p>Scene {idx + 1}: {scene.voiceover}</p>
              {scene.preview_urls?.map((url, uidx) => (
                <div key={uidx}>
                  <img
                    src={url}
                    alt={`Preview ${uidx}`}
                    style={{
                      width: 120,
                      height: 80,
                      border:
                        scene.selected_url === url ? "2px solid purple" : "1px solid gray",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSelectPreview(idx, url)}
                  />
                </div>
              ))}
            </div>
          ))}

          <button onClick={handleDownloadSelected}>Download Selected Visuals</button>

          <div style={{ marginTop: 10 }}>
            <label>Voice: </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              <option value="tara">Tara</option>
              <option value="leo">Leo</option>
            </select>
            <button onClick={handleGenerateAudio}>Generate Audio</button>
            {script.audio_url && (
              <div style={{ marginTop: 10 }}>
                <h4>Audio:</h4>
                <audio controls src={script.audio_url} />
              </div>
            )}
          </div>

          <button onClick={handleGenerateVideo} style={{ marginTop: 10 }}>
            Generate Video
          </button>

          {script.final_video_url && (
            <div style={{ marginTop: 20 }}>
              <h4>Final Video:</h4>
              <video controls src={script.final_video_url} width="400" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
