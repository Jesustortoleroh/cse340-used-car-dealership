import test from 'node:test';
import assert from 'node:assert/strict';
import { validationResult } from 'express-validator';
import { parseInventoryFilters } from '../src/utils/inventoryFilters.js';
import {
    testDriveValidation,
    vehicleTrustDetailsValidation
} from '../src/middleware/validation/forms.js';

const getValidationErrors = async (validators, body) => {
    const req = { body };
    await Promise.all(validators.slice(0, -1).map((validator) => validator.run(req)));
    return validationResult(req).array();
};

test('parses inventory filters and normalizes the default category', () => {
    assert.deepEqual(
        parseInventoryFilters({
            category: 'All',
            minPrice: '5000',
            maxPrice: '20000',
            minYear: '2018',
            maxYear: '2022',
            maxMileage: '80000',
            sort: 'price_asc',
            page: '2'
        }),
        {
            search: '',
            category: '',
            minPrice: 5000,
            maxPrice: 20000,
            minYear: 2018,
            maxYear: 2022,
            maxMileage: 80000,
            dealer: '',
            sort: 'price_asc',
            page: 2
        }
    );
});

test('rejects invalid ranges, repeated query values, and unsafe sort values', () => {
    assert.throws(() => parseInventoryFilters({ minPrice: '20000', maxPrice: '10000' }), {
        status: 400
    });
    assert.throws(() => parseInventoryFilters({ page: ['1', '2'] }), { status: 400 });
    assert.throws(() => parseInventoryFilters({ sort: 'price_asc; DROP TABLE vehicles' }), {
        status: 400
    });
    assert.throws(() => parseInventoryFilters({ minYear: '1800' }), { status: 400 });
});

test('accepts a future test-drive slot and rejects a past date', async () => {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const preferred_date = tomorrow.toISOString().slice(0, 10);

    assert.deepEqual(
        await getValidationErrors(testDriveValidation, {
            preferred_date,
            preferred_time: '09:30'
        }),
        []
    );
    assert.ok(
        (
            await getValidationErrors(testDriveValidation, {
                preferred_date: '2000-01-01',
                preferred_time: '09:30'
            })
        ).length
    );
});

test('accepts valid VINs and rejects excluded VIN characters', async () => {
    assert.deepEqual(
        await getValidationErrors(vehicleTrustDetailsValidation, {
            vin: '1HGCM82633A004352',
            inspection_notes: '',
            service_history: ''
        }),
        []
    );
    assert.ok(
        (
            await getValidationErrors(vehicleTrustDetailsValidation, {
                vin: '1HGCM82633I004352',
                inspection_notes: '',
                service_history: ''
            })
        ).length
    );
});
