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
const showServiceRequests = async (
    req,
    res
) => {

    try {

        let requests = [];

        if (
            req.session.user.roleName === 'customer'
        ) {

            requests =
                await getServiceRequestsByUserId(
                    req.session.user.id
                );

        } else {

            requests =
                await getAllServiceRequests();

        }

        res.render(
            'serviceRequests/list',
            {
                title: 'Service Requests',
                requests
            }
        );

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to load service requests.'
        );

        res.redirect('/dashboard');
    }

};

/**
 * Show create form
 */
const showCreateRequestForm = async (
    req,
    res
) => {

    try {

        const serviceTypes =
            await getAllServiceTypes();

        const vehicles =
            await getAllVehicles();

        res.render(
            'serviceRequests/create',
            {
                title: 'New Service Request',
                serviceTypes,
                vehicles,
                formData: {},
                errors: {}
            }
        );

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to load service request form.'
        );

        res.redirect('/service-requests');
    }

};

/**
 * Create service request
 */
const processCreateRequest = async (
    req,
    res
) => {

    const errors =
        validationResult(req);

    if (!errors.isEmpty()) {

        const serviceTypes =
            await getAllServiceTypes();

        const vehicles =
            await getAllVehicles();

        const formattedErrors = {};

        errors.array().forEach(error => {
            formattedErrors[error.path] = error;
        });

        return res.render(
            'serviceRequests/create',
            {
                title: 'New Service Request',
                serviceTypes,
                vehicles,
                errors: formattedErrors,
                formData: req.body
            }
        );

    }

    const {
        service_type_id,
        vehicle_id,
        description
    } = req.body;

    try {

        await createServiceRequest(
            req.session.user.id,
            parseInt(service_type_id),
            parseInt(vehicle_id),
            description
        );

        req.flash?.(
            'success',
            'Service request submitted successfully.'
        );

        res.redirect(
            '/service-requests'
        );

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to submit service request.'
        );

        res.redirect(
            '/service-requests/create'
        );
    }

};

/**
 * Show edit form
 */
const showEditRequestForm = async (
    req,
    res
) => {

    try {

        const request =
            await getServiceRequestById(
                parseInt(req.params.id)
            );

        if (!request) {

            req.flash?.(
                'error',
                'Service request not found.'
            );

            return res.redirect(
                '/service-requests'
            );

        }

        const serviceTypes =
            await getAllServiceTypes();

        res.render(
            'serviceRequests/edit',
            {
                title: 'Edit Service Request',
                request,
                serviceTypes
            }
        );

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to load service request.'
        );

        res.redirect(
            '/service-requests'
        );
    }

};

/**
 * Update request
 */
const processUpdateRequest = async (
    req,
    res
) => {

    const requestId =
        parseInt(req.params.id);

    const {
        service_type_id,
        status,
        notes
    } = req.body;

    try {

        await updateServiceRequestStatus(
            requestId,
            status
        );

        if (notes !== undefined) {

            await updateServiceRequestNotes(
                requestId,
                notes
            );

        }

        req.flash?.(
            'success',
            'Service request updated.'
        );

        res.redirect(
            '/service-requests'
        );

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to update service request.'
        );

        res.redirect(
            `/service-requests/${requestId}/edit`
        );
    }

};

/**
 * Delete request
 */
const processDeleteRequest = async (
    req,
    res
) => {

    try {

        await deleteServiceRequest(
            parseInt(req.params.id)
        );

        req.flash?.(
            'success',
            'Service request deleted.'
        );

    } catch (error) {

        console.error(error);

        req.flash?.(
            'error',
            'Unable to delete service request.'
        );

    }

    res.redirect(
        '/service-requests'
    );

};

export {
    showServiceRequests,
    showCreateRequestForm,
    processCreateRequest,
    showEditRequestForm,
    processUpdateRequest,
    processDeleteRequest
};