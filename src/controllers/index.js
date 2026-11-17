// Controllers for basic pages (NeoMotor)
import { getHomePageData } from '../models/vehicles/vehicles.js';

// Home page
const homePage = async (req, res, next) => {
    try {
        const homeData = await getHomePageData();
        if (!Array.isArray(homeData.vehicles) || !homeData.stats) {
            throw new Error('Home page data is incomplete');
        }

        res.render('home', {
            title: 'NeoMotor | Premium Used Vehicles',
            vehicles: homeData.vehicles,
            stats: homeData.stats,
            dealer: homeData.dealer
        });
    } catch (error) {
        next(error);
    }
};

// About page
const aboutPage = (req, res) => {
    res.render('about', {
        title: 'About Us'
    });
};

// Test error (for testing 500 errors)
const testErrorPage = (req, res, next) => {
    const err = new Error('Test server error for NeoMotor');
    err.status = 500;
    next(err);
};

export {
    homePage,
    aboutPage,
    testErrorPage
};