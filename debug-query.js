const db = require('./src/config/database');

async function debug() {
    try {
        const clinicId = 1;
        const limit = 5;
        const offset = 0;
        
        const whereClause = 'WHERE p.clinic_id = ? AND p.deleted_at IS NULL';
        
        const query = `
            SELECT p.id, p.patient_code, p.full_name, p.first_name, p.last_name, p.birth_date, 
                   p.gender, p.contact_number, p.email, p.created_at,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age,
                   (SELECT COUNT(*) FROM patients c WHERE c.parent_patient_id = p.id AND c.deleted_at IS NULL) as children_count
            FROM patients p
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const params = [clinicId, parseInt(limit), parseInt(offset)];
        console.log('Query:', query);
        console.log('Params:', params);
        console.log('Param types:', params.map(p => typeof p));
        
        const [patients] = await db.execute(query, params);
        console.log('Success:', patients.length, 'patients found');
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await db.closePool();
    }
}

debug();
