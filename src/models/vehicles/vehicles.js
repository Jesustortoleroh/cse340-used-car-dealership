// Enhanced vehicles data object 
const vehicles = {

  'TC2020': {
    id: 'TC2020',
    name: 'Toyota Corolla 2020',
    category: 'Car',
    description: 'Reliable compact car with great fuel efficiency.',
    price: 12000,
    specs: [
      { feature: 'Mileage', value: '35 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'Red' }
    ]
  },

  'FE2019': {
    id: 'FE2019',
    name: 'Ford Explorer 2019',
    category: 'SUV',
    description: 'Spacious SUV perfect for family trips.',
    price: 18500,
    specs: [
      { feature: 'Mileage', value: '25 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'Black' }
    ]
  },

  'HC2021': {
    id: 'HC2021',
    name: 'Honda Civic 2021',
    category: 'Car',
    description: 'Modern sedan with advanced safety features.',
    price: 14300,
    specs: [
      { feature: 'Mileage', value: '32 MPG' },
      { feature: 'Transmission', value: 'Manual' },
      { feature: 'Color', value: 'Blue' }
    ]
  },

  'CS2018': {
    id: 'CS2018',
    name: 'Chevrolet Silverado 2018',
    category: 'Truck',
    description: 'Powerful pickup truck with great towing capacity.',
    price: 22000,
    specs: [
      { feature: 'Mileage', value: '20 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'White' }
    ]
  },

  'NA2020': {
    id: 'NA2020',
    name: 'Nissan Altima 2020',
    category: 'Car',
    description: 'Comfortable sedan with smooth driving experience.',
    price: 13000,
    specs: [
      { feature: 'Mileage', value: '34 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'Silver' }
    ]
  },

  'JW2017': {
    id: 'JW2017',
    name: 'Jeep Wrangler 2017',
    category: 'SUV',
    description: 'Rugged off-road vehicle built for adventure.',
    price: 19500,
    specs: [
      { feature: 'Mileage', value: '18 MPG' },
      { feature: 'Transmission', value: 'Manual' },
      { feature: 'Color', value: 'Green' }
    ]
  },

  'B3S2021': {
    id: 'B3S2021',
    name: 'BMW 3 Series 2021',
    category: 'Car',
    description: 'Luxury sedan with advanced technology and performance.',
    price: 28000,
    specs: [
      { feature: 'Mileage', value: '30 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'Gray' }
    ]
  },

  'HT2022': {
    id: 'HT2022',
    name: 'Hyundai Tucson 2022',
    category: 'SUV',
    description: 'Modern compact SUV with safety and comfort features.',
    price: 21000,
    specs: [
      { feature: 'Mileage', value: '28 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'Blue' }
    ]
  },

 
  'CM2021': {
    id: 'CM2021',
    name: 'Chevrolet Malibu 2021',
    category: 'Car',
    description: 'Stylish midsize sedan with comfortable interior.',
    price: 17500,
    specs: [
      { feature: 'Mileage', value: '29 MPG' },
      { feature: 'Transmission', value: 'Automatic' },
      { feature: 'Color', value: 'White' }
    ]
  }

};
// Model functions for vehicle data

// Get all vehicles
const getAllVehicles = () => {
  return Object.values(vehicles);
};

// Get vehicle by ID
const getVehicleById = (vehicleId) => {
  return vehicles[vehicleId] || null;
};

// Sort vehicle specifications
const getSortedSpecs = (specs, sortBy) => {
  const sortedSpecs = [...specs];

  switch (sortBy) {
    case 'feature':
      return sortedSpecs.sort((a, b) =>
        a.feature.localeCompare(b.feature)
      );

    case 'value':
      return sortedSpecs.sort((a, b) =>
        a.value.localeCompare(b.value)
      );

    default:
      return sortedSpecs; // keep original order
  }
};

// Get vehicles by specific category
const getVehiclesByCategory = (category) => {
  if (!category) {
    return Object.values(vehicles);
  }

  return Object.values(vehicles).filter(vehicle => {
    return vehicle.category &&
      vehicle.category.toLowerCase() === category.toLowerCase();
  });
};

export { getAllVehicles, getVehicleById, getSortedSpecs, getVehiclesByCategory };