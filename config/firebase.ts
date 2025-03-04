import { initializeApp } from "firebase/app";
import {
  getVertexAI,
  getGenerativeModel,
  getImagenModel,
} from "@firebase/vertexai";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, signInAnonymously } from "firebase/auth";

// import { Firestore } from "@google-cloud/firestore ";
// TODO(developer) Replace the following with your app's Firebase configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize FirebaseApp
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);

// Initialize Firebase Functions with the specified region
const functions = getFunctions(firebaseApp, "us-central1");

// Initialize the Vertex AI service
const vertexAI = getVertexAI(firebaseApp);

// Initialize the generative model with a model that supports your use case
// Gemini 1.5 models are versatile and can be used with all API capabilities
const model = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });

// Wrap in an async function so you can use await
async function geminiApi(prompt: string) {
  // To generate text output, call generateContent with the text input
  const result = await model.generateContent(prompt);

  const response = result.response;
  // strip the ```json and ``` from the response
  const text = response.text().replace("```json", "").replace("```", "");
  return JSON.parse(text);
}

const queryCallable = httpsCallable(
  functions,
  "ext-firestore-vector-search-queryCallable"
);

const querySearch = async (query: string) => {
  try {
    await signInAnonymously(auth);
    const result = await queryCallable({ query: query });
    console.log(result.data);
    return result.data;
  } catch (error) {
    console.error("Error querying function:", error);
  }
};

const imagenModel = getImagenModel(vertexAI, {
  model: "imagen-3.0-generate-002",
  // Configure the model to generate multiple images for each request
  // See: https://firebase.google.com/docs/vertex-ai/model-parameters
  generationConfig: {
    numberOfImages: 1,
  },
});

const generateImage = async (prompt: string) => {
  const finalPrompt = `Only stick figure images of yoga poses, no faces, no genders, no children. ${prompt}`;
  const response = await imagenModel.generateImages(finalPrompt);
  // If fewer images were generated than were requested,
  // then `filteredReason` will describe the reason they were filtered out
  if (response.filteredReason) {
    console.log(response.filteredReason);
  }
  if (response.images.length == 0) {
    throw new Error("No images in the response.");
  }
  const images = response.images[0];
  return images;
};

export { geminiApi, db, querySearch, generateImage };
