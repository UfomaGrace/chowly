const API_URL = 'http://localhost:5000/api';

// Get all restaurants
export const getRestaurants = async () => {
  const response = await fetch(`${API_URL}/restaurants`);

  if (!response.ok) {
    throw new Error('Failed to fetch restaurants');
  }

  return response.json();
};

// Get all menus
export const getMenus = async () => {
  const response = await fetch(`${API_URL}/menus`);

  if (!response.ok) {
    throw new Error('Failed to fetch menus');
  }

  return response.json();
};

// Get all menu items
export const getMenuItems = async () => {
  const response = await fetch(`${API_URL}/menu-items`);

  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }

  return response.json();
};

// Get all customers
export const getCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
};

// Get all dining tables
export const getDiningTables = async () => {
  const response = await fetch(`${API_URL}/dining-tables`);

  if (!response.ok) {
    throw new Error('Failed to fetch dining tables');
  }

  return response.json();
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

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
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

  if (!response.ok) {
    throw new Error('Failed to create order item');
  }

  return response.json();
};