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
 * Validation rules for dealership account registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),

    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),

    body('password')
        .isLength({ min: 8 })
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),

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

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error(
            'Registration validation errors:',
            errors.array()
        );

        return res.redirect('/register');
    }

    const {
        name,
        email,
        password
    } = req.body;

    try {

        const existingEmail = await emailExists(email);

        if (existingEmail) {

            console.log('Email already registered');

            return res.redirect('/register');
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await saveUser(
            name,
            email,
            hashedPassword
        );

        console.log(
            'Customer account created successfully'
        );

        res.redirect('/register/list');

    } catch (error) {

        console.error(
            'Registration error:',
            error
        );

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
    }

    res.render('forms/registration/list', {
        title: 'Registered Customers',
        users
    });
};

/**
 * GET /register - Display registration form
 */
router.get('/', showRegistrationForm);

/**
 * POST /register - Process registration
 */
router.post(
    '/',
    registrationValidation,
    processRegistration
);

/**
 * GET /register/list - Show registered users
 */
router.get('/list', showAllUsers);

export default router;