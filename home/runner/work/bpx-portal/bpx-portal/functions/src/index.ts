/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {onRequest} from "firebase-functions/v2/https";

// This is the simplest way to solve CORS issues.
// It allows requests from any origin.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({origin: true});

// Initialize Firebase Admin SDK
initializeApp();

/**
 * Checks if a user has an 'Admin' role.
 * This function uses the `cors` middleware to handle cross-origin requests.
 */
exports.checkAdminStatus = onRequest(async (request, response) => {
  // Pass the request to the cors middleware to handle CORS headers.
  cors(request, response, async () => {
    // Check for an authorization header.
    if (
      !request.headers.authorization ||
      !request.headers.authorization.startsWith("Bearer ")
    ) {
      response.status(403).send("Unauthorized: No token provided.");
      return;
    }

    // Extract the ID token from the authorization header.
    const idToken = request.headers.authorization.split("Bearer ")[1];

    try {
      // Verify the ID token to get the user's UID.
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Get the user's document from Firestore.
      const userDoc = await getFirestore().collection("users").doc(uid).get();

      if (!userDoc.exists) {
        // The user document does not exist.
        response.status(404).send({isAdmin: false, error: "User not found."});
        return;
      }

      const userData = userDoc.data();
      const isAdmin = userData?.role === "Admin";

      // Send the response.
      response.status(200).send({isAdmin});
    } catch (error) {
      // Handle errors (e.g., invalid token).
      console.error("Error verifying token or checking admin status:", error);
      response.status(500).send({isAdmin: false, error: "Internal Server Error"});
    }
  });
});
