const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Route to log weather history
app.post("/log-weather", (req, res) => {
    const weatherData = req.body;

    if (!weatherData) {
        return res.status(400).json({ message: "Invalid weather data" });
    }

    const filePath = "weather-history.json";
    let history = [];

    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, "utf8");
            if (data) {
                history = JSON.parse(data);  // Only parse if the file is not empty
            }
        } catch (error) {
            console.error("Error reading weather history file:", error);
        }
    }

    // Append new weather data
    history.push(weatherData);

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));

    res.json({ message: "Weather data logged successfully" });
});

// Route to get weather history
app.get("/weather-history", (req, res) => {
    const filePath = "weather-history.json";

    // Handle case where the file doesn't exist or is empty
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, "utf8");
            if (data) {
                const history = JSON.parse(data);
                res.json(history);
            } else {
                res.json([]);  // Return empty array if file is empty
            }
        } catch (error) {
            console.error("Error reading weather history file:", error);
            res.json([]);  // Return empty array if there's an error parsing the file
        }
    } else {
        res.json([]);  // Return empty array if file doesn't exist
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
