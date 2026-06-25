require("dotenv").config();

const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const movieRoutes = require("./routes/movieRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.FRONTEND_ORIGIN || process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));

app.use(helmet({
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    },
    contentSecurityPolicy: false
}));

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || (!isProduction && allowedOrigins.length === 0)) {
            return callback(null, true);
        }

        const error = new Error("Not allowed by CORS");
        error.status = 403;
        return callback(error);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
}));

app.use(compression());
app.use(hpp());
app.use(express.json({
    limit: process.env.JSON_BODY_LIMIT || "100kb"
}));

app.use("/api", rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX || 100),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
}));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime()
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "FindMyMovie API running",
        health: "/health"
    });
});

app.use("/api", movieRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).json({
        message: isProduction ? "Internal server error" : error.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
