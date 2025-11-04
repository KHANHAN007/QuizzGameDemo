// Seed assignments through API
// Run this with: node seed-assignments-api.js

const API_URL = 'https://quiz-game-api.quiz-game-khanhan.workers.dev/api'

async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    const data = await response.json()
    return data.token
}

async function createAssignment(token, assignment) {
    const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignment)
    })
    return await response.json()
}

async function seedAssignments() {
    try {
        // Login as teacher1
        console.log('Logging in as teacher1...')
        const token = await login('teacher1', 'password123')
        console.log('✓ Logged in successfully')

        // Get student IDs (assuming we know them from seed-users.sql)
        const class5A = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13] // hs5a01-10
        const class5B = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23] // hs5b01-10
        const class6A = [24, 25, 26, 27, 28] // hs6a01-05

        const now = Math.floor(Date.now() / 1000)
        const oneDay = 24 * 60 * 60
        const oneWeek = 7 * oneDay

        // Create assignments
        const assignments = [
            {
                title: 'Bài tập tuần 1 - Toán cơ bản',
                description: 'Ôn tập các phép tính cộng trừ nhân chia',
                questionSetId: 1,
                studentIds: class5A,
                dueDate: now + oneWeek
            },
            {
                title: 'Kiểm tra Khoa học tự nhiên',
                description: 'Bài kiểm tra về động vật và thiên nhiên',
                questionSetId: 2,
                studentIds: class5A,
                dueDate: now + (3 * oneDay)
            },
            {
                title: 'Bài tập Địa lý Việt Nam',
                description: 'Các câu hỏi về địa lý và văn hóa VN',
                questionSetId: 3,
                studentIds: class5B,
                dueDate: now + (14 * oneDay)
            },
            {
                title: 'Ôn tập cuối tuần - Toán',
                description: 'Luyện tập cuối tuần về toán học',
                questionSetId: 1,
                studentIds: [...class5A, ...class5B],
                dueDate: now + (2 * oneDay)
            },
            {
                title: 'Bài tập về nhà - Khoa học',
                description: 'Bài tập thường xuyên môn khoa học',
                questionSetId: 2,
                studentIds: class6A,
                dueDate: now + (5 * oneDay)
            }
        ]

        for (let i = 0; i < assignments.length; i++) {
            console.log(`Creating assignment ${i + 1}/${assignments.length}: ${assignments[i].title}`)
            const result = await createAssignment(token, assignments[i])
            console.log(`✓ Created: ${result.title || 'Success'}`)
        }

        console.log('\n✅ All assignments created successfully!')
        console.log('\n📝 Summary:')
        console.log(`   - 5 assignments created`)
        console.log(`   - Assigned to 3 classes`)
        console.log(`   - Ready for students to complete`)

    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error(error)
    }
}

seedAssignments()
