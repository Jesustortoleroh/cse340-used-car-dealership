// Controllers for basic pages (Used Car Dealership)

// Home page
const homePage = (req, res) => {
    res.render('home', {
        title: 'Used Car Dealership'
    });
};

// About page
const aboutPage = (req, res) => {
    res.render('about', {
        title: 'About Us'
    });
};

// Test error (for testing 500 errors)
const testErrorPage = (req, res, next) => {
    const err = new Error('Test server error for Used Car Dealership');
    err.status = 500;
    next(err);
};

export {
    homePage,
    aboutPage,
    testErrorPage
};