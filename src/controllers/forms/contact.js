import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
    createContactForm,
    getAllContactForms
} from '../../models/forms/contact.js';

const router = Router();

/**
 * Display contact page
 */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Our Dealership'
    });
};

/**
 * Process contact form submission
 */
const handleContactSubmission = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Store each validation error as a flash message
        errors.array().forEach(error => {
            // Guard against missing flash function
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });

        return res.redirect('/contact');
    }

    const {
        customer_name,
        email,
        phone,
        subject,
        message
    } = req.body;

    try {
        // Save to database
        await createContactForm(
            customer_name,
            email,
            phone,
            subject,
            message
        );

        // Success message
        if (typeof req.flash === 'function') {
            req.flash(
                'success',
                `Thank you for contacting our dealership, ${customer_name}! We will respond as soon as possible.`
            );
        }

        res.redirect('/contact');

    } catch (error) {
        console.error(
            'Error saving inquiry:',
            error
        );

        // Error message
        if (typeof req.flash === 'function') {
            req.flash(
                'error',
                'Unable to submit your message at this time. Please try again later.'
            );
        }

        res.redirect('/contact');
    }
};

/**
 * Show all dealership inquiries
 */
const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error(
            'Error retrieving inquiries:',
            error
        );

        // Only attempt to use flash if it exists
        if (typeof req.flash === 'function') {
            req.flash(
                'error',
                'Unable to retrieve customer inquiries. Please try again later.'
            );
        }
    }

    res.render('forms/contact/responses', {
        title: 'Customer Inquiries',
        contactForms
    });
};

/**
 * GET /contact
 */
router.get(
    '/',
    showContactForm
);

/**
 * POST /contact - Enhanced validation
 */
router.post(
    '/',
    [
        // Customer Name validation with character restrictions
        body('customer_name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z\s'-]+$/)
            .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

        // Email validation with maximum length
        body('email')
            .trim()
            .isEmail()
            .withMessage('A valid email address is required')
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Email address is too long'),

        // Phone validation
        body('phone')
            .trim()
            .matches(/^[0-9()+\-\s]{7,20}$/)
            .withMessage('Please enter a valid phone number'),

        // Subject validation - Enhanced with max length 255 and character restrictions
        body('subject')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Subject must be between 2 and 255 characters')
            .matches(/^[a-zA-Z0-9\s\-.,!?]+$/)
            .withMessage('Subject contains invalid characters'),

        // Message validation - Enhanced spam detection
        body('message')
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters')
            .custom((value) => {
                // Check for spam patterns (excessive repetition)
                // This compares unique words to total words to detect repetitive spam
                const words = value.split(/\s+/);
                const uniqueWords = new Set(words);
                
                // If message has more than 20 words and less than 30% are unique,
                // it's likely spam (repetitive content)
                if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
                    throw new Error('Message appears to be spam');
                }
                
                // Check for common spam phrases (keep the existing check too)
                const invalidMessages = [
                    'hi',
                    'hello',
                    'test',
                    'ok',
                    'hey',
                    'whats up',
                    'yo'
                ];

                const trimmedValue = value.toLowerCase().trim();
                
                if (invalidMessages.includes(trimmedValue)) {
                    throw new Error('Please provide a more detailed message about your inquiry');
                }

                return true;
            })
    ],
    handleContactSubmission
);

/**
 * GET /contact/responses
 */
router.get(
    '/responses',
    showContactResponses
);

export default router;