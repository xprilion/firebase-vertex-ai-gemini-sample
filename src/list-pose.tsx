import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, generateImage } from "../config/firebase";
import { Row, Col, Card, Badge, Modal, Button } from "react-bootstrap";

interface Pose {
  id: string;
  name: string;
  breathe: "inhale" | "exhale";
  posture: string;
}

interface PoseListProps {
  searchResults: Pose[] | null;
  isSearching: boolean;
  searchError: string;
}

export function PoseList({
  searchResults,
  isSearching,
  searchError,
}: PoseListProps) {
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{
    mimeType: string;
    bytesBase64Encoded: string;
  } | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    const posesCollection = collection(db, "poses");

    const unsubscribe = onSnapshot(
      posesCollection,
      (snapshot) => {
        const posesList = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Pose)
        );
        setPoses(posesList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching poses:", err);
        setError("Failed to load poses. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedPose) {
      handleGenerateImage();
    }
  }, [selectedPose]);

  const handleGenerateImage = async () => {
    if (!selectedPose) return;

    setGeneratingImage(true);
    try {
      // Split posture into steps
      const steps = selectedPose.posture
        .split("\n")
        .filter((step) => step.trim());

      // Create a prompt that includes all steps in a single image
      const prompt = `Create a yoga instruction pamphlet style image for the pose "${
        selectedPose.name
      }". 
        Make it a clean, minimalist clipart style drawing with clear lines and basic shapes.
        Divide the image into ${
          steps.length
        } panels arranged vertically, each showing a step of the pose.
        
        For each panel:
        ${steps
          .map(
            (step, index) => `
        Panel ${index + 1}: Show a figure demonstrating "${step}". 
        Add text "Step ${index + 1}" and "${
              selectedPose.breathe
            }" below the figure.`
          )
          .join("\n")}
        
        Make it look like a professional yoga instruction diagram with all steps visible in a single image.
        Use a clean layout with clear separation between steps.`;

      const imageData = await generateImage(prompt);
      setGeneratedImage(imageData);
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setGeneratingImage(false);
    }
  };

  if (isSearching) {
    return <div className="text-center py-4">Searching poses...</div>;
  }

  if (searchError) {
    return <div className="alert alert-danger">{searchError}</div>;
  }

  if (loading) {
    return <div className="text-center py-4">Loading poses...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const displayPoses = searchResults || poses;

  if (displayPoses.length === 0) {
    return (
      <div className="alert alert-info">
        {searchResults
          ? "No poses found matching your search."
          : "No poses found in the database."}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="mb-4">Poses</h3>

      <Row className="g-4">
        {displayPoses.map((pose) => (
          <Col key={pose.id} className="col-md-4">
            <Card
              className="h-100 shadow-sm hover-shadow"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedPose(pose);
                setGeneratedImage(null);
              }}
            >
              <div
                className="bg-light"
                style={{
                  height: "200px",
                  backgroundImage: "url('https://placehold.co/600x400/png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <Card.Title
                    className="mb-0"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.2",
                      maxHeight: "2.4rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {pose.name}
                  </Card.Title>
                  <Badge
                    bg={pose.breathe === "inhale" ? "info" : "success"}
                    style={{ minWidth: "60px", textAlign: "center" }}
                  >
                    {pose.breathe}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        show={!!selectedPose}
        onHide={() => setSelectedPose(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedPose?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Badge
            bg={selectedPose?.breathe === "inhale" ? "info" : "success"}
            className="mb-3"
          >
            {selectedPose?.breathe}
          </Badge>

          {generatingImage ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Generating pose pamphlet...</p>
            </div>
          ) : generatedImage ? (
            <div className="mb-4">
              <img
                src={`data:${generatedImage.mimeType};base64,${generatedImage.bytesBase64Encoded}`}
                alt={selectedPose?.name}
                className="img-fluid rounded"
              />
            </div>
          ) : null}

          <p className="mb-0" style={{ whiteSpace: "pre-line" }}>
            {selectedPose?.posture}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleGenerateImage}
            disabled={generatingImage}
          >
            Regenerate Pamphlet
          </Button>
          <Button variant="secondary" onClick={() => setSelectedPose(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
