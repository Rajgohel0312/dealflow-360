import express from "express";

const app = express();

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
    });
});

app.listen(5001, () => {
    console.log("Express server running on http://localhost:5001");
});