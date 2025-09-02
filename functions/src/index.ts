import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {https} from "firebase-functions";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors")({origin: true});

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
const auth = getAuth();

/**
 * Checks if a user has an 'Admin' role.
 */
exports.checkAdminStatus = https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    // ✅ Allow preflight OPTIONS request
    if (request.method === "OPTIONS") {
      response.set("Access-Control-Allow-Origin", "https://bpxmaster.com");
      response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    if (
      !request.headers.authorization ||
      !request.headers.authorization.startsWith("Bearer ")
    ) {
      response.status(403).send("Unauthorized: No token provided.");
      return;
    }

    const idToken = request.headers.authorization.split("Bearer ")[1];

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        response.status(404).send({isAdmin: false, error: "User not found."});
        return;
      }

      const userData = userDoc.data();
      const isAdmin = userData?.role === "Admin";
      response.status(200).send({isAdmin});
    } catch (error) {
      console.error("Error verifying token or checking admin status:", error);
      response
        .status(500)
        .send({isAdmin: false, error: "Internal Server Error"});
    }
  });
});

/**
 * Creates a new user from the admin panel.
 */
exports.createUser = https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    // ✅ Allow preflight OPTIONS request
    if (request.method === "OPTIONS") {
      response.set("Access-Control-Allow-Origin", "https://bpxmaster.com");
      response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    // 1. Authenticate the admin making the request
    if (
      !request.headers.authorization ||
      !request.headers.authorization.startsWith("Bearer ")
    ) {
      response.status(403).send("Unauthorized: Admin token required.");
      return;
    }

    const adminIdToken = request.headers.authorization.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(adminIdToken);
      const adminDoc = await db.collection("users").doc(decodedToken.uid).get();
      if (!adminDoc.exists() || adminDoc.data()?.role !== "Admin") {
        response.status(403).send("Forbidden: Not an admin.");
        return;
      }
    } catch (error) {
      console.error("Admin verification failed:", error);
      response.status(403).send("Forbidden: Invalid admin token.");
      return;
    }

    // 2. Create the new user
    const {
      email,
      password,
      fullName,
      balance,
      status,
      role,
      bpexchUsername,
      bpexchPassword,
      adminMessage,
      adminVerified,
    } = request.body;

    if (!email || !password || !fullName) {
      response
        .status(400)
        .send("Missing required fields: email, password, fullName.");
      return;
    }

    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: fullName,
        emailVerified: adminVerified || false,
      });

      const newUser = {
        uid: userRecord.uid,
        fullName,
        email,
        balance: balance || 0,
        status: status || "Pending",
        role: role || "User",
        createdAt: Timestamp.now(),
        bpexchUsername: bpexchUsername || "",
        bpexchPassword: bpexchPassword || "",
        adminMessage: adminMessage || "",
        emailVerified: adminVerified || false,
        adminVerified: adminVerified || false,
      };

      await db.collection("users").doc(userRecord.uid).set(newUser);

      response.status(201).send({success: true, uid: userRecord.uid});
    } catch (error: any) {
      console.error("Error creating new user:", error);
      let message = "An internal error occurred while creating the user.";
      if (error.code === "auth/email-already-exists") {
        message = "This email address is already in use.";
      }
      response.status(500).send({success: false, error: message});
    }
  });
});
