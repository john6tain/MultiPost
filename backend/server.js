const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

const PORT = 3000;
const PAIRING_TTL_SECONDS = 120;
const PAIRED_SESSION_TTL_SECONDS = 60 * 60 * 24;
const uploadsDir = path.join(__dirname, "uploads");
const sessions = new Map();

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname || "") || ".jpg";
    callback(null, `${randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage
});

const app = express();

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function getSession(token) {
  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  if (Date.now() >= session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  if (session.paired) {
    session.expiresAt = Date.now() + PAIRED_SESSION_TTL_SECONDS * 1000;
  }

  return session;
}

function cleanupExpiredSessions() {
  for (const [token, session] of sessions.entries()) {
    if (Date.now() >= session.expiresAt) {
      sessions.delete(token);
    }
  }
}

function createPairingSession() {
  const pairingToken = randomUUID();
  const expiresAt = Date.now() + PAIRING_TTL_SECONDS * 1000;

  sessions.set(pairingToken, {
    pairingToken,
    expiresAt,
    paired: false,
    userId: null,
    deviceName: null,
    latestListing: null
  });

  return {
    pairingToken,
    expiresIn: PAIRING_TTL_SECONDS
  };
}

function buildPairedResponse(session) {
  return {
    paired: true,
    userId: session.userId,
    deviceName: session.deviceName
  };
}

function deleteUploadedImages(imagePaths) {
  if (!Array.isArray(imagePaths)) {
    return;
  }

  imagePaths.forEach((imagePath) => {
    if (typeof imagePath !== "string" || !imagePath.startsWith("/uploads/")) {
      return;
    }

    const fileName = path.basename(imagePath);
    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

app.use((_request, _response, next) => {
  cleanupExpiredSessions();
  next();
});

app.post("/api/extension/pairing-session", (_request, response) => {
  sendJson(response, 200, createPairingSession());
});

app.get("/api/extension/pairing-status/:token", (request, response) => {
  const session = getSession(request.params.token);

  if (!session) {
    sendJson(response, 404, { message: "Pairing session not found or expired" });
    return;
  }

  if (!session.paired) {
    sendJson(response, 200, { paired: false });
    return;
  }

  sendJson(response, 200, buildPairedResponse(session));
});

app.get("/api/extension/active-listing/:token", (request, response) => {
  const session = getSession(request.params.token);

  if (!session || !session.paired) {
    sendJson(response, 404, { message: "Paired session not found" });
    return;
  }

  sendJson(response, 200, {
    listing: session.latestListing
  });
});

app.post("/api/mobile/pair-extension", (request, response) => {
  const pairingToken = typeof request.body?.pairingToken === "string" ? request.body.pairingToken : "";
  const deviceName = typeof request.body?.deviceName === "string" && request.body.deviceName
    ? request.body.deviceName
    : "Phone";
  const session = getSession(pairingToken);

  if (!session) {
    sendJson(response, 404, { message: "Pairing token not found or expired" });
    return;
  }

  if (session.paired) {
    sendJson(response, 409, { message: "Pairing token already used" });
    return;
  }

  session.paired = true;
  session.userId = "user_1";
  session.deviceName = deviceName;
  session.expiresAt = Date.now() + PAIRED_SESSION_TTL_SECONDS * 1000;

  sendJson(response, 200, buildPairedResponse(session));
});

app.post("/api/mobile/upload-images", upload.array("images", 20), (request, response) => {
  const files = Array.isArray(request.files) ? request.files : [];

  if (!files.length) {
    sendJson(response, 400, { message: "No images uploaded" });
    return;
  }

  sendJson(response, 200, {
    images: files.map((file) => `/uploads/${file.filename}`)
  });
});

app.post("/api/mobile/send-listing", (request, response) => {
  const pairingToken = typeof request.body?.pairingToken === "string" ? request.body.pairingToken : "";
  const session = getSession(pairingToken);

  if (!session || !session.paired) {
    sendJson(response, 404, { message: "Desktop pairing not found" });
    return;
  }

  if (!request.body?.listing || typeof request.body.listing !== "object") {
    sendJson(response, 400, { message: "Listing payload is required" });
    return;
  }

  session.latestListing = request.body.listing;
  sendJson(response, 200, { ok: true });
});

app.post("/api/extension/delete-images", (request, response) => {
  const imagePaths = request.body?.images;

  if (!Array.isArray(imagePaths)) {
    sendJson(response, 400, { message: "Images array is required" });
    return;
  }

  deleteUploadedImages(imagePaths);
  sendJson(response, 200, { ok: true });
});

app.post("/api/extension/pairing-confirm/:token", (request, response) => {
  const session = getSession(request.params.token);

  if (!session) {
    sendJson(response, 404, { message: "Pairing session not found or expired" });
    return;
  }

  if (session.paired) {
    sendJson(response, 409, { message: "Pairing token already used" });
    return;
  }

  session.paired = true;
  session.userId = typeof request.body?.userId === "string" && request.body.userId ? request.body.userId : "user_1";
  session.deviceName = typeof request.body?.deviceName === "string" && request.body.deviceName
    ? request.body.deviceName
    : "John's phone";
  session.expiresAt = Date.now() + PAIRED_SESSION_TTL_SECONDS * 1000;

  sendJson(response, 200, buildPairedResponse(session));
});

app.get("/health", (_request, response) => {
  sendJson(response, 200, { ok: true });
});

app.use((_request, response) => {
  sendJson(response, 404, { message: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Multi-Post backend listening on http://localhost:${PORT}`);
});
