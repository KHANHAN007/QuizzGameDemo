const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
let questionSets = [
    {
        id: 1,
        name: 'Toán Học Cơ Bản',
        description: 'Các phép tính cơ bản',
        showInstantFeedback: 1,
        presentationMode: 0,
        timePerQuestion: 30,
        shuffleQuestions: 1,
        shuffleChoices: 0,
        allowSkip: 1,
        showScore: 1
    },
    {
        id: 2,
        name: 'Khoa Học Tự Nhiên',
        description: 'Câu hỏi về động vật và thực vật',
        showInstantFeedback: 1,
        presentationMode: 1,
        timePerQuestion: 45,
        shuffleQuestions: 0,
        shuffleChoices: 0,
        allowSkip: 1,
        showScore: 1
    },
    {
        id: 3,
        name: 'Địa Lý Việt Nam',
        description: 'Tìm hiểu về đất nước',
        showInstantFeedback: 0,
        presentationMode: 0,
        timePerQuestion: 60,
        shuffleQuestions: 1,
        shuffleChoices: 1,
        allowSkip: 0,
        showScore: 1
    }
];

let questions = [
    { id: 1, setId: 1, text: '2 + 2 = ?', choice1: '3', choice2: '4', choice3: '5', choice4: '6', correctIndex: 1, explanation: 'Vì 2 + 2 = 4' },
    { id: 2, setId: 1, text: '5 x 2 = ?', choice1: '8', choice2: '10', choice3: '12', choice4: '15', correctIndex: 1, explanation: 'Vì 5 x 2 = 10' },
    { id: 3, setId: 1, text: '10 - 3 = ?', choice1: '5', choice2: '6', choice3: '7', choice4: '8', correctIndex: 2, explanation: 'Vì 10 - 3 = 7' },
    { id: 4, setId: 1, text: '12 : 4 = ?', choice1: '2', choice2: '3', choice3: '4', choice4: '5', correctIndex: 1, explanation: 'Vì 12 : 4 = 3' },
    { id: 5, setId: 1, text: '7 + 8 = ?', choice1: '13', choice2: '14', choice3: '15', choice4: '16', correctIndex: 2, explanation: 'Vì 7 + 8 = 15' },

    { id: 6, setId: 2, text: 'Con mèo kêu gì?', choice1: 'Gâu gâu', choice2: 'Meo meo', choice3: 'Ò ó o', choice4: 'Quạc quạc', correctIndex: 1, explanation: 'Mèo kêu meo meo' },
    { id: 7, setId: 2, text: 'Con nào sống ở nước?', choice1: 'Chó', choice2: 'Mèo', choice3: 'Cá', choice4: 'Gà', correctIndex: 2, explanation: 'Cá sống ở nước' },
    { id: 8, setId: 2, text: 'Con gì có vòi?', choice1: 'Sư tử', choice2: 'Voi', choice3: 'Hổ', choice4: 'Báo', correctIndex: 1, explanation: 'Voi có vòi dài' },
    { id: 9, setId: 2, text: 'Con nào biết bay?', choice1: 'Cá', choice2: 'Chim', choice3: 'Chó', choice4: 'Mèo', correctIndex: 1, explanation: 'Chim biết bay' },
    { id: 10, setId: 2, text: 'Màu của lá cây?', choice1: 'Đỏ', choice2: 'Xanh', choice3: 'Vàng', choice4: 'Trắng', correctIndex: 1, explanation: 'Lá cây màu xanh' },

    { id: 11, setId: 3, text: 'Thủ đô Việt Nam?', choice1: 'Hà Nội', choice2: 'TP HCM', choice3: 'Đà Nẵng', choice4: 'Huế', correctIndex: 0, explanation: 'Thủ đô là Hà Nội' },
    { id: 12, setId: 3, text: 'Việt Nam có bao nhiêu tỉnh?', choice1: '60', choice2: '63', choice3: '65', choice4: '70', correctIndex: 1, explanation: 'VN có 63 tỉnh thành' },
    { id: 13, setId: 3, text: 'Núi cao nhất VN?', choice1: 'Phan Xi Păng', choice2: 'Bạch Mã', choice3: 'Ngũ Hành Sơn', choice4: 'Hòn Bà', correctIndex: 0, explanation: 'Phan Xi Păng cao nhất' },
    { id: 14, setId: 3, text: 'Sông dài nhất VN?', choice1: 'Sông Hồng', choice2: 'Sông Đồng Nai', choice3: 'Sông Mê Kông', choice4: 'Sông Hương', correctIndex: 2, explanation: 'Sông Mê Kông dài nhất' },
    { id: 15, setId: 3, text: 'Thành phố lớn nhất VN?', choice1: 'Hà Nội', choice2: 'TP HCM', choice3: 'Đà Nẵng', choice4: 'Cần Thơ', correctIndex: 1, explanation: 'TP HCM lớn nhất' }
];

let nextQuestionId = 16;
let nextSetId = 4;

// Question Sets endpoints
app.get('/api/sets', (req, res) => {
    res.json(questionSets);
});

app.get('/api/sets/:id', (req, res) => {
    const set = questionSets.find(s => s.id === parseInt(req.params.id));
    if (set) {
        res.json(set);
    } else {
        res.status(404).json({ error: 'Set not found' });
    }
});

