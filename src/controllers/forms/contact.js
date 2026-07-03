import { validationResult } from 'express-validator';
import { createContactForm, getAllContactForms, getContactFormById, updateContactStatus, deleteContactForm } from '../../models/forms/contact.js';


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
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        return res.redirect('/contact');
    }

    const { customer_name, email, phone, subject, message } = req.body;

    try {
        // Save to database
        await createContactForm(customer_name, email, phone, subject, message);

        // Success message
        if (typeof req.flash === 'function') {
            req.flash('success', `Thank you for contacting our dealership, ${customer_name}! We will respond as soon as possible.`);
        }

        res.redirect('/contact');

    } catch (error) {
        console.error('Error saving inquiry:', error);

        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to submit your message at this time. Please try again later.');
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
        console.error('Error retrieving inquiries:', error);

        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to retrieve customer inquiries. Please try again later.');
        }
    }

    res.render('forms/contact/responses', {
        title: 'Customer Inquiries',
        contactForms
    });
};

/**
 * Show a single inquiry detail
 */
const showInquiryDetail = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const inquiry = await getContactFormById(id);
        
        if (!inquiry) {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Inquiry not found.');
            }
            return res.redirect('/contact/responses');
        }
        
        res.render('forms/contact/detail', {
            title: 'Inquiry Details',
            inquiry
        });
    } catch (error) {
        console.error('Error retrieving inquiry:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to retrieve inquiry details.');
        }
        res.redirect('/contact/responses');
    }
};

/**
 * Update inquiry status
 */
const updateInquiryStatus = async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    try {
        const updated = await updateContactStatus(id, status);
        
        if (updated) {
            if (typeof req.flash === 'function') {
                req.flash('success', 'Inquiry status updated successfully.');
            }
        } else {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Inquiry not found.');
            }
        }
    } catch (error) {
        console.error('Error updating inquiry:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to update inquiry status.');
        }
    }
    
    res.redirect('/contact/responses');
};

/**
 * Delete an inquiry
 */
const deleteInquiry = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const deleted = await deleteContactForm(id);
        
        if (deleted) {
            if (typeof req.flash === 'function') {
                req.flash('success', 'Inquiry deleted successfully.');
            }
        } else {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Inquiry not found.');
            }
        }
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to delete inquiry.');
        }
    }
    
    res.redirect('/contact/responses');
};

export { showContactForm, handleContactSubmission, showContactResponses, showInquiryDetail, updateInquiryStatus, deleteInquiry};