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
import { getAllVehicles } from '../../models/vehicles/vehicles.js';
import { notifyServiceUpdate } from '../../models/notifications/notificationTriggers.js';

/**
 * Show service requests
 */
const showServiceRequests = async (req, res, next) => {
    try {
        let requests = [];

        if (req.session.user.roleName === 'customer') {
            requests = await getServiceRequestsByUserId(req.session.user.id);
        } else {
            requests = await getAllServiceRequests();
        }

        res.render('serviceRequests/list', {
            title: 'Service Requests',
            requests
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Show create form
 */
const showCreateRequestForm = async (req, res, next) => {
    try {
        const serviceTypes = await getAllServiceTypes();
        const vehicles = await getAllVehicles();

        // Get form data from flash if available
        let formData = {};
        const formDataFlash = req.flash('formData');
        if (formDataFlash.length) {
            try {
                formData = JSON.parse(formDataFlash[0]);
            } catch {
                formData = {};
            }
        }

        res.render('serviceRequests/create', {
            title: 'New Service Request',
            serviceTypes,
            vehicles,
            formData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create service request
 */
const processCreateRequest = async (req, res, next) => {
    // Validation is handled by handleValidationErrors middleware
    const { service_type_id, vehicle_id, description } = req.body;

    try {
        await createServiceRequest(
            req.session.user.id,
            parseInt(service_type_id),
            parseInt(vehicle_id),
            description
        );

        req.flash('success', 'Service request submitted successfully.');
        res.redirect('/service-requests');
    } catch (error) {
        next(error);
    }
};

/**
 * Show edit form
 */
const showEditRequestForm = async (req, res, next) => {
    try {
        const request = await getServiceRequestById(parseInt(req.params.id));

        if (!request) {
            req.flash('error', 'Service request not found.');
            return res.redirect('/service-requests');
        }

        const serviceTypes = await getAllServiceTypes();

        // Get form data from flash if available
        let formData = {};
        const formDataFlash = req.flash('formData');
        if (formDataFlash.length) {
            try {
                formData = JSON.parse(formDataFlash[0]);
            } catch {
                formData = {};
            }
        }

        // If no formData from flash, use request data as default values
        const defaultFormData =
            Object.keys(formData).length === 0
                ? {
                      service_type_id: request.service_type_id,
                      status: request.status,
                      notes: request.notes || ''
                  }
                : formData;

        res.render('serviceRequests/edit', {
            title: 'Edit Service Request',
            request,
            serviceTypes,
            formData: defaultFormData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update service request
 */
const processUpdateRequest = async (req, res, next) => {
    const requestId = parseInt(req.params.id);
    // Removed service_type_id from destructuring as it's not used here
    const { status, notes } = req.body;
    const userRole = req.session.user.roleName;
    const userId = req.session.user.id;

    try {
        const request = await getServiceRequestById(requestId);
        if (!request) {
            req.flash('error', 'Service request not found.');
            return res.redirect('/service-requests');
        }

        // Check ownership for customers
        if (userRole === 'customer' && request.user_id !== userId) {
            req.flash('error', 'You do not have permission to modify this request.');
            return res.redirect('/service-requests');
        }

        // Staff can update everything
        if (userRole === 'employee' || userRole === 'owner') {
            const updatedRequest = await updateServiceRequestStatus(requestId, status);

            if (notes !== undefined) {
                await updateServiceRequestNotes(requestId, notes.trim() || '');
            }

            // Notify user about status change
            if (updatedRequest) {
                const vehicleName = request.vehicle_name || 'your vehicle';
                await notifyServiceUpdate(request.user_id, requestId, status, vehicleName);
            }

            req.flash('success', 'Service request updated successfully.');
        } else {
            // Customers can ONLY update notes
            if (notes !== undefined) {
                await updateServiceRequestNotes(requestId, notes.trim() || '');
                req.flash('success', 'Service request notes updated successfully.');
            } else {
                req.flash('info', 'No changes were made to the request.');
            }
        }

        res.redirect('/service-requests');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete service request
 */
const processDeleteRequest = async (req, res, next) => {
    const requestId = parseInt(req.params.id);

    try {
        const request = await getServiceRequestById(requestId);
        if (!request) {
            req.flash('error', 'Service request not found.');
            return res.redirect('/service-requests');
        }

        await deleteServiceRequest(requestId);
        req.flash('success', 'Service request deleted successfully.');
        res.redirect('/service-requests');
    } catch (error) {
        next(error);
    }
};

export {
    showServiceRequests,
    showCreateRequestForm,
    processCreateRequest,
    showEditRequestForm,
    processUpdateRequest,
    processDeleteRequest
};