app.post('/api/sets', (req, res) => {
    const newSet = {
        id: nextSetId++,
        ...req.body,
        showInstantFeedback: req.body.showInstantFeedback ? 1 : 0,
        presentationMode: req.body.presentationMode ? 1 : 0,
        shuffleQuestions: req.body.shuffleQuestions ? 1 : 0,
        shuffleChoices: req.body.shuffleChoices ? 1 : 0,
        allowSkip: req.body.allowSkip ? 1 : 0,
        showScore: req.body.showScore ? 1 : 0
    };
    questionSets.push(newSet);
    res.json(newSet);
});

app.put('/api/sets/:id', (req, res) => {
    const index = questionSets.findIndex(s => s.id === parseInt(req.params.id));
    if (index !== -1) {
        questionSets[index] = {
            ...questionSets[index],
            ...req.body,
            id: parseInt(req.params.id),
            showInstantFeedback: req.body.showInstantFeedback ? 1 : 0,
            presentationMode: req.body.presentationMode ? 1 : 0,
            shuffleQuestions: req.body.shuffleQuestions ? 1 : 0,
            shuffleChoices: req.body.shuffleChoices ? 1 : 0,
            allowSkip: req.body.allowSkip ? 1 : 0,
            showScore: req.body.showScore ? 1 : 0
        };
        res.json(questionSets[index]);
    } else {
        res.status(404).json({ error: 'Set not found' });
    }
});

app.delete('/api/sets/:id', (req, res) => {
    const index = questionSets.findIndex(s => s.id === parseInt(req.params.id));
    if (index !== -1) {
        // Delete all questions in this set
        questions = questions.filter(q => q.setId !== parseInt(req.params.id));
        questionSets.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Set not found' });
    }
});

// Questions endpoints
app.get('/api/questions', (req, res) => {
    const { setId } = req.query;
    let result = questions;
    if (setId) {
        result = questions.filter(q => q.setId === parseInt(setId));
    }
    res.json(result);
});

app.get('/api/questions/:id', (req, res) => {
    const question = questions.find(q => q.id === parseInt(req.params.id));
    if (question) {
        res.json(question);
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

app.post('/api/questions', (req, res) => {
    const newQuestion = {
        id: nextQuestionId++,
        ...req.body
    };
    questions.push(newQuestion);
    res.json(newQuestion);
});

app.put('/api/questions/:id', (req, res) => {
    const index = questions.findIndex(q => q.id === parseInt(req.params.id));
    if (index !== -1) {
        questions[index] = {
            ...questions[index],
            ...req.body,
            id: parseInt(req.params.id)
        };
        res.json(questions[index]);
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

app.delete('/api/questions/:id', (req, res) => {
    const index = questions.findIndex(q => q.id === parseInt(req.params.id));
    if (index !== -1) {
        questions.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

// Quiz endpoints
app.get('/api/quiz', (req, res) => {
    const { setId, count = 5 } = req.query;
    const set = questionSets.find(s => s.id === parseInt(setId));

    if (!set) {
        return res.status(404).json({ error: 'Set not found' });
    }

    let setQuestions = questions.filter(q => q.setId === parseInt(setId));

    // Shuffle if needed
    if (set.shuffleQuestions) {
        setQuestions = setQuestions.sort(() => Math.random() - 0.5);
    }

    // Limit count
    setQuestions = setQuestions.slice(0, parseInt(count));

    res.json({
        questions: setQuestions,
        settings: set
    });
});

app.post('/api/grade', (req, res) => {
    const { answers } = req.body;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const details = [];

    for (const [questionId, answerIndex] of Object.entries(answers)) {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (!question) continue;

        if (answerIndex === null || answerIndex === undefined) {
            skipped++;
            details.push({
                questionId: parseInt(questionId),
                correct: false,
                skipped: true
            });
        } else if (question.correctIndex === answerIndex) {
            correct++;
            details.push({
                questionId: parseInt(questionId),
                correct: true,
                skipped: false
            });
        } else {
            incorrect++;
            details.push({
                questionId: parseInt(questionId),
                correct: false,
                skipped: false,
                correctIndex: question.correctIndex
            });
        }
    }

    res.json({
        correct,
        incorrect,
        skipped,
        total: Object.keys(answers).length,
        details
    });
});

app.post('/api/check-answer', (req, res) => {
    const { questionId, answerIndex } = req.body;
    const question = questions.find(q => q.id === parseInt(questionId));

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = question.correctIndex === answerIndex;
    res.json({
        isCorrect,
        correctIndex: question.correctIndex,
        explanation: question.explanation || ''
    });
});

// CSV endpoints (simplified - just return success)
app.post('/api/import-csv', (req, res) => {
    res.json({ success: true, imported: 0 });
});

app.get('/api/export-csv', (req, res) => {
    const { setId } = req.query;
    let exportQuestions = questions;
    if (setId) {
        exportQuestions = questions.filter(q => q.setId === parseInt(setId));
    }

    const csv = 'question,choice1,choice2,choice3,choice4,correctIndex,explanation\n' +
        exportQuestions.map(q =>
            `"${q.text}","${q.choice1}","${q.choice2}","${q.choice3}","${q.choice4}",${q.correctIndex},"${q.explanation || ''}"`
        ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
    res.send(csv);
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Mock backend server running at http://localhost:${PORT}`);
    console.log(`📚 Question Sets: ${questionSets.length}`);
    console.log(`❓ Questions: ${questions.length}`);
});
