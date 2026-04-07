const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const DEFAULT_TEACHERS = [
    { ism: 'Aziza', fam: 'Karimova', tel: '+998901234567', login: 'aziza', pass: 'aziza123' },
    { ism: 'Jasur', fam: 'Toshmatov', tel: '+998911234567', login: 'jasur', pass: 'jas456' },
    { ism: 'Malika', fam: 'Yusupova', tel: '+998901112233', login: 'malika', pass: 'mal789' }
];

const DEFAULT_GROUPS = [
    {
        teacherId: 1, level: 'Beginner', suffix: '', name: "Ingliz tili - Beginner", fee: 500000, ts: '09:30', te: '11:30',
        days: ['Du', 'Ch', 'Ju'],
        students: [
            { id: 1, name: 'Nodira Hamidova', phone: '+998901111111' },
            { id: 2, name: 'Sardor Mirzayev', phone: '+998902222222' },
            { id: 3, name: 'Zilola Qosimova', phone: '+998903333333' }
        ]
    },
    {
        teacherId: 1, level: 'Elementary', suffix: 'B guruh', name: "Ingliz tili - Elementary (B guruh)", fee: 550000, ts: '14:30', te: '16:30',
        days: ['Se', 'Pa', 'Sh'],
        students: [
            { id: 1, name: 'Bobur Eshmatov', phone: '+998904444444' },
            { id: 2, name: 'Kamola Tursunova', phone: '+998905555555' }
        ]
    },
    {
        teacherId: 2, level: 'Pre-IELTS', suffix: '', name: "Ingliz tili - Pre-IELTS", fee: 600000, ts: '16:30', te: '18:30',
        days: ['Du', 'Ch', 'Ju'],
        students: [
            { id: 1, name: 'Ulugbek Nazarov', phone: '+998906666666' },
            { id: 2, name: 'Shahnoza Alieva', phone: '+998907777777' },
            { id: 3, name: 'Doniyor Rahimov', phone: '+998908888888' }
        ]
    },
    {
        teacherId: 3, level: 'Graduation', suffix: '', name: "Ingliz tili - Graduation", fee: 700000, ts: '18:30', te: '20:30',
        days: ['Se', 'Pa', 'Sh'],
        students: [
            { id: 1, name: "Asilbek Yo'ldoshev", phone: '+998901010101' },
            { id: 2, name: 'Munira Hasanova', phone: '+998902020202' }
        ]
    }
];

const DEFAULT_PAYMENTS = [
    { studentName: 'Nodira Hamidova', groupId: 1, month: 'Mart', amount: 500000, date: '2025-03-01', paid: 1 },
    { studentName: 'Sardor Mirzayev', groupId: 1, month: 'Mart', amount: 500000, date: '2025-03-03', paid: 1 },
    { studentName: 'Zilola Qosimova', groupId: 1, month: 'Mart', amount: 500000, date: null, paid: 0 },
    { studentName: 'Bobur Eshmatov', groupId: 2, month: 'Mart', amount: 550000, date: '2025-03-02', paid: 1 },
    { studentName: 'Kamola Tursunova', groupId: 2, month: 'Mart', amount: 550000, date: null, paid: 0 },
    { studentName: 'Ulugbek Nazarov', groupId: 3, month: 'Mart', amount: 600000, date: '2025-03-05', paid: 1 }
];

function initDB() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ism TEXT, fam TEXT, tel TEXT, login TEXT, pass TEXT
        );

        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacherId INTEGER, level TEXT, suffix TEXT, name TEXT, fee INTEGER,
            ts TEXT, te TEXT, days TEXT, students TEXT,
            FOREIGN KEY(teacherId) REFERENCES teachers(id)
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentName TEXT, groupId INTEGER, month TEXT, amount INTEGER, date TEXT,
            paid INTEGER DEFAULT 0,
            FOREIGN KEY(groupId) REFERENCES groups(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            adminLogin TEXT, adminPass TEXT, centerName TEXT, centerAddr TEXT,
            centerPhone TEXT, centerEmail TEXT, groupCapacity INTEGER, courses TEXT
        );
    `);

    initDefaultData();
}

function initDefaultData() {
    const defaultCourses = JSON.stringify([
        { key: 'Beginner', fee: 500000 },
        { key: 'Elementary', fee: 550000 },
        { key: 'Pre-IELTS', fee: 600000 },
        { key: 'Introduction', fee: 650000 },
        { key: 'Graduation', fee: 700000 }
    ]);

    const settingsRow = db.prepare('SELECT id FROM settings WHERE id = 1').get();
    if (!settingsRow) {
        db.prepare(`INSERT INTO settings (id, adminLogin, adminPass, centerName, centerAddr, centerPhone, centerEmail, groupCapacity, courses)
                    VALUES (1, 'admin', 'admin123', 'Everest O''quv Markazi', 'Toshkent sh., Chilonzor t.', '+998 90 123 45 67', 'info@everest.uz', 15, ?)`)
            .run(defaultCourses);
    }

    const teacherCount = db.prepare('SELECT COUNT(*) AS count FROM teachers').get();
    if (teacherCount.count === 0) {
        const teacherStmt = db.prepare('INSERT OR IGNORE INTO teachers (id, ism, fam, tel, login, pass) VALUES (?, ?, ?, ?, ?, ?)');
        DEFAULT_TEACHERS.forEach((teacher, index) => {
            teacherStmt.run(index + 1, teacher.ism, teacher.fam, teacher.tel, teacher.login, teacher.pass);
        });
    }

    const groupCount = db.prepare('SELECT COUNT(*) AS count FROM groups').get();
    if (groupCount.count === 0) {
        const groupStmt = db.prepare('INSERT OR IGNORE INTO groups (id, teacherId, level, suffix, name, fee, ts, te, days, students) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        DEFAULT_GROUPS.forEach((group, index) => {
            groupStmt.run(index + 1, group.teacherId, group.level, group.suffix, group.name, group.fee, group.ts, group.te, JSON.stringify(group.days), JSON.stringify(group.students));
        });
    }

    const paymentCount = db.prepare('SELECT COUNT(*) AS count FROM payments').get();
    if (paymentCount.count === 0) {
        const paymentStmt = db.prepare('INSERT OR IGNORE INTO payments (id, studentName, groupId, month, amount, date, paid) VALUES (?, ?, ?, ?, ?, ?, ?)');
        DEFAULT_PAYMENTS.forEach((payment, index) => {
            paymentStmt.run(index + 1, payment.studentName, payment.groupId, payment.month, payment.amount, payment.date, payment.paid);
        });
    }
}

initDB();

module.exports = db;