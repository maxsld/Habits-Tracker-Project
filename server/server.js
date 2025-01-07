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
    history: [],
    streak: 0,
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
      // Check if the token is in the user's token list
      const results = await Promise.all(
        user.tokens.map((storedToken) => {
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
      habitStatus: null,
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

app.post("/api/deleteFriend", async (req, res) => {
  const { userId, friendId } = req.body;

  // Ensure both userId and habitName are provided
  if (!userId || !friendId) {
    return res.status(400).json({
      error: "User ID or friend ID is missing",
    });
  }

  try {
    // Connect to the database
    const usersCollection = await connectToDb();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { friends: new ObjectId(friendId) } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Friend not found" });
    }

    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    // Handle any errors during token verification (e.g., database issues)
    console.error("Error during friend deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/updateHabit", async (req, res) => {
  const { userId, habitName, status } = req.body;

  // Ensure both userId and habitName are provided
  if (!userId || !habitName || status === undefined) {
    return res.status(400).json({
      error: "User ID, habit's name or status is missing",
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

    user.habits[habitIndex].habitStatus = status;

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { habits: user.habits } }
    );

    res.status(200).json({ message: "Habit updated successfully" });
  } catch (error) {
    // Handle any errors during token verification (e.g., database issues)
    console.error("Error during habit update:", error);
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
      friends: user.friends,
      streak: user.streak,
      codami: user.codAmi,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST route to add friend
app.post("/api/addFriends", async (req, res) => {
  const { userId, friendCode } = req.body;

  if (!friendCode || !userId) {
    return res.status(400).json({ error: "Friend code or user ID is missing" });
  }

  try {
    const usersCollection = await connectToDb();
    const friend = await usersCollection.findOne({
      codAmi: parseInt(friendCode, 10),
    });

    if (!friend) {
      return res.status(404).json({ error: "Friend not found" });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.friends.some((friendId) => friendId.equals(friend._id))) {
      return res
        .status(400)
        .json({ error: "Friend is already in your friends list" });
    }

    // Add the friend to the user's friends list
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { friends: friend._id } } // Add friend's _id to the user's friends list
    );

    // Respond with success message
    return res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Error adding friend:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the friend" });
  }
});

// POST route to save user's history
app.post("/api/saveHistory", async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    const currentDate = new Date().toISOString().split("T")[0];

    try {
      const usersCollection = await connectToDb();

      // Trouver l'utilisateur et ses habitudes
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const habits = user.habits || []; // Suppose que les habitudes de l'utilisateur sont stockées dans un tableau "habits"

      const totalHabits = habits.length;
      const completedHabits = habits.filter(habit => habit.habitStatus === true).length;

      if (totalHabits === 0) {
        return res.status(400).json({ error: "No habits found for this user" });
      }

      // Calculer le dailyScore en pourcentage
      const dailyScore = Math.round((completedHabits / totalHabits) * 100);

      // Incrémenter ou réinitialiser le streak
      const lastHistoryDate = user.history?.length > 0 ? user.history[user.history.length - 1].date : null;
      const isConsecutive = lastHistoryDate && new Date(currentDate) - new Date(lastHistoryDate) === 86400000;
      const streak = isConsecutive ? (user.streak || 0) + 1 : 1;

      console.log(dailyScore);
      console.log(streak);

      // Remplacer ou ajouter l'entrée d'historique pour la date actuelle
      const updatedUser = await usersCollection.updateOne(
        { _id: new ObjectId(userId), "history.date": currentDate }, // Vérifie si une entrée avec la même date existe
        {
          $set: {
            "history.$.dailyScore": dailyScore, // Met à jour le dailyScore de l'entrée existante
            streak, // Met à jour le streak
          },
        }
      );

      if (updatedUser.matchedCount === 0) {
        // Si aucune entrée existante n'a été mise à jour, ajouter une nouvelle entrée
        const newHistoryUpdate = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $push: { history: { date: currentDate, dailyScore } }, // Ajouter l'entrée quotidienne
            $set: { streak }, // Mettre à jour le streak
          }
        );

        if (newHistoryUpdate.matchedCount === 0) {
          return res.status(500).json({ error: "Failed to update user's history" });
        }
      }

      // Répondre avec un message de succès
      return res.status(200).json({
        message: "History saved successfully",
        dailyScore,
        streak,
      });
    } catch (error) {
      console.error("Error saving user's history:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while saving user's history" });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
