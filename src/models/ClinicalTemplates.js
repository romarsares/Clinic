/**
 * Clinical Templates Model - Standardized Clinical Documentation
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles clinical note templates for consistent documentation
 */

class ClinicalTemplates {
    constructor(db) {
        this.db = db;
    }

    /**
     * Get pediatric consultation template
     */
    static getPediatricTemplate() {
        return {
            name: 'Pediatric Consultation',
            sections: {
                chief_complaint: {
                    label: 'Chief Complaint',
                    placeholder: 'Patient presents with...',
                    required: true
                },
                history_of_present_illness: {
                    label: 'History of Present Illness',
                    placeholder: 'Onset, duration, character, associated symptoms...',
                    required: true
                },
                review_of_systems: {
                    label: 'Review of Systems',
                    template: `
General: Fever, weight loss/gain, fatigue
HEENT: Headache, vision changes, hearing loss, sore throat
Respiratory: Cough, shortness of breath, wheezing
Cardiovascular: Chest pain, palpitations
GI: Nausea, vomiting, diarrhea, constipation, abdominal pain
GU: Dysuria, frequency, urgency
Musculoskeletal: Joint pain, muscle weakness
Neurological: Seizures, developmental concerns
Skin: Rash, lesions
                `.trim(),
                    required: false
                },
                physical_examination: {
                    label: 'Physical Examination',
                    template: `
General: Alert, well-appearing, no acute distress
Vital Signs: [Auto-filled from vital signs]
Growth: Weight ___kg (___%), Height ___cm (___%), BMI ___
HEENT: Normocephalic, atraumatic, PERRL, TMs clear
Neck: Supple, no lymphadenopathy
Chest: Clear to auscultation bilaterally
Heart: RRR, no murmurs
Abdomen: Soft, non-tender, no organomegaly
Extremities: No edema, normal range of motion
Neurological: Age-appropriate development
Skin: No rashes or lesions
                `.trim(),
                    required: true
                },
                assessment_and_plan: {
                    label: 'Assessment & Plan',
                    placeholder: 'Primary diagnosis, differential diagnoses, treatment plan...',
                    required: true
                }
            }
        };
    }

    /**
     * Get general consultation template
     */
    static getGeneralTemplate() {
        return {
            name: 'General Consultation',
            sections: {
                chief_complaint: {
                    label: 'Chief Complaint',
                    placeholder: 'Patient presents with...',
                    required: true
                },
                history_of_present_illness: {
                    label: 'History of Present Illness',
                    placeholder: 'Onset, duration, character, associated symptoms...',
                    required: true
                },
                physical_examination: {
                    label: 'Physical Examination',
                    template: `
General: 
Vital Signs: [Auto-filled from vital signs]
HEENT: 
Neck: 
Chest: 
Heart: 
Abdomen: 
Extremities: 
Neurological: 
Skin: 
                `.trim(),
                    required: true
                },
                assessment_and_plan: {
                    label: 'Assessment & Plan',
                    placeholder: 'Diagnosis and treatment plan...',
                    required: true
                }
            }
        };
    }

    /**
     * Get follow-up visit template
     */
    static getFollowUpTemplate() {
        return {
            name: 'Follow-up Visit',
            sections: {
                interval_history: {
                    label: 'Interval History',
                    placeholder: 'Changes since last visit, compliance with treatment...',
                    required: true
                },
                current_symptoms: {
                    label: 'Current Symptoms',
                    placeholder: 'Current symptom status, improvements, new concerns...',
                    required: true
                },
                physical_examination: {
                    label: 'Physical Examination',
                    template: `
General: 
Vital Signs: [Auto-filled from vital signs]
Focused Exam: 
                `.trim(),
                    required: true
                },
                assessment_and_plan: {
                    label: 'Assessment & Plan',
                    placeholder: 'Response to treatment, plan modifications...',
                    required: true
                }
            }
        };
    }

    /**
     * Get all available templates
     */
    static getAllTemplates() {
        return {
            pediatric: this.getPediatricTemplate(),
            general: this.getGeneralTemplate(),
            followup: this.getFollowUpTemplate()
        };
    }

    /**
     * Get template by type
     */
    static getTemplate(templateType) {
        const templates = this.getAllTemplates();
        return templates[templateType] || templates.general;
    }

    /**
     * Validate template data
     */
    static validateTemplateData(templateType, data) {
        const template = this.getTemplate(templateType);
        const errors = [];

        Object.entries(template.sections).forEach(([sectionKey, section]) => {
            if (section.required && (!data[sectionKey] || data[sectionKey].trim() === '')) {
                errors.push(`${section.label} is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate template with pre-filled data
     */
    static generateTemplateWithData(templateType, visitData = {}) {
        const template = this.getTemplate(templateType);
        const generated = { ...template };

        // Pre-fill vital signs if available
        if (visitData.vital_signs) {
            const vitals = visitData.vital_signs;
            const vitalString = `T: ${vitals.temperature || '___'}°C, BP: ${vitals.blood_pressure_systolic || '___'}/${vitals.blood_pressure_diastolic || '___'}, HR: ${vitals.heart_rate || '___'}, RR: ${vitals.respiratory_rate || '___'}, O2Sat: ${vitals.oxygen_saturation || '___'}%`;
            
            // Replace vital signs placeholder in templates
            Object.keys(generated.sections).forEach(sectionKey => {
                if (generated.sections[sectionKey].template) {
                    generated.sections[sectionKey].template = generated.sections[sectionKey].template.replace(
                        '[Auto-filled from vital signs]', 
                        vitalString
                    );
                }
            });
        }

        // Pre-fill growth data for pediatric template
        if (templateType === 'pediatric' && visitData.vital_signs) {
            const vitals = visitData.vital_signs;
            if (vitals.weight && vitals.height && vitals.bmi) {
                const growthString = `Weight ${vitals.weight}kg, Height ${vitals.height}cm, BMI ${vitals.bmi}`;
                generated.sections.physical_examination.template = generated.sections.physical_examination.template.replace(
                    'Weight ___kg (___%), Height ___cm (___%), BMI ___',
                    growthString
                );
            }
        }

        return generated;
    }
}

module.exports = ClinicalTemplates;