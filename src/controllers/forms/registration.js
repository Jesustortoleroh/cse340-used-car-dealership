import { validationResult } from 'express-validator';
import { hashPassword, createUser, findUserByEmail } from '../../models/forms/registration.js';
import { notifyWelcome } from '../../models/notifications/notificationTriggers.js';

/**
 * Display registration form
 */
const showRegistrationForm = (req, res) => {
    // Get flash messages and form data
    const messages = typeof req.flash === 'function' ? req.flash() : {};
    const formData = req.session?.formData || {};
    
    // Clear session data after retrieving
    delete req.session.formData;
    delete req.session.errors;

    res.render('forms/registration/form', {
        title: 'Create Account',
        messages,
        formData,
        user: req.session?.user || null,
        isLoggedIn: !!req.session?.user
    });
};

/**
 * Process registration form submission
 */
const processRegistration = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Store validation errors as flash messages
        errors.array().forEach(error => {
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        
        // Store form data to repopulate the form
        req.session.formData = req.body;
        return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'An account with this email already exists.');
            }
            req.session.formData = req.body;
            return res.redirect('/register');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user (default role is 'customer')
        const newUser = await createUser(name, email, hashedPassword);

        // ⭐ Send welcome notification
        await notifyWelcome(newUser.id, newUser.name);

        // Success message
        if (typeof req.flash === 'function') {
            req.flash('success', `Account created successfully, ${name}! Please log in.`);
        }

        // Redirect to login page
        res.redirect('/login');

    } catch (error) {
        console.error('Registration error:', error);

        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to create account. Please try again later.');
        }

        req.session.formData = req.body;
        res.redirect('/register');
    }
};

/**
 * Show all registered users (employee/owner only)
 */
const showAllUsers = async (req, res) => {
    try {
        // This would need a model function to get all users
        // For now, redirect to dashboard
        req.flash('info', 'User list feature coming soon.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error loading users:', error);
        req.flash('error', 'Unable to load users.');
        res.redirect('/dashboard');
    }
};

/**
 * Show edit account form
 */
const showEditAccountForm = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        // For now, only allow editing own account
        if (userId !== req.session.userId) {
            req.flash('error', 'You can only edit your own account.');
            return res.redirect('/dashboard');
        }

        // Get user data
        const user = req.session.user;
        const formData = req.session?.formData || {};
        const errors = req.session?.errors || {};
        
        delete req.session.formData;
        delete req.session.errors;

        res.render('forms/registration/edit', {
            title: 'Edit Account',
            user: user,
            formData: Object.keys(formData).length > 0 ? formData : {
                name: user.name,
                email: user.email
            },
            errors,
            isLoggedIn: true
        });
    } catch (error) {
        console.error('Error loading edit form:', error);
        req.flash('error', 'Unable to load edit form.');
        res.redirect('/dashboard');
    }
};

/**
 * Process edit account form
 */
const processEditAccount = async (req, res) => {
    const userId = parseInt(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        req.session.formData = req.body;
        return res.redirect(`/register/${userId}/edit`);
    }

    try {
        // For now, just update session and show success
        const { name, email } = req.body;
        
        // Update session user data
        if (req.session.user) {
            req.session.user.name = name;
            req.session.user.email = email;
        }

        if (typeof req.flash === 'function') {
            req.flash('success', 'Account updated successfully.');
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash('error', 'Unable to update account.');
        res.redirect(`/register/${userId}/edit`);
    }
};

/**
 * Process delete account
 */
const processDeleteAccount = async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        // For now, just logout and show message
        if (typeof req.flash === 'function') {
            req.flash('info', 'Account deletion feature coming soon.');
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error deleting account:', error);
        req.flash('error', 'Unable to delete account.');
        res.redirect('/dashboard');
    }
};

export {
    showRegistrationForm,
    processRegistration,
    showAllUsers,
    showEditAccountForm,
    processEditAccount,
    processDeleteAccount
};

