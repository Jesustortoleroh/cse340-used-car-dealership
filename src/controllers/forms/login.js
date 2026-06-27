import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import {
    findUserByEmail,
    verifyPassword
} from '../../models/forms/login.js';

const router = Router();

/**
 * Login validation rules
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage(
            'Please provide a valid email address'
        )
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage(
            'Password is required'
        )
];

/**
 * Display login form
 */
const showLoginForm = (req, res) => {

    res.render('forms/login/form', {
        title: 'Dealership Login'
    });
};

/**
 * Process login
 */
const processLogin = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        console.error(
            'Login validation errors:',
            errors.array()
        );

        return res.redirect('/login');
    }

    const {
        email,
        password
    } = req.body;

    try {

        const user =
            await findUserByEmail(email);

        if (!user) {

            console.log(
                'User not found'
            );

            return res.redirect('/login');
        }

        const validPassword =
            await verifyPassword(
                password,
                user.password
            );

        if (!validPassword) {

            console.log(
                'Invalid password'
            );

            return res.redirect('/login');
        }

        /**
         * Important:
         * Never store password in session
         */
        delete user.password;

        req.session.user = user;

        console.log(
            `User logged in: ${user.email}`
        );

        res.redirect('/dashboard');

    } catch (error) {

        console.error(
            'Login error:',
            error
        );

        res.redirect('/login');
    }
};

/**
 * Logout user
 */
const processLogout = (req, res) => {

    if (!req.session) {
        return res.redirect('/');
    }

    req.session.destroy((err) => {

        if (err) {

            console.error(
                'Error destroying session:',
                err
            );

            res.clearCookie('connect.sid');

            return res.redirect('/');
        }

        res.clearCookie('connect.sid');

        res.redirect('/');
    });
};

/**
 * Protected dashboard
 */
const showDashboard = (req, res) => {

    const user = req.session.user;

    const sessionData = req.session;

    /**
     * Security check
     */
    if (user && user.password) {

        console.error(
            'Security error: password found in user object'
        );

        delete user.password;
    }

    if (
        sessionData.user &&
        sessionData.user.password
    ) {

        console.error(
            'Security error: password found in session'
        );

        delete sessionData.user.password;
    }

    res.render('dashboard', {
        title: 'Customer Dashboard',
        user,
        sessionData
    });
};

/**
 * Routes
 */

router.get(
    '/',
    showLoginForm
);

router.post(
    '/',
    loginValidation,
    processLogin
);

export default router;

export {
    processLogout,
    showDashboard
};