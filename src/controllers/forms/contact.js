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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
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
        await createContactForm(
            customer_name,
            email,
            phone,
            subject,
            message
        );

        console.log('Customer inquiry submitted successfully');

        res.redirect('/contact/responses');
    } catch (error) {
        console.error('Error saving inquiry:', error);
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
        console.error('Error retrieving inquiries:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Customer Inquiries',
        contactForms
    });
};

/**
 * GET /contact
 */
router.get('/', showContactForm);

/**
 * POST /contact
 */
router.post(
    '/',
    [
        body('customer_name')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),

        body('email')
            .trim()
            .isEmail()
            .withMessage('A valid email address is required'),

        body('phone')
            .trim()
            .matches(/^[0-9()+\-\s]{7,20}$/)
            .withMessage('Please enter a valid phone number'),

        body('subject')
            .trim()
            .isLength({ min: 2 })
            .withMessage(
                'Please provide a subject for your inquiry'
            ),

        body('message')
            .trim()
            .isLength({ min: 10 })
            .withMessage(
                'Please provide more details about your inquiry'
            )
            .custom((value) => {
                const invalidMessages = [
                    'hi',
                    'hello',
                    'test',
                    'ok'
                ];

                if (
                    invalidMessages.includes(
                        value.toLowerCase().trim()
                    )
                ) {
                    throw new Error(
                        'Please provide a more detailed message'
                    );
                }

                return true;
            })
    ],
    handleContactSubmission
);

/**
 * GET /contact/responses
 */
router.get('/responses', showContactResponses);

export default router;