import { body } from 'express-validator';

/**
 * Contact validation rules
 */
const contactValidation = [
    body('customer_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('A valid email address is required')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),

    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[0-9()+\-\s]{7,20}$/)
        .withMessage('Please enter a valid phone number'),

    body('subject')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Subject must be between 2 and 255 characters')
        .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
        .withMessage('Subject contains invalid characters'),

    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
        .custom((value) => {

            const words = value.split(/\s+/);
            const uniqueWords = new Set(words);

            if (
                words.length > 20 &&
                uniqueWords.size / words.length < 0.3
            ) {
                throw new Error('Message appears to be spam');
            }

            const invalidMessages = [
                'hi',
                'hello',
                'test',
                'ok',
                'hey',
                'whats up',
                'yo'
            ];

            const trimmedValue =
                value.toLowerCase().trim();

            if (
                invalidMessages.includes(
                    trimmedValue
                )
            ) {
                throw new Error(
                    'Please provide a more detailed message about your inquiry'
                );
            }

            return true;

        })
];

/**
 * Login Validation
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
];

/**
 * Registration Validation
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),

    body('emailConfirm')
        .trim()
        .custom((value, { req }) =>
            value === req.body.email
        )
        .withMessage('Email addresses must match'),

    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),

    body('passwordConfirm')
        .custom((value, { req }) =>
            value === req.body.password
        )
        .withMessage('Passwords must match')
];

/**
 * Validation rules for editing user accounts
 */
const updateAccountValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long')
];

/**
 * Review validation rules
 */
const reviewValidation = [

    body('rating')
        .notEmpty()
        .withMessage(
            'Please select a star rating before submitting your review.'
        )
        .isInt({ min: 1, max: 5 })
        .withMessage(
            'Rating must be between 1 and 5.'
        ),

    body('comment')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage(
            'Review must be between 10 and 1000 characters'
        )
        .custom((value) => {

            const invalidMessages = [
                'good',
                'nice',
                'ok',
                'great',
                'cool',
                'test'
            ];

            const review =
                value.toLowerCase().trim();

            if (
                invalidMessages.includes(review)
            ) {
                throw new Error(
                    'Please provide a more detailed review'
                );
            }

            return true;

        })
];

/**
 * Service Request Validation
 */
const serviceRequestValidation = [

    body('service_type_id')
        .isInt({ min: 1 })
        .withMessage(
            'Please select a valid service type'
        ),

    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage(
            'Description must be between 10 and 1000 characters'
        ),

    body('vehicle_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage(
            'Vehicle ID must be a valid number'
        )

];

export {
    contactValidation,
    registrationValidation,
    loginValidation,
    updateAccountValidation,
    reviewValidation,
    serviceRequestValidation
};