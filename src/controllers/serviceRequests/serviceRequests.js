import { validationResult } from 'express-validator';

import {
    getAllServiceRequests,
    getServiceRequestById,
    getServiceRequestsByUserId,
    getAllServiceTypes,
    createServiceRequest,
    updateServiceRequestStatus,
    updateServiceRequestNotes,
    deleteServiceRequest
} from '../../models/serviceRequest/serviceRequests.js';

import {
    getAllVehicles
} from '../../models/vehicles/vehicles.js';

/**
 * Show service requests
 */
const showServiceRequests = async (req, res) => {
    try {
        let requests = [];

        if (req.session.user.roleName === 'customer') {
            requests = await getServiceRequestsByUserId(req.session.user.id);
        } else {
            requests = await getAllServiceRequests();
        }

        res.render('serviceRequests/list', {
            title: 'Service Requests',
            requests,
            user: req.session?.user || null
        });

    } catch (error) {
        console.error('Error loading service requests:', error);
        
        req.flash?.('error', 'Unable to load service requests.');
        res.redirect('/dashboard');
    }
};

/**
 * Show create form
 */
const showCreateRequestForm = async (req, res) => {
    try {
        const serviceTypes = await getAllServiceTypes();
        const vehicles = await getAllVehicles();

        // Retrieve session data if exists (to display validation errors)
        const formData = req.session?.formData || {};
        const errors = req.session?.errors || {};
        
        // Clear session after retrieving
        delete req.session.formData;
        delete req.session.errors;

        res.render('serviceRequests/create', {
            title: 'New Service Request',
            serviceTypes,
            vehicles,
            formData,
            errors,
            user: req.session?.user || null
        });

    } catch (error) {
        console.error('Error loading create form:', error);
        
        req.flash?.('error', 'Unable to load service request form.');
        res.redirect('/service-requests');
    }
};

/**
 * Create service request
 */
const processCreateRequest = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        try {
            const serviceTypes = await getAllServiceTypes();
            const vehicles = await getAllVehicles();

            const formattedErrors = {};
            errors.array().forEach(error => {
                formattedErrors[error.path] = error.msg;
            });

            // Save in session to keep data between redirects
            req.session.formData = req.body;
            req.session.errors = formattedErrors;

            return res.redirect('/service-requests/create');
            
        } catch (error) {
            console.error('Error loading form with errors:', error);
            req.flash?.('error', 'Unable to load form.');
            return res.redirect('/service-requests');
        }
    }

    const { service_type_id, vehicle_id, description } = req.body;

    try {
        await createServiceRequest(
            req.session.user.id,
            parseInt(service_type_id),
            parseInt(vehicle_id),
            description
        );

        req.flash?.('success', 'Service request submitted successfully.');
        res.redirect('/service-requests');

    } catch (error) {
        console.error('Error creating service request:', error);
        
        req.flash?.('error', 'Unable to submit service request.');
        res.redirect('/service-requests/create');
    }
};

/**
 * Show edit form
 */
const showEditRequestForm = async (req, res) => {
    try {
        const request = await getServiceRequestById(parseInt(req.params.id));

        if (!request) {
            req.flash?.('error', 'Service request not found.');
            return res.redirect('/service-requests');
        }

        const serviceTypes = await getAllServiceTypes();

        // Retrieve session data if exists (to display validation errors)
        const formData = req.session?.formData || {};
        const errors = req.session?.errors || {};
        
        // Clear session after retrieving
        delete req.session.formData;
        delete req.session.errors;

        // If no session formData, use request data as default values
        const defaultFormData = Object.keys(formData).length === 0 ? {
            service_type_id: request.service_type_id,
            status: request.status,
            notes: request.notes || ''
        } : formData;

        res.render('serviceRequests/edit', {
            title: 'Edit Service Request',
            request,
            serviceTypes,
            formData: defaultFormData,
            errors,
            user: req.session?.user || null
        });

    } catch (error) {
        console.error('Error loading edit form:', error);
        
        req.flash?.('error', 'Unable to load service request.');
        res.redirect('/service-requests');
    }
};

