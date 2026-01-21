const Joi = require('joi');

class ValidationController {
    // Common validation schemas
    static schemas = {
        // Patient validation
        patient: Joi.object({
            firstName: Joi.string().min(2).max(50).required().messages({
                'string.min': 'First name must be at least 2 characters',
                'string.max': 'First name cannot exceed 50 characters',
                'any.required': 'First name is required'
            }),
            lastName: Joi.string().min(2).max(50).required(),
            dateOfBirth: Joi.date().max('now').required().messages({
                'date.max': 'Date of birth cannot be in the future'
            }),
            email: Joi.string().email().optional(),
            phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).min(10).max(15).required().messages({
                'string.pattern.base': 'Please enter a valid phone number'
            }),
            gender: Joi.string().valid('male', 'female', 'other').required()
        }),

        // Appointment validation
        appointment: Joi.object({
            patientId: Joi.number().integer().positive().required(),
            doctorId: Joi.number().integer().positive().required(),
            appointmentDate: Joi.date().min('now').required().messages({
                'date.min': 'Appointment date cannot be in the past'
            }),
            appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
            type: Joi.string().valid('consultation', 'follow-up', 'emergency').required(),
            notes: Joi.string().max(500).optional()
        }),

        // Visit validation
        visit: Joi.object({
            patientId: Joi.number().integer().positive().required(),
            doctorId: Joi.number().integer().positive().required(),
            chiefComplaint: Joi.string().min(5).max(1000).required(),
            vitalSigns: Joi.object({
                temperature: Joi.number().min(35).max(42).optional(),
                bloodPressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).optional(),
                heartRate: Joi.number().min(40).max(200).optional(),
                respiratoryRate: Joi.number().min(8).max(40).optional(),
                weight: Joi.number().min(0.5).max(300).optional(),
                height: Joi.number().min(30).max(250).optional()
            }).optional(),
            diagnosis: Joi.array().items(
                Joi.object({
                    code: Joi.string().required(),
                    description: Joi.string().required(),
                    type: Joi.string().valid('primary', 'secondary').required()
                })
            ).min(1).required(),
            treatment: Joi.string().max(2000).optional(),
            medications: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    dosage: Joi.string().required(),
                    frequency: Joi.string().required(),
                    duration: Joi.string().required()
                })
            ).optional()
        }),

        // User validation
        user: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            }),
            firstName: Joi.string().min(2).max(50).required(),
            lastName: Joi.string().min(2).max(50).required(),
            role: Joi.string().valid('owner', 'doctor', 'staff', 'lab_technician').required(),
            phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).min(10).max(15).optional()
        })
    };

    // Validate request data
    static validate(data, schemaName) {
        const schema = this.schemas[schemaName];
        if (!schema) {
            throw new Error(`Validation schema '${schemaName}' not found`);
        }

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context.value
            }));

            return {
                isValid: false,
                errors: validationErrors,
                data: null
            };
        }

        return {
            isValid: true,
            errors: [],
            data: value
        };
    }

    // Custom validation middleware
    static validateMiddleware(schemaName) {
        return (req, res, next) => {
            const validation = this.validate(req.body, schemaName);
            
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            req.validatedData = validation.data;
            next();
        };
    }

    // Date/time validation helpers
    static validateDateTime(dateTime, timezone = 'UTC') {
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) {
                return { isValid: false, message: 'Invalid date format' };
            }

            // Check if date is not too far in the past or future
            const now = new Date();
            const minDate = new Date(now.getFullYear() - 100, 0, 1);
            const maxDate = new Date(now.getFullYear() + 10, 11, 31);

            if (date < minDate || date > maxDate) {
                return { isValid: false, message: 'Date is outside acceptable range' };
            }

            return { isValid: true, date };
        } catch (error) {
            return { isValid: false, message: 'Invalid date format' };
        }
    }

    // Medical data validation
    static validateVitalSigns(vitalSigns) {
        const errors = [];

        if (vitalSigns.temperature) {
            if (vitalSigns.temperature < 35 || vitalSigns.temperature > 42) {
                errors.push({ field: 'temperature', message: 'Temperature must be between 35°C and 42°C' });
            }
        }

        if (vitalSigns.bloodPressure) {
            const bpPattern = /^(\d{2,3})\/(\d{2,3})$/;
            const match = vitalSigns.bloodPressure.match(bpPattern);
            if (!match) {
                errors.push({ field: 'bloodPressure', message: 'Blood pressure must be in format XXX/XXX' });
            } else {
                const systolic = parseInt(match[1]);
                const diastolic = parseInt(match[2]);
                if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
                    errors.push({ field: 'bloodPressure', message: 'Blood pressure values are outside normal range' });
                }
            }
        }

        if (vitalSigns.heartRate) {
            if (vitalSigns.heartRate < 40 || vitalSigns.heartRate > 200) {
                errors.push({ field: 'heartRate', message: 'Heart rate must be between 40 and 200 bpm' });
            }
        }

        return { isValid: errors.length === 0, errors };
    }

    // File upload validation
    static validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
        const errors = [];

        if (!file) {
            errors.push({ field: 'file', message: 'No file provided' });
            return { isValid: false, errors };
        }

        // Check file size
        if (file.size > maxSize) {
            errors.push({ 
                field: 'file', 
                message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB` 
            });
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
            errors.push({ 
                field: 'file', 
                message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
            });
        }

        return { isValid: errors.length === 0, errors };
    }

    // Sanitization helpers
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, ''); // Remove event handlers
    }

    // Error response formatter
    static formatErrorResponse(errors, message = 'Validation failed') {
        return {
            success: false,
            message,
            errors: errors.map(error => ({
                field: error.field,
                message: error.message,
                code: error.code || 'VALIDATION_ERROR'
            })),
            timestamp: new Date().toISOString()
        };
    }

    // Success response formatter
    static formatSuccessResponse(data, message = 'Operation successful') {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    // Batch validation for multiple records
    static validateBatch(records, schemaName) {
        const results = [];
        let hasErrors = false;

        records.forEach((record, index) => {
            const validation = this.validate(record, schemaName);
            results.push({
                index,
                isValid: validation.isValid,
                errors: validation.errors,
                data: validation.data
            });

            if (!validation.isValid) {
                hasErrors = true;
            }
        });

        return {
            isValid: !hasErrors,
            results,
            validRecords: results.filter(r => r.isValid).map(r => r.data),
            invalidRecords: results.filter(r => !r.isValid)
        };
    }
}

module.exports = ValidationController;