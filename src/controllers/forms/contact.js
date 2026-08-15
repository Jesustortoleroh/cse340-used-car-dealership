import { validationResult } from 'express-validator';
import { 
    createContactForm, 
    getAllContactForms, 
    getContactFormById, 
    updateContactStatus, 
    updateContactPriority,
    deleteContactForm 
} from '../../models/forms/contact.js';
import { notifyInquiryResponse } from '../../models/notifications/notificationTriggers.js';


/**
 * Display contact page
 */
const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Our Dealership',
        user: req.session?.user || null,
        isLoggedIn: !!req.session?.user
    });
};

/**
 * Process contact form submission
 */
const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            if (typeof req.flash === 'function') {
                req.flash('error', error.msg);
            }
        });
        return res.redirect('/contact');
    }

    const { customer_name, email, phone, subject, message } = req.body;

    try {
        await createContactForm(customer_name, email, phone, subject, message);

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
    let inquiries = [];

    try {
        inquiries = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving inquiries:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to retrieve customer inquiries. Please try again later.');
        }
    }

    // ⭐ DEBUG: Verifica que inquiries tenga datos
    console.log('📋 Inquiries count:', inquiries.length);

    // ⭐ Obtener mensajes flash
    const messages = typeof req.flash === 'function' ? req.flash() : {};

    res.render('forms/contact/responses', {
        title: 'Customer Inquiries',
        inquiries: inquiries,
        messages: messages,
        user: req.session?.user || null,
        isLoggedIn: !!req.session?.user
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
        
        // ⭐ Obtener mensajes flash
        const messages = typeof req.flash === 'function' ? req.flash() : {};
        
        res.render('forms/contact/detail', {
            title: 'Inquiry Details',
            inquiry: inquiry,
            messages: messages,
            user: req.session?.user || null,
            isLoggedIn: !!req.session?.user
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
        const inquiry = await getContactFormById(id);
        const updated = await updateContactStatus(id, status);
        
        if (updated) {
            if (typeof req.flash === 'function') {
                req.flash('success', 'Inquiry status updated successfully.');
            }

            // ⭐ Notificar al usuario si la consulta fue resuelta
            if (status === 'Resolved' && inquiry && inquiry.email) {
                // Buscar usuario por email para obtener user_id
                const user = await findUserByEmail(inquiry.email);
                if (user) {
                    await notifyInquiryResponse(
                        user.id,
                        id,
                        inquiry.subject
                    );
                }
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
 * Update inquiry priority
 */
const updateInquiryPriority = async (req, res) => {
    const id = parseInt(req.params.id);
    const { priority } = req.body;
    
    // Validar que priority sea válido
    const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
    if (priority && !validPriorities.includes(priority)) {
        if (typeof req.flash === 'function') {
            req.flash('error', 'Invalid priority value.');
        }
        return res.redirect(`/contact/${id}`);
    }
    
    try {
        const updated = await updateContactPriority(id, priority);
        
        if (updated) {
            if (typeof req.flash === 'function') {
                req.flash('success', 'Inquiry priority updated successfully.');
            }
        } else {
            if (typeof req.flash === 'function') {
                req.flash('error', 'Inquiry not found.');
            }
        }
    } catch (error) {
        console.error('Error updating inquiry priority:', error);
        if (typeof req.flash === 'function') {
            req.flash('error', 'Unable to update inquiry priority.');
        }
    }
    
    res.redirect(`/contact/${id}`);
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

export { 
    showContactForm, 
    handleContactSubmission, 
    showContactResponses, 
    showInquiryDetail, 
    updateInquiryStatus,
    updateInquiryPriority,
    deleteInquiry 
};