const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://chowly-backend-lwk1.onrender.com/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
}

export async function getRestaurants() {
  const response = await fetch(`${API_URL}/restaurants`);
  return handleResponse(response);
}

export async function getMenus() {
  const response = await fetch(`${API_URL}/menus`);
  return handleResponse(response);
}

export async function getMenuItems() {
  const response = await fetch(`${API_URL}/menu-items`);
  return handleResponse(response);
}

export async function getCustomers() {
  const response = await fetch(`${API_URL}/customers`);
  return handleResponse(response);
}

export async function getDiningTables() {
  const response = await fetch(`${API_URL}/dining-tables`);
  return handleResponse(response);
}

export async function getOrders() {
  const response = await fetch(`${API_URL}/orders`);
  return handleResponse(response);
}

export async function getOrderById(orderId) {
  const response = await fetch(`${API_URL}/orders/${orderId}`);
  return handleResponse(response);
}

export async function createOrder(orderData) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  return handleResponse(response);
}

export async function updateOrder(orderId, orderData) {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  return handleResponse(response);
}

export async function getOrderItems() {
  const response = await fetch(`${API_URL}/order-items`);
  return handleResponse(response);
}

export async function createOrderItem(orderItemData) {
  const response = await fetch(`${API_URL}/order-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderItemData),
  });

  return handleResponse(response);
}

export async function getComplaints() {
  const response = await fetch(`${API_URL}/complaints`);
  return handleResponse(response);
}

export async function getComplaintById(complaintId) {
  const response = await fetch(`${API_URL}/complaints/${complaintId}`);
  return handleResponse(response);
}

export async function createComplaint(complaintData) {
  const response = await fetch(`${API_URL}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(complaintData),
  });

  return handleResponse(response);
}

export async function updateComplaint(complaintId, complaintData) {
  const response = await fetch(`${API_URL}/complaints/${complaintId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(complaintData),
  });

  return handleResponse(response);
}

export async function getRatings() {
  const response = await fetch(`${API_URL}/ratings`);
  return handleResponse(response);
}

export async function getRatingById(ratingId) {
  const response = await fetch(`${API_URL}/ratings/${ratingId}`);
  return handleResponse(response);
}

export async function createRating(ratingData) {
  const response = await fetch(`${API_URL}/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ratingData),
  });

  return handleResponse(response);
}

export async function getPayments() {
  const response = await fetch(`${API_URL}/payments`);
  return handleResponse(response);
}

export async function getPaymentByOrder(orderId) {
  const response = await fetch(`${API_URL}/payments/order/${orderId}`);
  return handleResponse(response);
}

export async function createPayment(paymentData) {
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  return handleResponse(response);
}