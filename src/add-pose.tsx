import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, geminiApi } from "../config/firebase";

interface AddPoseModalProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
}

interface GeminiResponse {
  breathe: "inhale" | "exhale";
  posture: string;
}

export function AddPoseModal({
  showAddModal,
  setShowAddModal,
}: AddPoseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchingWithGemini, setSearchingWithGemini] = useState(false);
  const [newPose, setNewPose] = useState({
    name: "",
    breathe: "inhale" as "inhale" | "exhale",
    posture: "",
  });

  const handleGeminiSearch = async () => {
    if (!newPose.name) return;

    setSearchingWithGemini(true);
    setError("");

    try {
      const prompt = `For the yoga pose "${newPose.name}", please provide:
      1. Whether it's primarily an inhale or exhale pose (just respond with either "inhale" or "exhale")
      2. A detailed description of the posture and how to perform it.
      Format the response as JSON with keys "breathe" and "posture". The posture should be string.
      
	  Response format: JSON

      Example response:
      {
        "breathe": "exhale|inhale",
        "posture": "string"
      }`;

      const result = await geminiApi(prompt);

      try {
        const poseDetails = result as GeminiResponse;
        if (poseDetails.breathe && poseDetails.posture) {
          setNewPose({
            ...newPose,
            breathe: poseDetails.breathe,
            posture: poseDetails.posture,
          });
        }
      } catch (parseErr) {
        console.error("Error parsing Gemini response:", parseErr);
        setError("Failed to parse pose details. Please try manually.");
      }
    } catch (err) {
      console.error("Error getting pose details from Gemini:", err);
      setError("Failed to get pose details. Please try manually.");
    } finally {
      setSearchingWithGemini(false);
    }
  };

  const handleAddPose = async () => {
    if (!newPose.name || !newPose.breathe || !newPose.posture) return;

    setLoading(true);
    setError("");

    try {
      const posesCollection = collection(db, "poses");
      await addDoc(posesCollection, newPose);

      // Reset form
      setNewPose({
        name: "",
        breathe: "inhale",
        posture: "",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding pose:", err);
      setError("Failed to add pose. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showAddModal) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal show d-block" style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Yoga Pose</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Pose Name</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={newPose.name}
                    onChange={(e) =>
                      setNewPose({ ...newPose, name: e.target.value })
                    }
                    placeholder="Enter pose name"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleGeminiSearch}
                    disabled={searchingWithGemini || !newPose.name}
                  >
                    {searchingWithGemini ? "..." : "✨"}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Breathe</label>
                <select
                  className="form-select"
                  value={newPose.breathe}
                  onChange={(e) =>
                    setNewPose({
                      ...newPose,
                      breathe: e.target.value as "inhale" | "exhale",
                    })
                  }
                >
                  <option value="inhale">Inhale</option>
                  <option value="exhale">Exhale</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Posture</label>
                <textarea
                  className="form-control"
                  value={newPose.posture}
                  onChange={(e) =>
                    setNewPose({ ...newPose, posture: e.target.value })
                  }
                  placeholder="Enter pose description"
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddPose}
                disabled={
                  loading ||
                  !newPose.name ||
                  !newPose.breathe ||
                  !newPose.posture
                }
              >
                {loading ? "Adding..." : "Add Pose"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
