/**
 * Migration Tool: SQLite → Cloudflare D1
 * 
 * Script để migrate dữ liệu từ backend SQLite cũ sang D1
 * Chạy: node migrate.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Path đến SQLite database cũ
const OLD_DB_PATH = path.join(__dirname, '../backend/db.sqlite');
const OUTPUT_SQL_PATH = path.join(__dirname, 'migration.sql');

async function migrate() {
    console.log('🔄 Bắt đầu migration từ SQLite sang D1...\n');

    // Kiểm tra file db.sqlite có tồn tại không
    if (!fs.existsSync(OLD_DB_PATH)) {
        console.error('❌ Không tìm thấy file:', OLD_DB_PATH);
        console.log('💡 Nếu bạn chưa có dữ liệu cũ, hãy dùng seed.sql thay vì migrate');
        return;
    }

    try {
        // Kết nối SQLite cũ
        const db = new Database(OLD_DB_PATH, { readonly: true });
        console.log('✅ Đã kết nối database cũ\n');

        // Lấy question sets
        const sets = db.prepare('SELECT * FROM question_sets').all();
        console.log(`📦 Tìm thấy ${sets.length} question sets`);

        // Lấy questions
        const questions = db.prepare('SELECT * FROM questions').all();
        console.log(`❓ Tìm thấy ${questions.length} questions\n`);

        // Tạo SQL statements
        let sql = '-- Migration from SQLite to D1\n';
        sql += `-- Generated: ${new Date().toISOString()}\n\n`;

        // Insert question sets
        sql += '-- Question Sets\n';
        for (const set of sets) {
            sql += `INSERT INTO question_sets (id, name, description, showInstantFeedback, presentationMode, timePerQuestion, shuffleQuestions, shuffleChoices, allowSkip, showScore, createdAt) VALUES (${set.id}, '${escapeSql(set.name)}', '${escapeSql(set.description || '')}', ${set.showInstantFeedback || 0}, ${set.presentationMode || 0}, ${set.timePerQuestion || 30}, ${set.shuffleQuestions !== undefined ? set.shuffleQuestions : 1}, ${set.shuffleChoices || 0}, ${set.allowSkip !== undefined ? set.allowSkip : 1}, ${set.showScore !== undefined ? set.showScore : 1}, ${set.createdAt || 'NULL'});\n`;
        }

        sql += '\n-- Questions\n';
        for (const q of questions) {
            sql += `INSERT INTO questions (id, setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation, createdAt) VALUES (${q.id}, ${q.setId || 1}, '${escapeSql(q.text)}', '${escapeSql(q.choice1)}', '${escapeSql(q.choice2)}', '${escapeSql(q.choice3)}', '${escapeSql(q.choice4)}', ${q.correctIndex}, '${escapeSql(q.explanation || '')}', ${q.createdAt || 'NULL'});\n`;
        }

        // Ghi ra file
        fs.writeFileSync(OUTPUT_SQL_PATH, sql, 'utf8');
        console.log('✅ Đã tạo file migration.sql\n');

        db.close();

        console.log('🎉 Migration thành công!\n');
        console.log('📋 Các bước tiếp theo:');
        console.log('1. Chạy: npx wrangler d1 execute quiz-game-db --local --file=./migration.sql');
        console.log('2. Test local: npm run dev');
        console.log('3. Deploy production: npx wrangler d1 execute quiz-game-db --remote --file=./migration.sql');
        console.log('4. Deploy Workers: npm run deploy\n');

    } catch (error) {
        console.error('❌ Lỗi migration:', error.message);
    }
}

// Helper: Escape SQL strings
function escapeSql(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

// Chạy migration
migrate();
