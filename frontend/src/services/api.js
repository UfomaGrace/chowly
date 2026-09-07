const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
};

// =========================
// RESTAURANTS
// =========================

export const getRestaurants = async () => {
  const response = await fetch(`${API_URL}/restaurants`);
  return handleResponse(response, 'Failed to fetch restaurants');
};

// =========================
// MENUS
// =========================

export const getMenus = async () => {
  const response = await fetch(`${API_URL}/menus`);
  return handleResponse(response, 'Failed to fetch menus');
};

// =========================
// MENU ITEMS
// =========================

export const getMenuItems = async () => {
  const response = await fetch(`${API_URL}/menu-items`);
  return handleResponse(response, 'Failed to fetch menu items');
};

// =========================
// CUSTOMERS
// =========================

export const getCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);
  return handleResponse(response, 'Failed to fetch customers');
};

// =========================
// DINING TABLES
// =========================

export const getDiningTables = async () => {
  const response = await fetch(`${API_URL}/dining-tables`);
  return handleResponse(response, 'Failed to fetch dining tables');
};

// =========================
// ORDERS
// =========================

export const getOrders = async () => {
  const response = await fetch(`${API_URL}/orders`);
  return handleResponse(response, 'Failed to fetch orders');
};

export const getOrderById = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`);
  return handleResponse(response, 'Failed to fetch order');
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  return handleResponse(response, 'Failed to create order');
};

export const updateOrder = async (orderId, orderData) => {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  return handleResponse(response, 'Failed to update order');
};

// =========================
// ORDER ITEMS
// =========================

export const getOrderItems = async () => {
  const response = await fetch(`${API_URL}/order-items`);
  return handleResponse(response, 'Failed to fetch order items');
};

export const createOrderItem = async (orderItemData) => {
  const response = await fetch(`${API_URL}/order-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderItemData),
  });

  return handleResponse(response, 'Failed to create order item');
};

// =========================
// COMPLAINTS
// =========================

export const getComplaints = async () => {
  const response = await fetch(`${API_URL}/complaints`);
  return handleResponse(response, 'Failed to fetch complaints');
};

export const getComplaintById = async (complaintId) => {
  const response = await fetch(`${API_URL}/complaints/${complaintId}`);
  return handleResponse(response, 'Failed to fetch complaint');
};

export const createComplaint = async (complaintData) => {
  const response = await fetch(`${API_URL}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(complaintData),
  });

  return handleResponse(response, 'Failed to create complaint');
};

export const updateComplaint = async (complaintId, complaintData) => {
  const response = await fetch(`${API_URL}/complaints/${complaintId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(complaintData),
  });

  return handleResponse(response, 'Failed to update complaint');
};

// =========================
// RATINGS
// =========================

export const getRatings = async () => {
  const response = await fetch(`${API_URL}/ratings`);
  return handleResponse(response, 'Failed to fetch ratings');
};

export const getRatingById = async (ratingId) => {
  const response = await fetch(`${API_URL}/ratings/${ratingId}`);
  return handleResponse(response, 'Failed to fetch rating');
};

export const createRating = async (ratingData) => {
  const response = await fetch(`${API_URL}/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ratingData),
  });

  return handleResponse(response, 'Failed to create rating');
};

// =========================
// PAYMENTS
// =========================

export const getPayments = async () => {
  const response = await fetch(`${API_URL}/payments`);
  return handleResponse(response, 'Failed to fetch payments');
};

export const getPaymentByOrder = async (orderId) => {
  const response = await fetch(`${API_URL}/payments/order/${orderId}`);
  return handleResponse(response, 'Failed to fetch payment');
};

export const createPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  return handleResponse(response, 'Failed to create payment');
};