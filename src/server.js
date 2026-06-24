require("dotenv").config();

const express = require("express");
const movieRoutes = require("./routes/movieRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Movie Tracker API Running");
});

app.use("/api", movieRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});