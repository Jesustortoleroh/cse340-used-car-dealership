import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from '../../models/forms/registration.js';


/**
 * Display the registration form page.
 */
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'Create Your Dealership Account',
        user: req.session && req.session.user ? req.session.user : null
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
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingEmail = await emailExists(email);

        if (existingEmail) {
            if (typeof req.flash === 'function') {
                req.flash('warning', 'An account with this email already exists. Please log in or use a different email.');
            }
            return res.redirect('/register');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        await saveUser(name, email, hashedPassword);

        // Success message
        if (typeof req.flash === 'function') {
            req.flash('success', `Welcome to our dealership, ${name}! Your account has been created. Please sign in.`);
        }

        res.redirect('/login');

    } catch (error) {
        console.error('Registration error:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to create your account. Please try again later.');
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
        console.error('Error retrieving users:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to retrieve registered users.');
        }
    }

    res.render('forms/registration/list', {
        title: 'Registered Customers',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
};

/**
 * Display edit account form
 */
const showEditAccountForm = async (req, res) => {
    const userId = parseInt(req.params.id);
    const currentUser = req.session.user;

    try {
        const targetUser = await getUserById(userId);

        if (!targetUser) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'User not found.');
            }
            return res.redirect('/register/list');
        }

        // Check permissions: users can edit themselves, owners can edit anyone
        const canEdit = currentUser.id === userId || currentUser.roleName === 'owner';

        if (!canEdit) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'You do not have permission to edit this account.');
            }
            return res.redirect('/register/list');
        }

        res.render('forms/registration/edit', {
            title: 'Edit Account',
            user: targetUser
        });
    } catch (error) {
        console.error('Error loading edit form:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'An error occurred while loading the edit form.');
        }
        res.redirect('/register/list');
    }
};

/**
 * Process account edit
 */
const processEditAccount = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        return res.redirect(`/register/${req.params.id}/edit`);
    }

    const userId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { name, email } = req.body;

    try {
        const targetUser = await getUserById(userId);

        if (!targetUser) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'User not found.');
            }
            return res.redirect('/register/list');
        }

        // Check permissions
        const canEdit = currentUser.id === userId || currentUser.roleName === 'owner';

        if (!canEdit) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'You do not have permission to edit this account.');
            }
            return res.redirect('/register/list');
        }

        // Check if email already exists
        const emailTaken = await emailExists(email);
        if (emailTaken && targetUser.email !== email) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'An account with this email already exists.');
            }
            return res.redirect(`/register/${userId}/edit`);
        }

        // Update user
        await updateUser(userId, name, email);

        // If user edited their own account, update session
        if (currentUser.id === userId) {
            req.session.user.name = name;
            req.session.user.email = email;
        }

        if (typeof req.flash === 'function') {
            req.flash('success', 'Account updated successfully.');
        }
        res.redirect('/register/list');

    } catch (error) {
        console.error('Error updating account:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'An error occurred while updating the account.');
        }
        res.redirect(`/register/${userId}/edit`);
    }
};

/**
 * Process account deletion (only owners)
 */
const processDeleteAccount = async (req, res) => {
    const userId = parseInt(req.params.id);
    const currentUser = req.session.user;

    // Only owners can delete accounts
    if (currentUser.roleName !== 'owner') {
        if (typeof req.flash === 'function') {
            req.flash('error', 'You do not have permission to delete accounts.');
        }
        return res.redirect('/register/list');
    }

    // Prevent owners from deleting themselves
    if (currentUser.id === userId) {
        if (typeof req.flash === 'function') {
            req.flash('error', 'You cannot delete your own account.');
        }
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(userId);
        if (deleted) {
            if (typeof req.flash === 'function') {
                req.flash('success', 'User account deleted successfully.');
            }
        } else {
            if (typeof req.flash === 'function') {
                req.flash('error', 'User not found or already deleted.');
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'An error occurred while deleting the account.');
        }
    }
    res.redirect('/register/list');
};



export { showRegistrationForm, processRegistration, showAllUsers, showEditAccountForm, processEditAccount, processDeleteAccount
};


