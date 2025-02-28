import { useState } from "react";
import { PoseList } from "./list-pose";
import { AddPoseModal } from "./add-pose";
import { FindPose } from "./find-pose";
import { Container, Navbar, Button } from "react-bootstrap";

interface Pose {
  id: string;
  name: string;
  breathe: "inhale" | "exhale";
  posture: string;
}

function App() {
  const [showAddModal, setShowAddModal] = useState(false);

  // State for pose search
  const [searchResults, setSearchResults] = useState<Pose[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container style={{ maxWidth: "800px" }}>
          <Navbar.Brand>Yoga Pose Explorer</Navbar.Brand>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Pose
          </Button>
        </Container>
      </Navbar>

      <Container className="pb-5" style={{ maxWidth: "800px" }}>
        <div className="bg-white rounded-3 shadow-sm p-4">
          <h3 className="mb-4">Find Pose</h3>
          <FindPose
            onSearchResults={setSearchResults}
            onSearchStateChange={(loading, error) => {
              setIsSearching(loading);
              setSearchError(error);
            }}
          />

          <PoseList
            searchResults={searchResults}
            isSearching={isSearching}
            searchError={searchError}
          />
        </div>
      </Container>

      <AddPoseModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
      />
    </div>
  );
}

export default App;
