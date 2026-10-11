require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { pool, testConnection } = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Auto-initialize PostgreSQL table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL: table "todos" initialisée avec succès');
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', err.message);
  }
};

// Route Health Check (utilisée par Docker, Kubernetes & le Frontend)
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT version();');
    const versionStr = result.rows[0]?.version || 'PostgreSQL';
    const shortVersion = versionStr.split(',')[0].split(' on ')[0];

    res.json({
      status: 'ok',
      database: 'connected',
      dbVersion: shortVersion,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: err.message
    });
  }
});

// Route GET Todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id DESC;');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route POST Todo
app.post('/api/todos', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Le champ titre est requis' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, false) RETURNING *;',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route PATCH Todo (Toggle completed)
app.patch('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *;',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Élément introuvable' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route DELETE Todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Élément introuvable' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Erreur serveur non gérée:', err);
  res.status(500).json({ success: false, error: err.message || 'Erreur interne' });
});

let server;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Backend démarré sur http://0.0.0.0:${PORT} (ENV: ${NODE_ENV})`);
    initDb();
  });
}

module.exports = { app };