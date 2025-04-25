const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base de datos SQLite
const dbPath = path.join(__dirname, "comentarios.db");
const db = new sqlite3.Database(dbPath);

// Crear tabla si no existe
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS comentarios (id INTEGER PRIMARY KEY AUTOINCREMENT, texto TEXT)");
});

// Ruta: obtener comentarios
app.get("/comentarios", (req, res) => {
  db.all("SELECT * FROM comentarios ORDER BY id DESC LIMIT 20", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ruta: agregar comentario
app.post("/comentarios", (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: "Texto es requerido" });

  db.run("INSERT INTO comentarios (texto) VALUES (?)", [texto], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, texto });
  });
});

app.get("/", (req, res) => {
  res.send("API de comentarios funcionando.");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});