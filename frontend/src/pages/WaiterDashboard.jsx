import { useEffect, useState } from 'react';
import {
  getOrders,
  updateOrder,
  getComplaints,
  updateComplaint,
  getRatings,
} from '../services/api';

function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [updatingComplaint, setUpdatingComplaint] = useState(null);

  const [message, setMessage] = useState('');

  // Demo waiter currently logged in
  const waiterId = 'W001';

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await getOrders();

      setOrders(data || []);
    } catch (error) {
      setMessage(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD COMPLAINTS + RATINGS
  // =========================

  const loadFeedback = async () => {
    try {
      setLoadingFeedback(true);

      const [complaintData, ratingData] = await Promise.all([
        getComplaints(),
        getRatings(),
      ]);

      setComplaints(complaintData || []);
      setRatings(ratingData || []);
    } catch (error) {
      setMessage(
        error.message || 'Failed to load complaints and ratings'
      );
    } finally {
      setLoadingFeedback(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        const [orderData, complaintData, ratingData] =
          await Promise.all([
            getOrders(),
            getComplaints(),
            getRatings(),
          ]);

        if (!cancelled) {
          setOrders(orderData || []);
          setComplaints(complaintData || []);
          setRatings(ratingData || []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error.message ||
              'Failed to load dashboard data'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingFeedback(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // ASSIGN ORDER
  // =========================

  const assignOrder = async (order) => {
    try {
      setUpdatingOrder(order.order_id);
      setMessage('');

      const updatedOrder = await updateOrder(
        order.order_id,
        {
          waiter_id: waiterId,
          order_status: 'Confirmed',
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.order_id === order.order_id
            ? updatedOrder
            : currentOrder
        )
      );

      setMessage(
        `Order ${order.order_id} has been assigned to waiter ${waiterId}.`
      );
    } catch (error) {
      setMessage(
        error.message || 'Failed to assign order'
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const updateStatus = async (order, newStatus) => {
    try {
      setUpdatingOrder(order.order_id);
      setMessage('');

      const updatedOrder = await updateOrder(
        order.order_id,
        {
          order_status: newStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.order_id === order.order_id
            ? updatedOrder
            : currentOrder
        )
      );

      setMessage(
        `Order ${order.order_id} status updated to ${newStatus}.`
      );
    } catch (error) {
      setMessage(
        error.message || 'Failed to update order'
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // =========================
  // RESOLVE COMPLAINT
  // =========================

  const resolveComplaint = async (complaint) => {
    try {
      setUpdatingComplaint(complaint.complaint_id);
      setMessage('');

      const updatedComplaint = await updateComplaint(
        complaint.complaint_id,
        {
          complaint_status: 'Resolved',
        }
      );

      setComplaints((currentComplaints) =>
        currentComplaints.map((currentComplaint) =>
          currentComplaint.complaint_id ===
          complaint.complaint_id
            ? updatedComplaint
            : currentComplaint
        )
      );

      setMessage(
        `Complaint ${complaint.complaint_id} has been resolved.`
      );
    } catch (error) {
      setMessage(
        error.message || 'Failed to resolve complaint'
      );
    } finally {
      setUpdatingComplaint(null);
    }
  };

  // =========================
  // STATUS COLOURS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';

      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';

      case 'Preparing':
        return 'bg-purple-100 text-purple-800';

      case 'Ready':
        return 'bg-green-100 text-green-800';

      case 'Served':
        return 'bg-gray-100 text-gray-800';

      case 'Completed':
        return 'bg-green-200 text-green-900';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplaintStatusClass = (status) => {
    if (status === 'Resolved') {
      return 'bg-green-100 text-green-800';
    }

    return 'bg-yellow-100 text-yellow-800';
  };

  // =========================
  // FILTERS
  // =========================

  const assignedOrders = orders.filter(
    (order) => order.waiter_id === waiterId
  );

  const unassignedOrders = orders.filter(
    (order) => !order.waiter_id
  );

  const pendingComplaints = complaints.filter(
    (complaint) =>
      complaint.complaint_status !== 'Resolved'
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            WAITER DASHBOARD
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome, Waiter
          </h1>

          <p className="mt-2 text-gray-600">
            Manage restaurant orders, complaints and
            customer feedback.
          </p>

          <div className="mt-4 inline-block rounded-lg bg-white px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-500">
              Waiter ID:{' '}
            </span>

            <span className="font-semibold text-gray-900">
              {waiterId}
            </span>
          </div>
        </div>

        {/* =========================
            MESSAGE
        ========================= */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {message}
          </div>
        )}

        {/* =========================
            STATS
        ========================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Assigned to Me
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {assignedOrders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Waiting for Assignment
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {unassignedOrders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Complaints
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingComplaints.length}
            </p>
          </div>

        </div>

        {/* =========================
            ORDERS
        ========================= */}

        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Assign orders and manage their progress.
              </p>
            </div>

            <button
              onClick={loadOrders}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center text-gray-500">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="space-y-4">

              {orders.map((order) => {

                const isAssignedToMe =
                  order.waiter_id === waiterId;

                const isUpdating =
                  updatingOrder === order.order_id;

                return (
                  <div
                    key={order.order_id}
                    className="rounded-xl border border-gray-200 p-5"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Order ID
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {order.order_id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Table
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {order.table_id || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Customer
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {order.customer_id || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Total
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            ₦
                            {Number(
                              order.total_amount || 0
                            ).toLocaleString()}
                          </p>
                        </div>

                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                            order.order_status
                          )}`}
                        >
                          {order.order_status || 'Pending'}
                        </span>
                      </div>

                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          Waiter:
                        </span>{' '}
                        {order.waiter_id || 'Not assigned'}
                      </div>

                      <div className="flex flex-wrap gap-2">

                        {!isAssignedToMe &&
                          !order.waiter_id && (
                            <button
                              onClick={() =>
                                assignOrder(order)
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating
                                ? 'Assigning...'
                                : 'Assign to Me'}
                            </button>
                          )}

                        {isAssignedToMe && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(
                                  order,
                                  'Preparing'
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Preparing
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(
                                  order,
                                  'Ready'
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Ready
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(
                                  order,
                                  'Served'
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Served
                            </button>
                          </>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* =========================
            COMPLAINTS
        ========================= */}

        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Customer Complaints
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review and resolve customer complaints.
              </p>
            </div>

            <button
              onClick={loadFeedback}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>

          </div>

          {loadingFeedback ? (
            <div className="py-10 text-center text-gray-500">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-10 text-center text-gray-500">
              No customer complaints yet.
            </div>
          ) : (
            <div className="space-y-4">

              {complaints.map((complaint) => {

                const isUpdating =
                  updatingComplaint ===
                  complaint.complaint_id;

                const isResolved =
                  complaint.complaint_status ===
                  'Resolved';

                return (
                  <div
                    key={complaint.complaint_id}
                    className="rounded-xl border border-gray-200 p-5"
                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="font-semibold text-gray-900">
                            {complaint.complaint_id}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getComplaintStatusClass(
                              complaint.complaint_status
                            )}`}
                          >
                            {complaint.complaint_status}
                          </span>

                        </div>

                        <p className="mt-3 text-gray-700">
                          {complaint.complaint_description}
                        </p>

                        <div className="mt-4 grid gap-3 text-sm text-gray-500 sm:grid-cols-3">

                          <div>
                            <span className="font-medium text-gray-700">
                              Order:
                            </span>{' '}
                            {complaint.order_id}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Customer:
                            </span>{' '}
                            {complaint.customer_id}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Date:
                            </span>{' '}
                            {complaint.complaint_date}
                          </div>

                        </div>

                      </div>

                      {!isResolved && (
                        <button
                          onClick={() =>
                            resolveComplaint(complaint)
                          }
                          disabled={isUpdating}
                          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating
                            ? 'Resolving...'
                            : 'Resolve Complaint'}
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* =========================
            RATINGS
        ========================= */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-gray-900">
              Customer Ratings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View ratings and comments submitted by customers.
            </p>

          </div>

          {loadingFeedback ? (
            <div className="py-10 text-center text-gray-500">
              Loading ratings...
            </div>
          ) : ratings.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-10 text-center text-gray-500">
              No ratings have been submitted yet.
            </div>
          ) : (
            <div className="space-y-4">

              {ratings.map((rating) => (

                <div
                  key={rating.rating_id}
                  className="rounded-xl border border-gray-200 p-5"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="font-semibold text-gray-900">
                        {rating.order_id}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Customer: {rating.customer_id}
                      </p>

                    </div>

                    <div className="text-lg">
                      {'★'.repeat(
                        Number(rating.rating_value) || 0
                      )}
                      {'☆'.repeat(
                        5 -
                          (Number(rating.rating_value) || 0)
                      )}
                    </div>

                  </div>

                  {rating.rating_comment && (
                    <p className="mt-4 rounded-lg bg-gray-50 p-4 text-gray-700">
                      "{rating.rating_comment}"
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Rating ID: {rating.rating_id}
                  </p>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default WaiterDashboard;