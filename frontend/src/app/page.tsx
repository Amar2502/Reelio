"use client";
import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPreviews, setSelectedPreviews] = useState<{ [key: number]: string }>({});
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const generateScript = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Crafting your story...");
      const res = await fetch(`${API_BASE}/generate_script/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setScript(data);
      setStep(1);
      setLoadingMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  const getPreviewUrls = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Finding perfect visuals...");
      const res = await fetch(`${API_BASE}/get_previews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      const data = await res.json();
      setScript(data);
      setStep(2);
      setLoadingMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to get preview URLs");
    } finally {
      setLoading(false);
    }
  };

  const downloadFiles = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Downloading selected visuals...");
      const res = await fetch(`${API_BASE}/download_selected_visuals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      const data = await res.json();
      setScript(data);
      setStep(3);
      setLoadingMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to download files");
    } finally {
      setLoading(false);
    }
  };

  const generateAudio = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Generating voice narration...");
      const res = await fetch(`${API_BASE}/generate_audio/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...script, voice_name: selectedVoice }),
      });
      const data = await res.json();
      setAudioUrl(data.audio_url);
      setScript(data);
      setStep(4);
      setLoadingMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Composing final video...");
      const res = await fetch(`${API_BASE}/generate_video/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(script),
      });
      const data = await res.json();
      setVideoUrl(data.final_video_url);
      setStep(5);
      setLoadingMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#010014",
      color: "#F4F5F5",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #7E7F83",
        padding: "24px 32px",
        background: "linear-gradient(180deg, #010014 0%, rgba(1,0,20,0.8) 100%)"
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: "700",
          background: "linear-gradient(135deg, #F2C94C 0%, #F4F5F5 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          AI Video Generator
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#7E7F83", fontSize: "14px" }}>
          Create stunning videos in minutes
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          {["Script", "Visuals", "Voice", "Audio", "Video"].map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                margin: "0 auto 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: step > i ? "#F2C94C" : step === i ? "rgba(242,201,76,0.3)" : "#7E7F83",
                color: step >= i ? "#010014" : "#F4F5F5",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}>
                {step > i ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: "12px", color: step >= i ? "#F2C94C" : "#7E7F83" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          height: "4px",
          background: "#7E7F83",
          borderRadius: "2px",
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, #F2C94C 0%, #F4F5F5 100%)",
            width: `${(step / 5) * 100}%`,
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          margin: "0 32px 24px",
          padding: "16px",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px",
          color: "#ef4444"
        }}>
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(1,0,20,0.85)",
          backdropFilter: "blur(4px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid #7E7F83",
            borderTop: "4px solid #F2C94C",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ marginTop: "24px", fontSize: "18px", color: "#F2C94C", fontWeight: "600" }}>
            {loadingMessage}
          </p>


          {(loadingMessage.includes("voice") || loadingMessage.includes("audio")) && (
            <div
              style={{
                marginTop: "20px",
                maxWidth: "400px",
                padding: "20px",
                background: "rgba(126,127,131,0.1)",
                border: "1px solid #7E7F83",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#F2C94C",
                  fontWeight: "600",
                  marginBottom: "12px",
                  marginTop: 0,
                }}
              >
                🎧 Generating Studio-Quality Voice (3-4 mins)
              </p>
              <div
                style={{ fontSize: "13px", color: "#7E7F83", lineHeight: "1.6" }}
              >
                <p style={{ margin: "0 0 8px 0" }}>
                  🔊 <span style={{ color: "#F4F5F5" }}>Did you know?</span> AI voices are
                  built by mapping text into phonemes and predicting tone, pitch, and
                  breath — frame by frame!
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  🧠 <span style={{ color: "#F4F5F5" }}>Hack:</span> You can use
                  punctuation creatively ("...", "—", "!") to control pauses and emotion
                  in generated speech.
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  🎛️ <span style={{ color: "#F4F5F5" }}>Pro Tip:</span> "Sam" gives a
                  neutral tone, "Jess" is expressive, and "Mike" fits narration — try
                  mixing them per scene.
                </p>
                <p style={{ margin: "0" }}>
                  ☕ <span style={{ color: "#F4F5F5" }}>While you wait:</span> adjust
                  subtitles or pick a background score for your final cut.
                </p>
              </div>
            </div>
          )}

          {(loadingMessage.includes("video") || loadingMessage.includes("Composing")) && (
            <div
              style={{
                marginTop: "20px",
                maxWidth: "400px",
                padding: "20px",
                background: "rgba(126,127,131,0.1)",
                border: "1px solid #7E7F83",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#F2C94C",
                  fontWeight: "600",
                  marginBottom: "12px",
                  marginTop: 0,
                }}
              >
                🎥 Rendering Final Video (4-6 mins)
              </p>
              <div
                style={{ fontSize: "13px", color: "#7E7F83", lineHeight: "1.6" }}
              >
                <p style={{ margin: "0 0 8px 0" }}>
                  💡 <span style={{ color: "#F4F5F5" }}>Did you know?</span> Your video is
                  being stitched frame-by-frame, synchronized with audio timing at 24–30 fps.
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  ⚙️ <span style={{ color: "#F4F5F5" }}>Pro Tip:</span> Close unused tabs
                  and apps — frees CPU & GPU threads for faster render.
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  🧩 <span style={{ color: "#F4F5F5" }}>Hack:</span> Keep renders organized
                  by version (e.g., <code>BlackHoles_v2.mp4</code>) so you can A/B test
                  improvements later.
                </p>
                <p style={{ margin: "0" }}>
                  🚀 <span style={{ color: "#F4F5F5" }}>Next step:</span> Once it's done,
                  share directly or feed it back for auto-caption generation.
                </p>
              </div>
            </div>
          )}

          {!loadingMessage.includes("voice") &&
            !loadingMessage.includes("audio") &&
            !loadingMessage.includes("video") &&
            !loadingMessage.includes("Composing") && (
              <p style={{ marginTop: "8px", fontSize: "14px", color: "#7E7F83" }}>
                This may take a moment...
              </p>
            )}

          <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "0 32px 32px" }}>
        {/* STEP 0 - Initial Prompt */}
        {step === 0 && (
          <div style={{
            maxWidth: "800px",
            margin: "40px auto",
            animation: "fadeIn 0.5s ease"
          }}>
            <div style={{
              background: "rgba(126,127,131,0.1)",
              border: "1px solid #7E7F83",
              borderRadius: "12px",
              padding: "32px"
            }}>
              <h2 style={{
                marginTop: 0,
                fontSize: "22px",
                color: "#F2C94C",
                marginBottom: "8px"
              }}>
                What video would you like to create?
              </h2>
              <p style={{ color: "#7E7F83", fontSize: "14px", marginBottom: "24px" }}>
                Describe your video idea and we'll generate a complete script
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A motivational video about pursuing your dreams..."
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "16px",
                  background: "#010014",
                  border: "2px solid #7E7F83",
                  borderRadius: "8px",
                  color: "#F4F5F5",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#F2C94C"}
                onBlur={(e) => e.target.style.borderColor = "#7E7F83"}
              />
              <button
                onClick={generateScript}
                disabled={!prompt.trim()}
                style={{
                  marginTop: "16px",
                  padding: "14px 32px",
                  background: prompt.trim() ? "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)" : "#7E7F83",
                  color: "#010014",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: prompt.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  if (prompt.trim()) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(242,201,76,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Generate Script ✨
              </button>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}

        {/* STEP 1 - Show Script */}
        {step === 1 && script && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
            <div style={{
              background: "rgba(126,127,131,0.1)",
              border: "1px solid #7E7F83",
              borderRadius: "12px",
              padding: "32px",
              marginBottom: "24px"
            }}>
              <h2 style={{
                marginTop: 0,
                color: "#F2C94C",
                fontSize: "28px",
                marginBottom: "12px"
              }}>
                {script.title}
              </h2>
              <p style={{ color: "#7E7F83", fontSize: "16px", lineHeight: "1.6" }}>
                {script.description}
              </p>
            </div>

            {Array.isArray(script.scenes) && script.scenes.map((s: any, i: number) => (
              <div key={i} style={{
                background: "rgba(126,127,131,0.05)",
                border: "1px solid #7E7F83",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "12px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#F2C94C",
                    color: "#010014",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "14px"
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    flex: 1,
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap"
                  }}>
                    {s.keyword?.map((kw: string, ki: number) => (
                      <span key={ki} style={{
                        padding: "4px 12px",
                        background: "rgba(242,201,76,0.2)",
                        border: "1px solid #F2C94C",
                        borderRadius: "16px",
                        fontSize: "12px",
                        color: "#F2C94C"
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <p style={{
                  color: "#F4F5F5",
                  lineHeight: "1.8",
                  fontSize: "15px",
                  margin: 0
                }}>
                  {s.voiceover}
                </p>
              </div>
            ))}

            <button
              onClick={getPreviewUrls}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)",
                color: "#010014",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(242,201,76,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Find Visuals 🎬
            </button>
          </div>
        )}

        {/* STEP 2 - Preview Selection with Script */}
        {step === 2 && script && (
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <h2 style={{ color: "#F2C94C", marginBottom: "24px", fontSize: "24px" }}>
              Select Your Visuals
            </h2>

            {script.scenes?.map((s: any, i: number) => (
              <div key={i} style={{
                background: "rgba(126,127,131,0.05)",
                border: "1px solid #7E7F83",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#F2C94C",
                    color: "#010014",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "16px",
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "12px"
                    }}>
                      {s.keyword?.map((kw: string, ki: number) => (
                        <span key={ki} style={{
                          padding: "4px 12px",
                          background: "rgba(242,201,76,0.2)",
                          border: "1px solid #F2C94C",
                          borderRadius: "16px",
                          fontSize: "12px",
                          color: "#F2C94C"
                        }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                    <p style={{
                      color: "#F4F5F5",
                      lineHeight: "1.6",
                      fontSize: "14px",
                      margin: 0
                    }}>
                      {s.voiceover}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "16px",
                  marginTop: "20px"
                }}>
                  {s.preview_urls?.map((url: string, j: number) => (
                    <div
                      key={j}
                      onClick={() => {
                        setSelectedPreviews((prev) => ({
                          ...prev,
                          [i]: url,
                        }));
                        setScript((prev: any) => {
                          const updated = { ...prev };
                          if (updated.scenes && updated.scenes[i]) {
                            updated.scenes[i].selected_url = url;
                          }
                          return updated;
                        });
                      }}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        borderRadius: "8px",
                        overflow: "visible",
                        border: selectedPreviews[i] === url ? "3px solid #F2C94C" : "2px solid #7E7F83",
                        transition: "all 0.3s ease",
                        background: "#010014",
                        zIndex: selectedPreviews[i] === url ? 10 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPreviews[i] !== url) {
                          e.currentTarget.style.borderColor = "#F2C94C";
                        }
                        e.currentTarget.style.transform = "scale(1.4)";
                        e.currentTarget.style.zIndex = "100";
                        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.6)";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPreviews[i] !== url) {
                          e.currentTarget.style.borderColor = "#7E7F83";
                        }
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.zIndex = selectedPreviews[i] === url ? "10" : "1";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <video
                        src={url}
                        style={{ width: "100%", display: "block", borderRadius: "6px" }}
                        muted
                        loop
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseLeave={(e) => {
                          const vid = e.currentTarget as HTMLVideoElement;
                          vid.pause();
                          vid.currentTime = 0;
                        }}
                      />
                      {selectedPreviews[i] === url && (
                        <div style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#F2C94C",
                          color: "#010014",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "14px"
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={downloadFiles}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)",
                color: "#010014",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                width: "100%"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(242,201,76,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Continue with Selected Visuals →
            </button>
          </div>
        )}

        {/* STEP 3 - Voice Selection */}
        {step === 3 && (
          <div style={{ maxWidth: "600px", margin: "40px auto" }}>
            <div style={{
              background: "rgba(126,127,131,0.1)",
              border: "1px solid #7E7F83",
              borderRadius: "12px",
              padding: "32px"
            }}>
              <h2 style={{
                marginTop: 0,
                color: "#F2C94C",
                fontSize: "22px",
                marginBottom: "8px"
              }}>
                Choose Your Voice
              </h2>
              <p style={{ color: "#7E7F83", fontSize: "14px", marginBottom: "24px" }}>
                Select a voice for your video narration
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                    { value: "jess", label: "Jess", desc: "Warm, natural, and friendly — ideal for storytelling and explainer videos. 🌟 (Recommended)" },
                    { value: "tara", label: "Tara", desc: "Professional, clear, and confident — perfect for tutorials, ads, or narration. ✅ (Recommended)" },
                    { value: "leah", label: "Leah", desc: "Bright and expressive — great for upbeat, energetic scenes or product promos." },
                    { value: "leo", label: "Leo", desc: "Bold and charismatic — adds impact to trailers and dynamic content." },
                    { value: "dan", label: "Dan", desc: "British accent with a calm, articulate tone — perfect for documentaries or classy narration." },
                    { value: "mia", label: "Mia", desc: "Youthful and lively — fits social reels, vlogs, and conversational AI voices." },
                    { value: "zac", label: "Zac", desc: "Energetic, confident, and modern — works well for tech explainers and ads." },
                    { value: "zoe", label: "Zoe", desc: "Soft yet expressive — ideal for emotional storytelling and cinematic scripts." },
                ].map((voice) => (
                  <div
                    key={voice.value}
                    onClick={() => setSelectedVoice(voice.value)}
                    style={{
                      padding: "16px",
                      background: selectedVoice === voice.value ? "rgba(242,201,76,0.2)" : "rgba(126,127,131,0.05)",
                      border: selectedVoice === voice.value ? "2px solid #F2C94C" : "2px solid #7E7F83",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedVoice !== voice.value) {
                        e.currentTarget.style.borderColor = "#F2C94C";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedVoice !== voice.value) {
                        e.currentTarget.style.borderColor = "#7E7F83";
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: selectedVoice === voice.value ? "#F2C94C" : "#F4F5F5",
                          marginBottom: "4px"
                        }}>
                          {voice.label}
                        </div>
                        <div style={{ fontSize: "13px", color: "#7E7F83" }}>
                          {voice.desc}
                        </div>
                      </div>
                      {selectedVoice === voice.value && (
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#F2C94C",
                          color: "#010014",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "14px"
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={generateAudio}
                disabled={!selectedVoice}
                style={{
                  marginTop: "24px",
                  padding: "14px 32px",
                  background: selectedVoice ? "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)" : "#7E7F83",
                  color: "#010014",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: selectedVoice ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  if (selectedVoice) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(242,201,76,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Generate Audio 🎙️
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 - Audio Preview */}
        {step === 4 && (
          <div style={{ maxWidth: "600px", margin: "40px auto" }}>
            <div style={{
              background: "rgba(126,127,131,0.1)",
              border: "1px solid #7E7F83",
              borderRadius: "12px",
              padding: "32px"
            }}>
              <h2 style={{
                marginTop: 0,
                color: "#F2C94C",
                fontSize: "22px",
                marginBottom: "8px"
              }}>
                Preview Your Audio
              </h2>
              <p style={{ color: "#7E7F83", fontSize: "14px", marginBottom: "24px" }}>
                Listen to your narration before creating the final video
              </p>

              {audioUrl && (
                <div style={{
                  background: "rgba(126,127,131,0.1)",
                  border: "1px solid #7E7F83",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "24px"
                }}>
                  <audio
                    controls
                    style={{
                      width: "100%",
                      filter: "brightness(0.9) contrast(1.1)"
                    }}
                  >
                    <source src={audioUrl} type="audio/wav" />
                  </audio>
                </div>
              )}

              <button
                onClick={generateVideo}
                style={{
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)",
                  color: "#010014",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(242,201,76,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Create Final Video 🎬
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 - Final Video */}
        {step === 5 && (
          <div style={{ maxWidth: "900px", margin: "40px auto" }}>
            <div style={{
              background: "rgba(126,127,131,0.1)",
              border: "1px solid #7E7F83",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}>
                🎉
              </div>
              <h2 style={{
                marginTop: 0,
                color: "#F2C94C",
                fontSize: "28px",
                marginBottom: "12px"
              }}>
                Your Video is Ready!
              </h2>
              <p style={{
                color: "#7E7F83",
                fontSize: "16px",
                marginBottom: "32px",
                maxWidth: "500px",
                margin: "0 auto 32px"
              }}>
                Your AI-generated video has been created successfully. Preview it below or download it to share.
              </p>

              {videoUrl && (
                <div style={{
                  background: "#010014",
                  border: "2px solid #7E7F83",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "24px",
                  overflow: "hidden",
                  maxWidth: "640px",
                  margin: "0 auto 24px"
                }}>
                  <video
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "360px",
                      borderRadius: "8px",
                      display: "block"
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <a
                  href={videoUrl}
                  download="ai-generated-video.mp4"
                  style={{
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #F2C94C 0%, #e6b840 100%)",
                    color: "#010014",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(242,201,76,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Download Video 📥
                </a>

                <button
                  onClick={() => {
                    setPrompt("");
                    setScript(null);
                    setStep(0);
                    setError("");
                    setSelectedPreviews({});
                    setSelectedVoice("");
                    setAudioUrl("");
                    setVideoUrl("");
                  }}
                  style={{
                    padding: "14px 32px",
                    background: "rgba(126,127,131,0.2)",
                    color: "#F4F5F5",
                    border: "2px solid #7E7F83",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#F2C94C";
                    e.currentTarget.style.background = "rgba(242,201,76,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#7E7F83";
                    e.currentTarget.style.background = "rgba(126,127,131,0.2)";
                  }}
                >
                  Create Another Video ✨
                </button>
              </div>

              {script && (
                <div style={{
                  marginTop: "32px",
                  padding: "24px",
                  background: "rgba(126,127,131,0.05)",
                  border: "1px solid #7E7F83",
                  borderRadius: "8px",
                  textAlign: "left"
                }}>
                  <h3 style={{
                    color: "#F2C94C",
                    fontSize: "18px",
                    marginTop: 0,
                    marginBottom: "16px"
                  }}>
                    Video Details
                  </h3>
                  <div style={{ color: "#F4F5F5", fontSize: "14px", lineHeight: "1.8" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#7E7F83" }}>Title:</span> {script.title}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#7E7F83" }}>Scenes:</span> {script.scenes?.length || 0}
                    </div>
                    <div>
                      <span style={{ color: "#7E7F83" }}>Voice:</span> {selectedVoice}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}