const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Charger les scores depuis un fichier JSON
const DATA_FILE = "data.json";

let scores = [];
if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE);
    scores = JSON.parse(fileData);
}

// Endpoint pour récupérer le leaderboard
app.get("/api/scores", (req, res) => {
    res.json({ leaderboard: scores });
});

// Endpoint pour soumettre un score
app.post("/api/scores", (req, res) => {
    const { name, score } = req.body;

    // Vérification des données
    if (!name || typeof score !== "number") {
        return res.status(400).send({ message: "Données invalides." });
    }

    // Rechercher si le joueur existe déjà
    const existingPlayer = scores.find(player => player.name === name);

    if (existingPlayer) {
        // Mettre à jour uniquement si le nouveau score est plus élevé
        if (score > existingPlayer.score) {
            existingPlayer.score = score;
        }
    } else {
        // Ajouter un nouveau joueur
        scores.push({ name, score });
    }

    // Trier et limiter au top 5
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);

    // Sauvegarder dans le fichier JSON
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));

    res.status(200).send({ message: "Score mis à jour !" });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
