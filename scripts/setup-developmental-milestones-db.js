/**
 * Developmental Milestones Database Setup
 * Creates tables for milestone tracking and vaccine compliance
 */

const db = require('../config/database');

async function setupDevelopmentalMilestonesDB() {
    try {
        console.log('🔧 Setting up Developmental Milestones database tables...\n');

        // Create developmental_milestones table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS developmental_milestones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                milestone_text VARCHAR(255) NOT NULL,
                category ENUM('motor', 'cognitive', 'social', 'communication') NOT NULL,
                type ENUM('gross_motor', 'fine_motor', 'cognitive', 'language', 'social_emotional') NOT NULL,
                expected_age_months INT NOT NULL,
                age_range_start INT NOT NULL,
                age_range_end INT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_age (expected_age_months),
                INDEX idx_category (category),
                INDEX idx_type (type)
            )
        `);
        console.log('✅ Created developmental_milestones table');

        // Create milestone_achievements table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS milestone_achievements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                milestone_id INT NOT NULL,
                achieved BOOLEAN NOT NULL DEFAULT FALSE,
                achievement_date DATE,
                notes TEXT,
                assessed_by INT,
                visit_id INT,
                clinic_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (milestone_id) REFERENCES developmental_milestones(id) ON DELETE CASCADE,
                FOREIGN KEY (assessed_by) REFERENCES auth_users(id) ON DELETE SET NULL,
                FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL,
                FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
                
                UNIQUE KEY unique_patient_milestone (patient_id, milestone_id),
                INDEX idx_patient (patient_id),
                INDEX idx_clinic (clinic_id),
                INDEX idx_achieved (achieved)
            )
        `);
        console.log('✅ Created milestone_achievements table');

        // Insert standard developmental milestones
        console.log('\n📝 Inserting standard developmental milestones...');
        
        const milestones = [
            // 2 months
            { text: 'Lifts head when on tummy', category: 'motor', type: 'gross_motor', age: 2, start: 1, end: 3 },
            { text: 'Begins to smile at people', category: 'social', type: 'social_emotional', age: 2, start: 1, end: 3 },
            { text: 'Makes gurgling sounds', category: 'communication', type: 'language', age: 2, start: 1, end: 3 },
            
            // 4 months
            { text: 'Holds head steady', category: 'motor', type: 'gross_motor', age: 4, start: 3, end: 5 },
            { text: 'Brings hands to mouth', category: 'motor', type: 'fine_motor', age: 4, start: 3, end: 5 },
            { text: 'Smiles spontaneously', category: 'social', type: 'social_emotional', age: 4, start: 3, end: 5 },
            { text: 'Babbles with expression', category: 'communication', type: 'language', age: 4, start: 3, end: 5 },
            
            // 6 months
            { text: 'Rolls over in both directions', category: 'motor', type: 'gross_motor', age: 6, start: 5, end: 7 },
            { text: 'Sits without support', category: 'motor', type: 'gross_motor', age: 6, start: 5, end: 8 },
            { text: 'Looks around at things nearby', category: 'cognitive', type: 'cognitive', age: 6, start: 5, end: 7 },
            { text: 'Responds to sounds by making sounds', category: 'communication', type: 'language', age: 6, start: 5, end: 7 },
            
            // 9 months
            { text: 'Stands while holding on', category: 'motor', type: 'gross_motor', age: 9, start: 8, end: 10 },
            { text: 'Picks up things with thumb and finger', category: 'motor', type: 'fine_motor', age: 9, start: 8, end: 10 },
            { text: 'Looks for things when dropped', category: 'cognitive', type: 'cognitive', age: 9, start: 8, end: 10 },
            { text: 'Understands "no"', category: 'communication', type: 'language', age: 9, start: 8, end: 10 },
            
            // 12 months
            { text: 'Walks holding on to furniture', category: 'motor', type: 'gross_motor', age: 12, start: 11, end: 14 },
            { text: 'Drinks from a cup', category: 'motor', type: 'fine_motor', age: 12, start: 11, end: 14 },
            { text: 'Plays games such as peek-a-boo', category: 'social', type: 'social_emotional', age: 12, start: 11, end: 14 },
            { text: 'Says "mama" and "dada"', category: 'communication', type: 'language', age: 12, start: 11, end: 14 },
            
            // 18 months
            { text: 'Walks alone', category: 'motor', type: 'gross_motor', age: 18, start: 16, end: 20 },
            { text: 'Scribbles on own', category: 'motor', type: 'fine_motor', age: 18, start: 16, end: 20 },
            { text: 'Knows what ordinary things are for', category: 'cognitive', type: 'cognitive', age: 18, start: 16, end: 20 },
            { text: 'Says several single words', category: 'communication', type: 'language', age: 18, start: 16, end: 20 },
            
            // 24 months
            { text: 'Kicks a ball', category: 'motor', type: 'gross_motor', age: 24, start: 22, end: 26 },
            { text: 'Builds tower of 4 or more blocks', category: 'motor', type: 'fine_motor', age: 24, start: 22, end: 26 },
            { text: 'Shows defiant behavior', category: 'social', type: 'social_emotional', age: 24, start: 22, end: 26 },
            { text: 'Points to things when named', category: 'communication', type: 'language', age: 24, start: 22, end: 26 },
            
            // 36 months
            { text: 'Climbs well', category: 'motor', type: 'gross_motor', age: 36, start: 34, end: 38 },
            { text: 'Turns book pages one at a time', category: 'motor', type: 'fine_motor', age: 36, start: 34, end: 38 },
            { text: 'Plays make-believe', category: 'cognitive', type: 'cognitive', age: 36, start: 34, end: 38 },
            { text: 'Follows 2-step instructions', category: 'communication', type: 'language', age: 36, start: 34, end: 38 }
        ];

        for (const milestone of milestones) {
            await db.execute(`
                INSERT IGNORE INTO developmental_milestones 
                (milestone_text, category, type, expected_age_months, age_range_start, age_range_end)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [milestone.text, milestone.category, milestone.type, milestone.age, milestone.start, milestone.end]);
        }
        
        console.log(`✅ Inserted ${milestones.length} standard developmental milestones`);

        // Update vaccine_records table if needed (already exists from parent portal setup)
        console.log('\n💉 Checking vaccine_records table...');
        
        const [vaccineTableExists] = await db.execute(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'vaccine_records'
        `);

        if (vaccineTableExists[0].count === 0) {
            await db.execute(`
                CREATE TABLE vaccine_records (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    patient_id INT NOT NULL,
                    vaccine_name VARCHAR(100) NOT NULL,
                    vaccine_code VARCHAR(20),
                    date_given DATE,
                    due_date DATE,
                    status ENUM('scheduled', 'given', 'overdue', 'skipped') DEFAULT 'scheduled',
                    batch_number VARCHAR(50),
                    manufacturer VARCHAR(100),
                    administered_by INT,
                    notes TEXT,
                    clinic_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                    FOREIGN KEY (administered_by) REFERENCES auth_users(id) ON DELETE SET NULL,
                    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
                    
                    INDEX idx_patient (patient_id),
                    INDEX idx_clinic (clinic_id),
                    INDEX idx_status (status),
                    INDEX idx_due_date (due_date)
                )
            `);
            console.log('✅ Created vaccine_records table');
        } else {
            console.log('✅ vaccine_records table already exists');
        }

        // Insert sample vaccine schedules for existing pediatric patients
        console.log('\n📅 Creating sample vaccine schedules...');
        
        const [pediatricPatients] = await db.execute(`
            SELECT id, date_of_birth, clinic_id FROM patients 
            WHERE patient_type = 'child' AND deleted_at IS NULL
            LIMIT 5
        `);

        const vaccineSchedule = [
            { name: 'Hepatitis B', code: 'HepB', months: [0, 2, 6] },
            { name: 'DTaP', code: 'DTaP', months: [2, 4, 6, 18] },
            { name: 'Polio (IPV)', code: 'IPV', months: [2, 4, 18] },
            { name: 'MMR', code: 'MMR', months: [12, 48] },
            { name: 'Varicella', code: 'VAR', months: [12, 48] }
        ];

        for (const patient of pediatricPatients) {
            const birthDate = new Date(patient.date_of_birth);
            const currentAge = Math.floor((new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30.44)); // Age in months
            
            for (const vaccine of vaccineSchedule) {
                for (const ageMonth of vaccine.months) {
                    const dueDate = new Date(birthDate);
                    dueDate.setMonth(dueDate.getMonth() + ageMonth);
                    
                    const status = ageMonth <= currentAge ? 
                        (Math.random() > 0.2 ? 'given' : 'overdue') : 'scheduled';
                    const dateGiven = status === 'given' ? dueDate : null;
                    
                    await db.execute(`
                        INSERT IGNORE INTO vaccine_records 
                        (patient_id, vaccine_name, vaccine_code, due_date, date_given, status, clinic_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [patient.id, vaccine.name, vaccine.code, dueDate, dateGiven, status, patient.clinic_id]);
                }
            }
        }
        
        console.log(`✅ Created vaccine schedules for ${pediatricPatients.length} pediatric patients`);

        // Insert sample milestone achievements
        console.log('\n🎯 Creating sample milestone achievements...');
        
        const [milestoneIds] = await db.execute(`
            SELECT id, expected_age_months FROM developmental_milestones 
            ORDER BY expected_age_months
        `);

        for (const patient of pediatricPatients) {
            const birthDate = new Date(patient.date_of_birth);
            const currentAge = Math.floor((new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30.44));
            
            // Add achievements for milestones the child should have reached
            const eligibleMilestones = milestoneIds.filter(m => m.expected_age_months <= currentAge);
            
            for (const milestone of eligibleMilestones) {
                const achieved = Math.random() > 0.15; // 85% achievement rate
                const achievementDate = achieved ? 
                    new Date(birthDate.getTime() + milestone.expected_age_months * 30.44 * 24 * 60 * 60 * 1000) : 
                    null;
                
                await db.execute(`
                    INSERT IGNORE INTO milestone_achievements 
                    (patient_id, milestone_id, achieved, achievement_date, clinic_id)
                    VALUES (?, ?, ?, ?, ?)
                `, [patient.id, milestone.id, achieved, achievementDate, patient.clinic_id]);
            }
        }
        
        console.log(`✅ Created milestone achievements for ${pediatricPatients.length} pediatric patients`);

        console.log('\n🎉 Developmental Milestones database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error setting up Developmental Milestones database:', error);
        throw error;
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDevelopmentalMilestonesDB()
        .then(() => {
            console.log('\n✨ Setup complete! Developmental milestones and vaccine tracking ready.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = { setupDevelopmentalMilestonesDB };