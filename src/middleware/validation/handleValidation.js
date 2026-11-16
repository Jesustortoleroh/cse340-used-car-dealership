import { validationResult } from 'express-validator';

/**
 * Middleware to check for validation errors.
 * If errors exist, it flashes them to the user and redirects back.
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors for the flash message
        const errorMessages = errors.array().map((err) => err.msg);

        // Save errors in flash session
        req.flash('error', errorMessages);

        // Save the form data so the user doesn't have to type it again
        // (excluding passwords for security)
        const formData = { ...req.body };
        delete formData.password;
        delete formData.passwordConfirm;
        req.flash('formData', JSON.stringify(formData));

        // Redirect back to the form
        return res.redirect('back');
    }

    next();
};
