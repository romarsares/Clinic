/**
 * Parent Portal Database Setup
 * Creates patient_parents table for parent-child relationships
 */

const db = require('../config/database');

async function setupParentPortalDatabase() {
    try {
        console.log('🔧 Setting up Parent Portal database tables...\n');

        // Create patient_parents table for parent-child relationships
        await db.execute(`
            CREATE TABLE IF NOT EXISTS patient_parents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                parent_user_id INT NOT NULL,
                child_id INT NOT NULL,
                relationship_type ENUM('parent', 'guardian', 'caregiver') DEFAULT 'parent',
                clinic_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (parent_user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
                FOREIGN KEY (child_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
                
                UNIQUE KEY unique_parent_child (parent_user_id, child_id),
                INDEX idx_parent_user (parent_user_id),
                INDEX idx_child (child_id),
                INDEX idx_clinic (clinic_id)
            )
        `);
        console.log('✅ Created patient_parents table');

        // Create vaccine_records table for tracking vaccines
        await db.execute(`
            CREATE TABLE IF NOT EXISTS vaccine_records (
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

        // Create growth_measurements table for tracking child growth
        await db.execute(`
            CREATE TABLE IF NOT EXISTS growth_measurements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                visit_id INT,
                measurement_date DATE NOT NULL,
                age_months INT,
                height_cm DECIMAL(5,2),
                weight_kg DECIMAL(5,2),
                head_circumference_cm DECIMAL(5,2),
                bmi DECIMAL(5,2),
                percentile_height INT,
                percentile_weight INT,
                measured_by INT,
                notes TEXT,
                clinic_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
                FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL,
                FOREIGN KEY (measured_by) REFERENCES auth_users(id) ON DELETE SET NULL,
                FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
                
                INDEX idx_patient (patient_id),
                INDEX idx_clinic (clinic_id),
                INDEX idx_measurement_date (measurement_date)
            )
        `);
        console.log('✅ Created growth_measurements table');

        // Insert sample parent-child relationships (for testing)
        console.log('\n📝 Creating sample parent-child relationships...');
        
        // Get sample parent user (assuming user with Parent role exists)
        const [parentUsers] = await db.execute(`
            SELECT u.id, u.clinic_id 
            FROM auth_users u
            INNER JOIN user_roles ur ON u.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'Parent' AND u.deleted_at IS NULL
            LIMIT 1
        `);

        if (parentUsers.length > 0) {
            const parentUser = parentUsers[0];
            
            // Get sample child patients
            const [childPatients] = await db.execute(`
                SELECT id FROM patients 
                WHERE clinic_id = ? AND patient_type = 'child' AND deleted_at IS NULL
                LIMIT 2
            `, [parentUser.clinic_id]);

            // Create parent-child relationships
            for (const child of childPatients) {
                await db.execute(`
                    INSERT IGNORE INTO patient_parents (parent_user_id, child_id, clinic_id)
                    VALUES (?, ?, ?)
                `, [parentUser.id, child.id, parentUser.clinic_id]);
            }
            
            console.log(`✅ Created ${childPatients.length} parent-child relationships`);
        } else {
            console.log('⚠️  No parent users found - skipping sample relationships');
        }

        // Insert sample vaccine records
        console.log('\n💉 Creating sample vaccine records...');
        
        const [childPatients] = await db.execute(`
            SELECT id, clinic_id, date_of_birth FROM patients 
            WHERE patient_type = 'child' AND deleted_at IS NULL
            LIMIT 3
        `);

        const sampleVaccines = [
            { name: 'Hepatitis B', code: 'HepB', months: 0 },
            { name: 'DTaP (Diphtheria, Tetanus, Pertussis)', code: 'DTaP', months: 2 },
            { name: 'Polio (IPV)', code: 'IPV', months: 2 },
            { name: 'MMR (Measles, Mumps, Rubella)', code: 'MMR', months: 12 },
            { name: 'Varicella (Chickenpox)', code: 'VAR', months: 12 }
        ];

        for (const child of childPatients) {
            const birthDate = new Date(child.date_of_birth);
            
            for (const vaccine of sampleVaccines) {
                const dueDate = new Date(birthDate);
                dueDate.setMonth(dueDate.getMonth() + vaccine.months);
                
                const status = dueDate <= new Date() ? 'given' : 'scheduled';
                const dateGiven = status === 'given' ? dueDate : null;
                
                await db.execute(`
                    INSERT IGNORE INTO vaccine_records 
                    (patient_id, vaccine_name, vaccine_code, due_date, date_given, status, clinic_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [child.id, vaccine.name, vaccine.code, dueDate, dateGiven, status, child.clinic_id]);
            }
        }
        
        console.log(`✅ Created sample vaccine records for ${childPatients.length} children`);

        console.log('\n🎉 Parent Portal database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error setting up Parent Portal database:', error);
        throw error;
    }
}

// Run setup if called directly
if (require.main === module) {
    setupParentPortalDatabase()
        .then(() => {
            console.log('\n✨ Setup complete! You can now test the Parent Portal.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = { setupParentPortalDatabase };