const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'db.sqlite'));

// Create question_sets table
db.exec(`
  CREATE TABLE IF NOT EXISTS question_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    showInstantFeedback INTEGER DEFAULT 0,
    presentationMode INTEGER DEFAULT 0,
    timePerQuestion INTEGER DEFAULT 30,
    shuffleQuestions INTEGER DEFAULT 1,
    shuffleChoices INTEGER DEFAULT 0,
    allowSkip INTEGER DEFAULT 1,
    showScore INTEGER DEFAULT 1,
    createdAt INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

// Create questions table with setId
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setId INTEGER DEFAULT 1,
    text TEXT NOT NULL,
    choice1 TEXT NOT NULL,
    choice2 TEXT NOT NULL,
    choice3 TEXT NOT NULL,
    choice4 TEXT NOT NULL,
    correctIndex INTEGER NOT NULL,
    explanation TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (setId) REFERENCES question_sets(id) ON DELETE CASCADE
  )
`);

// Seed initial data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM questions').get();
if (count.count === 0) {
    const insert = db.prepare(`
    INSERT INTO questions (text, choice1, choice2, choice3, choice4, correctIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    const seedData = [
        ['Con vật nào kêu "meo meo"?', 'Chó', 'Mèo', 'Gà', 'Vịt', 1],
        ['2 + 3 bằng bao nhiêu?', '4', '5', '6', '3', 1],
        ['Mặt trời mọc ở hướng nào?', 'Tây', 'Bắc', 'Đông', 'Nam', 2],
        ['Con gà có mấy chân?', '1', '2', '3', '4', 1],
        ['Màu của lá cây là gì?', 'Đỏ', 'Vàng', 'Xanh', 'Trắng', 2],
        ['1 tuần có bao nhiêu ngày?', '5', '6', '7', '8', 2],
        ['Thủ đô của Việt Nam là gì?', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 1],
        ['Con nào biết bay?', 'Cá', 'Chó', 'Chim', 'Chuột', 2]
    ];

    seedData.forEach(data => insert.run(...data));
    console.log('✅ Database seeded with initial questions');
}

// API: Get all questions
app.get('/api/questions', (req, res) => {
    try {
        const questions = db.prepare('SELECT * FROM questions ORDER BY id DESC').all();
        res.json(questions.map(q => ({
            id: q.id,
            text: q.text,
            choices: [q.choice1, q.choice2, q.choice3, q.choice4],
            correctIndex: q.correctIndex,
            createdAt: q.createdAt
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Get single question
app.get('/api/questions/:id', (req, res) => {
    try {
        const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
        if (!q) return res.status(404).json({ error: 'Not found' });
        res.json({
            id: q.id,
            text: q.text,
            choices: [q.choice1, q.choice2, q.choice3, q.choice4],
            correctIndex: q.correctIndex
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Create question
app.post('/api/questions', (req, res) => {
    try {
        const { text, choices, correctIndex } = req.body;
        if (!text || !choices || choices.length < 4 || correctIndex === undefined) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        const insert = db.prepare(`
      INSERT INTO questions (text, choice1, choice2, choice3, choice4, correctIndex)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        const result = insert.run(text, choices[0], choices[1], choices[2], choices[3], correctIndex);
        const newQuestion = db.prepare('SELECT * FROM questions WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            id: newQuestion.id,
            text: newQuestion.text,
            choices: [newQuestion.choice1, newQuestion.choice2, newQuestion.choice3, newQuestion.choice4],
            correctIndex: newQuestion.correctIndex
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Update question
app.put('/api/questions/:id', (req, res) => {
    try {
        const { text, choices, correctIndex } = req.body;
        const update = db.prepare(`
      UPDATE questions 
      SET text = ?, choice1 = ?, choice2 = ?, choice3 = ?, choice4 = ?, correctIndex = ?
      WHERE id = ?
    `);

        update.run(text, choices[0], choices[1], choices[2], choices[3], correctIndex, req.params.id);

        const updated = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
        res.json({
            id: updated.id,
            text: updated.text,
            choices: [updated.choice1, updated.choice2, updated.choice3, updated.choice4],
            correctIndex: updated.correctIndex
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Delete question
app.delete('/api/questions/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Get quiz (random questions)
app.get('/api/quiz', (req, res) => {
    try {
        const count = parseInt(req.query.count || '5', 10);
        const questions = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?').all(count);

        res.json(questions.map(q => ({
            id: q.id,
            text: q.text,
            choices: [q.choice1, q.choice2, q.choice3, q.choice4]
            // Don't send correctIndex to client!
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Grade quiz
app.post('/api/grade', (req, res) => {
    try {
        const { answers } = req.body; // [{ id, answerIndex }]
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        let correct = 0;
        const details = answers.map(a => {
            const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(a.id);
            if (!q) return { id: a.id, isCorrect: false };

            const isCorrect = q.correctIndex === a.answerIndex;
            if (isCorrect) correct++;

            return {
                id: a.id,
                questionText: q.text,
                correctIndex: q.correctIndex,
                correctAnswer: [q.choice1, q.choice2, q.choice3, q.choice4][q.correctIndex],
                yourAnswer: [q.choice1, q.choice2, q.choice3, q.choice4][a.answerIndex] || 'Chưa chọn',
                yourAnswerIndex: a.answerIndex,
                isCorrect
            };
        });

        res.json({
            total: answers.length,
            correct,
            score: Math.round((correct / answers.length) * 100),
            details
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Import CSV
app.post('/api/import-csv', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const content = req.file.buffer.toString('utf-8');
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            bom: true
        });

        const insert = db.prepare(`
      INSERT INTO questions (text, choice1, choice2, choice3, choice4, correctIndex)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        let imported = 0;
        for (const record of records) {
            if (record.question && record.choice1 && record.correctIndex !== undefined) {
                insert.run(
                    record.question,
                    record.choice1 || '',
                    record.choice2 || '',
                    record.choice3 || '',
                    record.choice4 || '',
                    parseInt(record.correctIndex, 10)
                );
                imported++;
            }
        }

        res.json({ success: true, imported });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Export CSV
app.get('/api/export-csv', (req, res) => {
    try {
        const questions = db.prepare('SELECT * FROM questions').all();
        const records = questions.map(q => ({
            question: q.text,
            choice1: q.choice1,
            choice2: q.choice2,
            choice3: q.choice3,
            choice4: q.choice4,
            correctIndex: q.correctIndex
        }));

        const csv = stringify(records, {
            header: true,
            columns: ['question', 'choice1', 'choice2', 'choice3', 'choice4', 'correctIndex']
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
        res.send('\uFEFF' + csv); // BOM for UTF-8
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    console.log(`📊 Database: ${path.join(__dirname, 'db.sqlite')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
