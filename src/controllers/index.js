// Controllers for basic pages (Used Car Dealership)

// Home page
const homePage = (req, res) => {
  res.render('home', { title: 'Used Car Dealership' });
};

// About page
const aboutPage = (req, res) => {
  res.render('about', { title: 'About Us' });
};

// Contact page (agregado para tu proyecto)
const contactPage = (req, res) => {
  res.render('contact', { title: 'Contact Us' });
};

// Test error (para probar errores 500)
const testErrorPage = (req, res, next) => {
  const err = new Error('Test server error for Used Car Dealersh');
  err.status = 500;
  next(err);
};


export { homePage, aboutPage, contactPage, testErrorPage };