const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MongoDB connection URI
const uri =
  "mongodb://renandb:info734@193.48.125.44:27017/?authMechanism=DEFAULT&authSource=admin";
const client = new MongoClient(uri);

// Connect to MongoDB and return the 'users' collection
async function connectToDb() {
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db("maxens-baptiste").collection("users");
}

// POST route for user signup
app.post("/api/signup", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { lastName, firstName, gender, email, password } = req.body;

  const usersCollection = await connectToDb();

  // Check if the email is already in use
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "This email is already in use." });
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add the new user to the database
  const result = await usersCollection.insertOne({
    lastName,
    firstName,
    gender,
    email,
    password: hashedPassword,
    tokens: [],
  });

  // Generate a token using the user's inserted ID
  const token = await bcrypt.hash(result.insertedId.toString(), 10);

  // Save the token to the user's document
  await usersCollection.updateOne(
    { _id: result.insertedId },
    { $push: { tokens: token } }
  );

  res.json({ token });
});

// POST route for user signin
app.post("/api/signin", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  const usersCollection = await connectToDb();

  // Check if the user with the provided email exists
  const existingUser = await usersCollection.findOne({ email });
  if (!existingUser) {
    return res.status(400).json({ error: "Incorrect username or password" });
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Incorrect username or password" });
  }

  // Generate a token for the user
  const token = await bcrypt.hash(existingUser._id.toString(), 10);

  // Add the generated token to the user's document
  await usersCollection.updateOne(
    { _id: existingUser._id },
    { $push: { tokens: token } }
  );

  res.json({ token });
});

// POST route to verify a token
app.post("/api/verifyToken", async (req, res) => {
  const { token } = req.body;

  // Ensure the token is provided
  if (!token) {
    return res.status(400).json({ error: "Token is missing" });
  }

  try {
    // Connect to the database
    const usersCollection = await connectToDb();

    // Check if a user exists with the provided token
    const user = await usersCollection.findOne({ tokens: { $in: [token] } });

    if (user) {
      // If a user with this token exists, validate it
      const tokenValid = await user.tokens.some(async (storedToken) => {
        return await bcrypt.compare(token, storedToken);
      });

      if (tokenValid) {
        // Token is valid
        res.json({ valid: true });
      } else {
        // Token is invalid or expired
        res.json({ valid: false });
      }
    } else {
      // No user found with the provided token
      res.json({ valid: false });
    }
  } catch (error) {
    // Handle any errors during token verification (e.g., database issues)
    res.status(500).json({ error: "Error during token verification" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
