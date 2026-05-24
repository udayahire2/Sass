const express = require('express');
const { getNotes, getNoteById, createNote, updateNote, renameNote, deleteNote } = require('../controllers/notesController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.patch('/:id/rename', renameNote);
router.delete('/:id', deleteNote);

module.exports = router;
