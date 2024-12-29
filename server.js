const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000; // Port dynamique pour Render

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://gameUser:9rlefCh3g3ZzQPrT@cluster0.unced.mongodb.net/leaderboard?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connecté à MongoDB"))
    .catch(err => console.error("Erreur de connexion à MongoDB :", err));

// Schéma et modèle pour les scores
const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true }
});

const Score = mongoose.model("Score", scoreSchema);

// Endpoint pour récupérer le leaderboard
app.get("/api/scores", async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(5); // Top 5
        res.json({ leaderboard: scores });
    } catch (error) {
        res.status(500).send({ message: "Erreur lors de la récupération des scores." });
    }
});

// Endpoint pour soumettre un score
app.post("/api/scores", async (req, res) => {
    const { name, score } = req.body;

    // Vérification des données
    if (!name || typeof score !== "number") {
        return res.status(400).send({ message: "Données invalides." });
    }

    try {
        // Rechercher si le joueur existe déjà
        const existingPlayer = await Score.findOne({ name });

        if (existingPlayer) {
            // Mettre à jour uniquement si le nouveau score est plus élevé
            if (score > existingPlayer.score) {
                existingPlayer.score = score;
                await existingPlayer.save();
            }
        } else {
            // Ajouter un nouveau joueur
            const newScore = new Score({ name, score });
            await newScore.save();
        }

        res.status(200).send({ message: "Score mis à jour !" });
    } catch (error) {
        res.status(500).send({ message: "Erreur lors de la soumission du score." });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});
