
const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response, defaultMessage) => {
  const contentType = response.headers.get('content-type');

  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' && data !== null
        ? data.message || data.error || JSON.stringify(data)
        : data || defaultMessage;

    throw new Error(errorMessage);
  }

  return data;
};

// Get all restaurants
export const getRestaurants = async () => {
  const response = await fetch(`${API_URL}/restaurants`);

  return handleResponse(
    response,
    'Failed to fetch restaurants'
  );
};

// Get all menus
export const getMenus = async () => {
  const response = await fetch(`${API_URL}/menus`);

  return handleResponse(
    response,
    'Failed to fetch menus'
  );
};

// Get all menu items
export const getMenuItems = async () => {
  const response = await fetch(`${API_URL}/menu-items`);

  return handleResponse(
    response,
    'Failed to fetch menu items'
  );
};

// Get all customers
export const getCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);

  return handleResponse(
    response,
    'Failed to fetch customers'
  );
};

// Get all dining tables
export const getDiningTables = async () => {
  const response = await fetch(`${API_URL}/dining-tables`);

  return handleResponse(
    response,
    'Failed to fetch dining tables'
  );
};

// Create an order
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  return handleResponse(
    response,
    'Failed to create order'
  );
};

// Add items to an order
export const createOrderItem = async (orderItemData) => {
  const response = await fetch(`${API_URL}/order-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderItemData),
  });

  return handleResponse(
    response,
    'Failed to create order item'
  );
};