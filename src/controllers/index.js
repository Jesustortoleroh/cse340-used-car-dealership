// Controllers for basic pages (NeoMotor)

// Home page
const homePage = (req, res) => {
    res.render('home', {
        title: 'NeoMotor | Premium Used Vehicles'
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
    const err = new Error('Test server error for NeoMotor');
    err.status = 500;
    next(err);
};

export {
    homePage,
    aboutPage,
    testErrorPage
};