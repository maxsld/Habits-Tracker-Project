const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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

  // Create the unique CodAmi
  const generateCodAmi = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  let codeami;
  let isUnique = false;

  while (!isUnique) {
    codeami = generateCodAmi();
    const existingCodAmi = await usersCollection.findOne({ codAmi: codeami });
    if (!existingCodAmi) {
      isUnique = true;
    }
  }

  // Add the new user to the database
  const result = await usersCollection.insertOne({
    codAmi: codeami,
    lastName,
    firstName,
    gender,
    email,
    password: hashedPassword,
    tokens: [],
    habits: [],
    emojiChecked: false,
    emojiDay: null,
    friends: [],
  });

  // Generate a token for the user
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = await bcrypt.hash(token, 10);

  await usersCollection.updateOne(
    { _id: result.insertedId },
    { $push: { tokens: hashedToken } }
  );

  res.json({ token, userId: result.insertedId });
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
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = await bcrypt.hash(token, 10);

  await usersCollection.updateOne(
    { _id: existingUser._id },
    { $push: { tokens: hashedToken } }
  );

  res.json({ token, userId: existingUser._id });
});

app.post("/api/verifyToken", async (req, res) => {
  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(400).json({ error: "Token or userId is missing" });
  }

  try {
    const usersCollection = await connectToDb();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (user) {
      console.log("User found:", user);

      // Check if the token is in the user's token list
      const results = await Promise.all(
        user.tokens.map((storedToken) => {
          console.log("Comparing plaintext token with storedToken:", {
            token,
            storedToken,
          });
          return bcrypt.compare(token, storedToken); // Compare plaintext token with hashed token
        })
      );

      console.log("Comparison results:", results);
      const tokenExists = results.some(Boolean);

      if (tokenExists) {
        return res.json({ valid: true });
      } else {
        return res.json({ valid: false });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error during token verification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to add an habit
app.post("/api/newHabit", async (req, res) => {
  const { userId, habitName, habitDescription, habitCategory } = req.body;

  // Ensure both token and userId are provided
  if (!userId || !habitName || !habitDescription || !habitCategory) {
    return res.status(400).json({
      error:
        "User ID, habit's name, habit's description, or habit's category is missing",
    });
  }

  try {
    // Connect to the database
    const usersCollection = await connectToDb();

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the habit name already exists in the user's habits
    const habitExists = user.habits?.some(
      (habit) => habit.habitName.toLowerCase() === habitName.toLowerCase()
    );

    if (habitExists) {
      return res.status(400).json({
        error: `A habit with the name "${habitName}" already exists.`,
      });
    }

    const newHabit = {
      habitName,
      habitDescription,
      habitCategory,
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { habits: newHabit } }
    );

    res
      .status(200)
      .json({ message: "Habit added successfully", habit: newHabit });
  } catch (error) {
    // Handle any errors during token verification (e.g., database issues)
    console.error("Error during habit creation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/deleteHabit", async (req, res) => {
  const { userId, habitName } = req.body;

  // Ensure both userId and habitName are provided
  if (!userId || !habitName) {
    return res.status(400).json({
      error: "User ID or habit's name is missing",
    });
  }

  try {
    // Connect to the database
    const usersCollection = await connectToDb();

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const habitIndex = user.habits.findIndex(
      (habit) => habit.habitName.toLowerCase() === habitName.toLowerCase()
    );

    if (habitIndex === -1) {
      return res.status(404).json({ error: "Habit not found" });
    }

    user.habits.splice(habitIndex, 1);

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { habits: user.habits } }
    );

    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (error) {
    // Handle any errors during token verification (e.g., database issues)
    console.error("Error during habit deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/saveEmoji", async (req, res) => {
  const { userId, emojiDay } = req.body;

  // Ensure both token and userId are provided
  if (!userId || !emojiDay) {
    return res.status(400).json({
      error: "User ID or emoji day is missing",
    });
  }

  try {
    // Connect to the database
    const usersCollection = await connectToDb();

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { emojiDay, emojiChecked: true } }
    );

    res.status(200).json({ message: "Emoji day saved successfully" });
  } catch (error) {
    // Handle any errors during token verification (e.g., database issues)
    console.error("Error during emoji day saving:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to get user's info
app.post("/api/getUserInfo", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is missing" });
  }

  try {
    const usersCollection = await connectToDb();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      habits: user.habits,
      emojiDay: user.emojiDay,
      emojiChecked: user.emojiChecked,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
