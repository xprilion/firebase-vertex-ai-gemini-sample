import { useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, querySearch } from "../config/firebase";
import { InputGroup, Form, Button } from "react-bootstrap";

interface Pose {
  id: string;
  name: string;
  breathe: "inhale" | "exhale";
  posture: string;
}

interface FindPoseProps {
  onSearchResults: (results: Pose[]) => void;
  onSearchStateChange: (loading: boolean, error: string) => void;
}

interface VectorResults {
  ids: string[];
}

export function FindPose({
  onSearchResults,
  onSearchStateChange,
}: FindPoseProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    onSearchStateChange(true, "");

    try {
      const posesCollection = collection(db, "poses");
      const querySnapshot = await getDocs(posesCollection);

      const allPoses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pose, "id">),
      }));

      let results: Pose[] = [];

      if (!searchTerm.trim()) {
        results = allPoses;
      } else {
        const searchTermLower = searchTerm.toLowerCase();

        // Regular search
        const filteredResults = allPoses.filter(
          (pose) =>
            pose.name.toLowerCase().includes(searchTermLower) ||
            pose.posture.toLowerCase().includes(searchTermLower) ||
            pose.breathe.toLowerCase().includes(searchTermLower)
        );

        // Vector search for posture descriptions
        const vectorResults = (await querySearch(searchTerm)) as VectorResults;

        // Fetch documents for vector search results
        const vectorPoses: Pose[] = [];
        if (vectorResults?.ids && Array.isArray(vectorResults.ids)) {
          for (const id of vectorResults.ids) {
            const docRef = doc(db, "poses", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              vectorPoses.push({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Pose, "id">),
              });
            }
          }
        }

        const vectorPoseIds = new Set(vectorPoses.map((pose) => pose.id));

        // Combine results, prioritizing vector search matches
        results = [
          ...vectorPoses,
          ...filteredResults.filter((pose) => !vectorPoseIds.has(pose.id)),
        ];
      }

      onSearchResults(results);
      onSearchStateChange(false, "");
    } catch (err) {
      console.error("Error searching poses:", err);
      onSearchStateChange(false, "Failed to search poses. Please try again.");
    }
  };

  return (
    <InputGroup className="mb-4">
      <Form.Control
        placeholder="Search poses by name, posture, or breath type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
      <Button variant="primary" onClick={handleSearch}>
        Search
      </Button>
    </InputGroup>
  );
}