/**
 * Update request
 * FIXES APPLIED:
 * 1. Status values now match frontend (Submitted, In Progress, Completed)
 * 2. Customers cannot update status - only employees and owners can
 * 3. Ownership verification added for customers
 * 4. Proper role-based authorization
 */
const processUpdateRequest = async (req, res) => {
    const requestId = parseInt(req.params.id);
    const { service_type_id, status, notes } = req.body;
    const userRole = req.session.user.roleName;
    const userId = req.session.user.id;

    // ============================================
    // FIX 1: Consistent status validation
    // Align with frontend options (Submitted, In Progress, Completed)
    // ============================================
    const validStatuses = ['Submitted', 'In Progress', 'Completed'];

    // ============================================
    // FIX 2: Ownership verification
    // Ensure customers can only modify their own requests
    // ============================================
    try {
        // Verify that the request exists
        const request = await getServiceRequestById(requestId);
        if (!request) {
            req.flash?.('error', 'Service request not found.');
            return res.redirect('/service-requests');
        }

        // Check ownership for customers
        if (userRole === 'customer' && request.user_id !== userId) {
            req.flash?.('error', 'You do not have permission to modify this request.');
            return res.redirect('/service-requests');
        }

        // ============================================
        // FIX 3: Role-based status update permissions
        // Only employees and owners can update status
        // ============================================
        
        // Basic validation for common fields
        const errors = {};
        if (!service_type_id) errors.service_type_id = 'Service type is required';
        
        // Validate status only if user is staff (since they can modify it)
        if (userRole === 'employee' || userRole === 'owner') {
            if (!status) {
                errors.status = 'Status is required';
            } else if (!validStatuses.includes(status)) {
                errors.status = 'Invalid status value. Must be: Submitted, In Progress, or Completed';
            }
        }

        // If there are errors, save in session and redirect
        if (Object.keys(errors).length > 0) {
            req.session.formData = { service_type_id, status, notes };
            req.session.errors = errors;
            
            req.flash?.('error', 'Please fix the validation errors.');
            return res.redirect(`/service-requests/${requestId}/edit`);
        }

        // ============================================
        // Apply updates based on user role
        // ============================================

        // Staff (employees and owners) can update everything
        if (userRole === 'employee' || userRole === 'owner') {
            // Update status
            await updateServiceRequestStatus(requestId, status);

            // Update notes if provided
            if (notes !== undefined) {
                await updateServiceRequestNotes(requestId, notes.trim() || '');
            }

            req.flash?.('success', 'Service request updated successfully.');

        } else {
            // Customers can ONLY update notes
            // Status remains unchanged
            if (notes !== undefined) {
                await updateServiceRequestNotes(requestId, notes.trim() || '');
                req.flash?.('success', 'Service request notes updated successfully.');
            } else {
                req.flash?.('info', 'No changes were made to the request.');
            }
        }

        res.redirect('/service-requests');

    } catch (error) {
        console.error('Error updating service request:', error);
        
        req.flash?.('error', 'Unable to update service request.');
        res.redirect(`/service-requests/${requestId}/edit`);
    }
};

/**
 * Delete request
 */
const processDeleteRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        
        // Verify that the request exists before deleting
        const request = await getServiceRequestById(requestId);
        if (!request) {
            req.flash?.('error', 'Service request not found.');
            return res.redirect('/service-requests');
        }

        await deleteServiceRequest(requestId);

        req.flash?.('success', 'Service request deleted successfully.');

    } catch (error) {
        console.error('Error deleting service request:', error);
        
        req.flash?.('error', 'Unable to delete service request.');
    }

    res.redirect('/service-requests');
};

export {
    showServiceRequests,
    showCreateRequestForm,
    processCreateRequest,
    showEditRequestForm,
    processUpdateRequest,
    processDeleteRequest
};