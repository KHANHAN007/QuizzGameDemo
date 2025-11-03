// Seed data via API endpoint
// Chạy: node upload-seed-data.js

const API_URL = 'https://quiz-game-api.quiz-game-khanhan.workers.dev';

const questionSets = [
    { name: 'Toán học cơ bản', description: 'Phép cộng, trừ, nhân, chia cho lớp 1-3', showInstantFeedback: true, presentationMode: false, timePerQuestion: 30, shuffleQuestions: true, shuffleChoices: false },
    { name: 'Khoa học tự nhiên', description: 'Động vật, thực vật và thiên nhiên', showInstantFeedback: true, presentationMode: false, timePerQuestion: 40, shuffleQuestions: true, shuffleChoices: true },
    { name: 'Địa lý Việt Nam', description: 'Tỉnh thành, núi sông, địa danh nổi tiếng', showInstantFeedback: false, presentationMode: true, timePerQuestion: 50, shuffleQuestions: true, shuffleChoices: false },
    { name: 'Tiếng Việt', description: 'Chính tả, từ vựng, thành ngữ', showInstantFeedback: true, presentationMode: false, timePerQuestion: 35, shuffleQuestions: true, shuffleChoices: false }
];

const allQuestions = [
    // SET 1: TOÁN HỌC (20 câu)
    { setId: 1, text: '2 + 3 = ?', choices: ['4', '5', '6', '7'], correctIndex: 1, explanation: 'Hai cộng ba bằng năm' },
    { setId: 1, text: '5 + 5 = ?', choices: ['8', '9', '10', '11'], correctIndex: 2, explanation: 'Năm cộng năm bằng mười' },
    { setId: 1, text: '7 + 8 = ?', choices: ['13', '14', '15', '16'], correctIndex: 2, explanation: 'Bảy cộng tám bằng mười lăm' },
    { setId: 1, text: '12 + 9 = ?', choices: ['19', '20', '21', '22'], correctIndex: 2, explanation: 'Mười hai cộng chín bằng hai mươi mốt' },
    { setId: 1, text: '15 + 6 = ?', choices: ['19', '20', '21', '22'], correctIndex: 2, explanation: 'Mười lăm cộng sáu bằng hai mươi mốt' },
    { setId: 1, text: '10 - 3 = ?', choices: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'Mười trừ ba bằng bảy' },
    { setId: 1, text: '15 - 8 = ?', choices: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'Mười lăm trừ tám bằng bảy' },
    { setId: 1, text: '20 - 12 = ?', choices: ['6', '7', '8', '9'], correctIndex: 2, explanation: 'Hai mươi trừ mười hai bằng tám' },
    { setId: 1, text: '18 - 9 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2, explanation: 'Mười tám trừ chín bằng chín' },
    { setId: 1, text: '25 - 7 = ?', choices: ['16', '17', '18', '19'], correctIndex: 2, explanation: 'Hai mươi lăm trừ bảy bằng mười tám' },
    { setId: 1, text: '2 × 3 = ?', choices: ['5', '6', '7', '8'], correctIndex: 1, explanation: 'Hai nhân ba bằng sáu' },
    { setId: 1, text: '4 × 5 = ?', choices: ['18', '19', '20', '21'], correctIndex: 2, explanation: 'Bốn nhân năm bằng hai mươi' },
    { setId: 1, text: '3 × 7 = ?', choices: ['19', '20', '21', '22'], correctIndex: 2, explanation: 'Ba nhân bảy bằng hai mươi mốt' },
    { setId: 1, text: '6 × 6 = ?', choices: ['32', '34', '36', '38'], correctIndex: 2, explanation: 'Sáu nhân sáu bằng ba mươi sáu' },
    { setId: 1, text: '8 × 4 = ?', choices: ['30', '31', '32', '33'], correctIndex: 2, explanation: 'Tám nhân bốn bằng ba mươi hai' },
    { setId: 1, text: '10 ÷ 2 = ?', choices: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'Mười chia hai bằng năm' },
    { setId: 1, text: '15 ÷ 3 = ?', choices: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'Mười lăm chia ba bằng năm' },
    { setId: 1, text: '20 ÷ 4 = ?', choices: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'Hai mươi chia bốn bằng năm' },
    { setId: 1, text: '18 ÷ 6 = ?', choices: ['2', '3', '4', '5'], correctIndex: 1, explanation: 'Mười tám chia sáu bằng ba' },
    { setId: 1, text: '24 ÷ 8 = ?', choices: ['2', '3', '4', '5'], correctIndex: 1, explanation: 'Hai mươi bốn chia tám bằng ba' },

    // SET 2: KHOA HỌC (20 câu)
    { setId: 2, text: 'Con vật nào kêu "meo meo"?', choices: ['Chó', 'Mèo', 'Gà', 'Vịt'], correctIndex: 1, explanation: 'Mèo kêu meo meo' },
    { setId: 2, text: 'Con gà có mấy chân?', choices: ['1', '2', '3', '4'], correctIndex: 1, explanation: 'Gà có hai chân' },
    { setId: 2, text: 'Con nào biết bay?', choices: ['Cá', 'Chó', 'Chim', 'Mèo'], correctIndex: 2, explanation: 'Chim biết bay' },
    { setId: 2, text: 'Con nào sống dưới nước?', choices: ['Gà', 'Mèo', 'Cá', 'Chó'], correctIndex: 2, explanation: 'Cá sống dưới nước' },
    { setId: 2, text: 'Con voi có cái gì dài?', choices: ['Đuôi', 'Vòi', 'Chân', 'Tai'], correctIndex: 1, explanation: 'Con voi có vòi dài' },
    { setId: 2, text: 'Con nào có vỏ cứng?', choices: ['Cá', 'Chim', 'Rùa', 'Thỏ'], correctIndex: 2, explanation: 'Rùa có mai cứng' },
    { setId: 2, text: 'Ong làm gì?', choices: ['Sữa', 'Mật', 'Trứng', 'Lụa'], correctIndex: 1, explanation: 'Ong làm mật' },
    { setId: 2, text: 'Con nào nhảy giỏi?', choices: ['Gà', 'Vịt', 'Thỏ', 'Heo'], correctIndex: 2, explanation: 'Thỏ nhảy rất giỏi' },
    { setId: 2, text: 'Màu của lá cây là gì?', choices: ['Đỏ', 'Vàng', 'Xanh', 'Trắng'], correctIndex: 2, explanation: 'Lá cây màu xanh' },
    { setId: 2, text: 'Cây cần gì để sống?', choices: ['Đá', 'Kim loại', 'Nước', 'Dầu'], correctIndex: 2, explanation: 'Cây cần nước để sống' },
    { setId: 2, text: 'Hoa hướng dương hướng về đâu?', choices: ['Mặt trăng', 'Mặt trời', 'Ngôi sao', 'Mây'], correctIndex: 1, explanation: 'Hoa hướng dương hướng về mặt trời' },
    { setId: 2, text: 'Quả cam có màu gì?', choices: ['Xanh', 'Cam', 'Tím', 'Trắng'], correctIndex: 1, explanation: 'Quả cam màu cam' },
    { setId: 2, text: 'Mặt trời mọc ở hướng nào?', choices: ['Tây', 'Bắc', 'Đông', 'Nam'], correctIndex: 2, explanation: 'Mặt trời mọc ở hướng Đông' },
    { setId: 2, text: 'Mưa rơi từ đâu xuống?', choices: ['Núi', 'Biển', 'Mây', 'Đất'], correctIndex: 2, explanation: 'Mưa từ mây rơi xuống' },
    { setId: 2, text: 'Mùa nào lá cây rụng?', choices: ['Xuân', 'Hạ', 'Thu', 'Đông'], correctIndex: 2, explanation: 'Thu là mùa lá rụng' },
    { setId: 2, text: 'Biển có nước gì?', choices: ['Ngọt', 'Mặn', 'Chua', 'Đắng'], correctIndex: 1, explanation: 'Nước biển mặn' },
    { setId: 2, text: 'Núi cao nhất thế giới?', choices: ['Fansipan', 'Everest', 'Phú Sĩ', 'Alps'], correctIndex: 1, explanation: 'Everest cao nhất thế giới' },
    { setId: 2, text: '1 năm có bao nhiêu mùa?', choices: ['2', '3', '4', '5'], correctIndex: 2, explanation: 'Một năm có 4 mùa' },
    { setId: 2, text: 'Tuyết rơi khi trời?', choices: ['Nóng', 'Ấm', 'Mát', 'Lạnh'], correctIndex: 3, explanation: 'Tuyết rơi khi trời lạnh' },
    { setId: 2, text: 'Cầu vồng có mấy màu?', choices: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'Cầu vồng có 7 màu' },

    // SET 3: ĐỊA LÝ (15 câu)
    { setId: 3, text: 'Thủ đô của Việt Nam?', choices: ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Huế'], correctIndex: 1, explanation: 'Hà Nội là thủ đô' },
    { setId: 3, text: 'Việt Nam có bao nhiêu tỉnh thành?', choices: ['60', '63', '65', '70'], correctIndex: 1, explanation: 'VN có 63 tỉnh thành' },
    { setId: 3, text: 'Thành phố lớn nhất VN?', choices: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng'], correctIndex: 1, explanation: 'TP.HCM lớn nhất' },
    { setId: 3, text: 'Núi cao nhất Việt Nam?', choices: ['Fansipan', 'Bạch Mã', 'Bà Đen', 'Hòn Bà'], correctIndex: 0, explanation: 'Fansipan cao 3143m' },
    { setId: 3, text: 'Sông dài nhất VN?', choices: ['Sông Hồng', 'Sông Đồng Nai', 'Sông Mê Kông', 'Sông Hương'], correctIndex: 2, explanation: 'Mê Kông dài nhất' },
    { setId: 3, text: '1 tuần có bao nhiêu ngày?', choices: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'Một tuần 7 ngày' },
    { setId: 3, text: '1 năm có bao nhiêu tháng?', choices: ['10', '11', '12', '13'], correctIndex: 2, explanation: 'Một năm 12 tháng' },
    { setId: 3, text: 'Biển Đông ở phía nào?', choices: ['Bắc', 'Nam', 'Đông', 'Tây'], correctIndex: 2, explanation: 'Biển Đông ở phía Đông' },
    { setId: 3, text: 'Vịnh đẹp nhất thế giới VN?', choices: ['Vịnh Cam Ranh', 'Vịnh Hạ Long', 'Vịnh Nha Trang', 'Vịnh Vân Phong'], correctIndex: 1, explanation: 'Vịnh Hạ Long di sản TG' },
    { setId: 3, text: 'Cố đô của VN là đâu?', choices: ['Hà Nội', 'TP.HCM', 'Huế', 'Đà Nẵng'], correctIndex: 2, explanation: 'Huế là cố đô' },
    { setId: 3, text: 'Quốc kỳ VN có mấy sao?', choices: ['1', '2', '3', '5'], correctIndex: 0, explanation: 'Quốc kỳ có 1 ngôi sao' },
    { setId: 3, text: 'VN nằm ở châu lục nào?', choices: ['Châu Phi', 'Châu Âu', 'Châu Á', 'Châu Mỹ'], correctIndex: 2, explanation: 'VN thuộc Đông Nam Á' },
    { setId: 3, text: 'Sông Hồng chảy qua thành phố nào?', choices: ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'], correctIndex: 1, explanation: 'Sông Hồng qua Hà Nội' },
    { setId: 3, text: 'Đảo lớn nhất VN?', choices: ['Cát Bà', 'Phú Quốc', 'Cô Tô', 'Lý Sơn'], correctIndex: 1, explanation: 'Phú Quốc lớn nhất' },
    { setId: 3, text: 'Cao nguyên nào nổi tiếng?', choices: ['Mộc Châu', 'Đà Lạt', 'Tây Nguyên', 'Sapa'], correctIndex: 2, explanation: 'Cao nguyên Tây Nguyên' },

    // SET 4: TIẾNG VIỆT (10 câu)
    { setId: 4, text: 'Chọn từ đúng: Con ... biết bay', choices: ['cá', 'chó', 'chim', 'mèo'], correctIndex: 2, explanation: 'Chim là con vật biết bay' },
    { setId: 4, text: 'Điền vào chỗ trống: Mẹ ... đi chợ', choices: ['đi', 'về', 'ở', 'lên'], correctIndex: 0, explanation: 'Mẹ đi chợ' },
    { setId: 4, text: '"Ăn quả nhớ kẻ ..." là gì?', choices: ['mua', 'bán', 'trồng cây', 'hái'], correctIndex: 2, explanation: 'Thành ngữ: nhớ kẻ trồng cây' },
    { setId: 4, text: 'Từ trái nghĩa của "cao"?', choices: ['Thấp', 'Nhỏ', 'To', 'Rộng'], correctIndex: 0, explanation: 'Cao >< Thấp' },
    { setId: 4, text: 'Từ trái nghĩa của "nóng"?', choices: ['Ấm', 'Mát', 'Lạnh', 'Se'], correctIndex: 2, explanation: 'Nóng >< Lạnh' },
    { setId: 4, text: 'Chọn từ đúng: Anh ... đẹp', choices: ['viết', 'vẽ', 'vời', 'về'], correctIndex: 1, explanation: 'Anh vẽ tranh đẹp' },
    { setId: 4, text: '"Có công mài sắt có ngày nên ..."?', choices: ['vàng', 'bạc', 'kim', 'thép'], correctIndex: 2, explanation: 'Nên kim - thành ngữ' },
    { setId: 4, text: 'Số nhiều của "con gà"?', choices: ['gà con', 'những gà', 'những con gà', 'các gà'], correctIndex: 2, explanation: 'Số nhiều: những con gà' },
    { setId: 4, text: 'Âm đầu của "hoa"?', choices: ['h', 'o', 'a', 'oa'], correctIndex: 0, explanation: 'Âm đầu là h' },
    { setId: 4, text: 'Vần của "mèo"?', choices: ['m', 'è', 'o', 'èo'], correctIndex: 3, explanation: 'Vần là èo' }
];

async function uploadData() {
    console.log('🚀 Bắt đầu upload dữ liệu...\n');

    try {
        // Step 1: Upload question sets
        console.log('📦 Đang tạo Question Sets...');
        const setMapping = {}; // Map old setId to new setId

        for (let i = 0; i < questionSets.length; i++) {
            const set = questionSets[i];
            const response = await fetch(`${API_URL}/api/sets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(set)
            });

            if (!response.ok) {
                console.error(`❌ Lỗi tạo set "${set.name}":`, await response.text());
                continue;
            }

            const newSet = await response.json();
            setMapping[i + 1] = newSet.id;
            console.log(`✅ Tạo set "${set.name}" - ID: ${newSet.id}`);
        }

        console.log('');

        // Step 2: Upload questions
        console.log('📝 Đang thêm câu hỏi...');
        let uploaded = 0;

        for (const q of allQuestions) {
            const newSetId = setMapping[q.setId];
            if (!newSetId) {
                console.log(`⚠️  Bỏ qua câu (setId ${q.setId} không tồn tại)`);
                continue;
            }

            const questionData = {
                setId: newSetId,
                text: q.text,
                choices: q.choices,
                correctIndex: q.correctIndex,
                explanation: q.explanation || ''
            };

            const response = await fetch(`${API_URL}/api/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionData)
            });

            if (!response.ok) {
                console.error(`❌ Lỗi thêm câu "${q.text}":`, await response.text());
                continue;
            }

            uploaded++;
            if (uploaded % 10 === 0) {
                console.log(`   Đã upload ${uploaded}/${allQuestions.length} câu hỏi...`);
            }
        }

        console.log(`\n✅ Hoàn tất! Upload ${uploaded}/${allQuestions.length} câu hỏi thành công!`);
        console.log(`\n🎉 Tổng kết:`);
        console.log(`   - ${questionSets.length} bộ câu hỏi`);
        console.log(`   - ${uploaded} câu hỏi`);
        console.log(`\n🌐 Test tại: ${API_URL}/api/sets`);

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
    }
}

uploadData();
