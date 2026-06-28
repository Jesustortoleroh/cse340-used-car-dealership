import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';

import {
    emailExists,
    saveUser,
    getAllUsers
} from '../../models/forms/registration.js';

const router = Router();

/**
 * Enhanced Registration Validation Rules
 * - Name: 2-100 characters, letters, spaces, hyphens, apostrophes
 * - Email: Valid email format, max 255 characters
 * - EmailConfirm: Must match email
 * - Password: 8-128 characters, uppercase, lowercase, number, special character
 * - PasswordConfirm: Must match password
 */
const registrationValidation = [
    // Name validation - with length and character restrictions
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

    // Email validation - with maximum length
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),

    // Email confirmation - must match email
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),

    // Password validation - with length and complexity requirements
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),

    // Password confirmation - must match password
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'Create Your Dealership Account'
    });
};

/**
 * Handle user registration with validation and password hashing.
 */
const processRegistration = async (req, res) => {
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

        return res.redirect('/register');
    }

    const {
        name,
        email,
        password
    } = req.body;

    try {
        // Check if email already exists
        const existingEmail = await emailExists(email);

        if (existingEmail) {
            // Warning message for duplicate email
            if (typeof req.flash === 'function') {
                req.flash(
                    'warning',
                    'An account with this email address already exists. Please log in or use a different email.'
                );
            }

            return res.redirect('/register');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        await saveUser(
            name,
            email,
            hashedPassword
        );

        // Success message
        if (typeof req.flash === 'function') {
            req.flash(
                'success',
                `Welcome to our dealership, ${name}! Your account has been created successfully. Please sign in to continue.`
            );
        }

        res.redirect('/login');

    } catch (error) {
        console.error(
            'Registration error:',
            error
        );

        // Error message for server issues
        if (typeof req.flash === 'function') {
            req.flash(
                'error',
                'Unable to create your account at this time. Please try again later.'
            );
        }

        res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error(
            'Error retrieving users:',
            error
        );

        // Only attempt to use flash if it exists
        if (typeof req.flash === 'function') {
            req.flash(
                'error',
                'Unable to retrieve registered customer information. Please try again later.'
            );
        }
    }

    res.render('forms/registration/list', {
        title: 'Registered Customers',
        users
    });
};

/**
 * GET /register - Display registration form
 */
router.get(
    '/',
    showRegistrationForm
);

/**
 * POST /register - Process registration with enhanced validation
 */
router.post(
    '/',
    registrationValidation,
    processRegistration
);

/**
 * GET /register/list - Show registered users
 */
router.get(
    '/list',
    showAllUsers
);

export default router;


