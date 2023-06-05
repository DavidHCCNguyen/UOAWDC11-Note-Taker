const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// API Routes

// GET /api/notes - Read the db.json file and return all saved notes as JSON
app.get('/api/notes', (req, res) => {
  const dbData = fs.readFileSync('./db/db.json', 'utf8');
  const notes = JSON.parse(dbData);
  res.json(notes);
});

// POST /api/notes - Receive a new note to save, add it to the db.json file, and return the new note to the client
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4();

  const dbData = fs.readFileSync('./db/db.json', 'utf8');
  const notes = JSON.parse(dbData);

  notes.push(newNote);

  fs.writeFileSync('./db/db.json', JSON.stringify(notes));

  res.json(newNote);
});

// HTML Routes

// GET /notes - Return the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

// GET * - Return the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// DELETE /api/notes/:id - Delete a note with the given id
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  const dbData = fs.readFileSync('./db/db.json', 'utf8');
  let notes = JSON.parse(dbData);

  // Find the index of the note with the given id
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex !== -1) {
    // Remove the note from the array
    notes.splice(noteIndex, 1);

    // Rewrite the notes to the db.json file
    fs.writeFileSync('./db/db.json', JSON.stringify(notes));

    res.json({ message: 'Note deleted successfully' });
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});
