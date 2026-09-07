import { useEffect, useState } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import MenuItemCard from '../components/MenuItemCard';
import Cart from '../components/Cart';
import {
  getRestaurants,
  getMenus,
  getMenuItems,
  getCustomers,
  getDiningTables,
  createOrder,
  createOrderItem,
  createComplaint,
  createRating,
  createPayment,
} from '../services/api';

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [diningTables, setDiningTables] = useState([]);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTable, setSelectedTable] = useState('');

  const [cart, setCart] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [message, setMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Rating state
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Complaint state
  const [complaintDescription, setComplaintDescription] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          restaurantsData,
          menusData,
          menuItemsData,
          customersData,
          diningTablesData,
        ] = await Promise.all([
          getRestaurants(),
          getMenus(),
          getMenuItems(),
          getCustomers(),
          getDiningTables(),
        ]);

        setRestaurants(restaurantsData);
        setMenus(menusData);
        setMenuItems(menuItemsData);
        setCustomers(customersData);
        setDiningTables(diningTablesData);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load Chowly data.');
      }
    };

    loadData();
  }, []);

  const addToCart = (item) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.menu_item_id === item.menu_item_id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.menu_item_id === item.menu_item_id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    setMessage('');
  };

  const increaseQuantity = (menuItemId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.menu_item_id === menuItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (menuItemId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.menu_item_id === menuItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const selectedMenu = selectedRestaurant
    ? menus.find(
        (menu) =>
          menu.restaurant_id === selectedRestaurant.restaurant_id
      )
    : null;

  const selectedMenuItems = selectedMenu
    ? menuItems.filter(
        (item) =>
          item.menu_id === selectedMenu.menu_id &&
          item.availability_status === 'Available'
      )
    : [];

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Estimated waiting time is based on the item
  // with the longest preparation time.
  const waitingTime =
    cart.length > 0
      ? Math.max(
          ...cart.map(
            (item) => Number(item.preparation_time) || 0
          )
        )
      : 0;

  const placeOrder = async () => {
    if (cart.length === 0) {
      setMessage('Please add at least one item to your cart.');
      return;
    }

    if (!selectedCustomer) {
      setMessage('Please select a customer.');
      return;
    }

    if (!selectedTable) {
      setMessage('Please select a dining table.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      setMessage('');

      // Generate a short unique ID that fits VARCHAR(20).
      const orderId = `O${crypto
        .randomUUID()
        .replaceAll('-', '')
        .slice(0, 12)}`;

      const now = new Date();

      const orderDate = now.toISOString().split('T')[0];

      const orderTime = now.toTimeString().split(' ')[0];

      const orderData = {
        order_id: orderId,
        table_id: selectedTable,
        customer_id: selectedCustomer,

        // New orders start without a waiter.
        waiter_id: null,

        chef_id: 'CH001',
        bartender_id: 'B001',
        order_date: orderDate,
        order_time: orderTime,
        waiting_time: waitingTime,
        order_status: 'Pending',
        total_amount: total,
      };

      // Create the order first.
      await createOrder(orderData);

      // Create each order item.
      for (const item of cart) {
        const orderItemId = `OI${crypto
          .randomUUID()
          .replaceAll('-', '')
          .slice(0, 12)}`;

        const orderItemData = {
          order_item_id: orderItemId,
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: Number(item.price),
          subtotal: Number(item.price) * item.quantity,
        };

        await createOrderItem(orderItemData);
      }

      // Save the submitted order for payment and feedback.
      setSubmittedOrder(orderData);

      // Reset order form.
      setCart([]);
      setSelectedCustomer('');
      setSelectedTable('');

      // Reset payment form for the new order.
      setPaymentMethod('');
      setPaymentSubmitted(false);
      setPaymentDetails(null);

      // Reset feedback form for the new order.
      setRatingValue(0);
      setRatingComment('');
      setRatingSubmitted(false);
      setComplaintDescription('');
      setComplaintSubmitted(false);

      setMessage(
        `Order ${orderId} has been placed successfully!`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          'Something went wrong while placing your order.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Submit payment
  const submitPayment = async () => {
    if (!submittedOrder) {
      setMessage('Please place an order first.');
      return;
    }

    if (!paymentMethod) {
      setMessage('Please select a payment method.');
      return;
    }

    if (paymentSubmitted) {
      setMessage('This order has already been paid for.');
      return;
    }

    try {
      setIsSubmittingPayment(true);
      setMessage('');

      const paymentId = `P${crypto
        .randomUUID()
        .replaceAll('-', '')
        .slice(0, 12)}`;

      const payment = await createPayment({
        payment_id: paymentId,
        order_id: submittedOrder.order_id,
        payment_amount: Number(submittedOrder.total_amount),
        payment_method: paymentMethod,
      });

      setPaymentDetails(payment);
      setPaymentSubmitted(true);

      setMessage('Payment completed successfully!');
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          'Something went wrong while processing your payment.'
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Submit customer rating
  const submitRating = async () => {
    if (!submittedOrder) {
      setMessage('Please place an order first.');
      return;
    }

    if (ratingValue === 0) {
      setMessage('Please select a rating from 1 to 5 stars.');
      return;
    }

    try {
      setIsSubmittingRating(true);
      setMessage('');

      const ratingId = `R${crypto
        .randomUUID()
        .replaceAll('-', '')
        .slice(0, 12)}`;

      await createRating({
        rating_id: ratingId,
        order_id: submittedOrder.order_id,
        customer_id: submittedOrder.customer_id,
        rating_value: ratingValue,
        rating_comment: ratingComment.trim() || null,
      });

      setRatingSubmitted(true);
      setMessage('Thank you! Your rating has been submitted.');
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          'Something went wrong while submitting your rating.'
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Submit customer complaint
  const submitComplaint = async () => {
    if (!submittedOrder) {
      setMessage('Please place an order first.');
      return;
    }

    if (!complaintDescription.trim()) {
      setMessage('Please describe your complaint.');
      return;
    }

    try {
      setIsSubmittingComplaint(true);
      setMessage('');

      const complaintId = `C${crypto
        .randomUUID()
        .replaceAll('-', '')
        .slice(0, 12)}`;

      await createComplaint({
        complaint_id: complaintId,
        order_id: submittedOrder.order_id,
        customer_id: submittedOrder.customer_id,
        complaint_description: complaintDescription.trim(),
      });

      setComplaintSubmitted(true);
      setComplaintDescription('');

      setMessage(
        'Your complaint has been submitted successfully.'
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          'Something went wrong while submitting your complaint.'
      );
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Introduction */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Chowly
          </h2>

          <p className="mt-2 text-gray-600">
            Choose a restaurant, browse the menu, and place
            your order.
          </p>
        </section>

        {/* Restaurants */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Restaurants
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select a restaurant to view its menu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.restaurant_id}
                restaurant={restaurant}
                onSelect={setSelectedRestaurant}
              />
            ))}
          </div>
        </section>

        {/* Selected Restaurant Menu */}
        {selectedRestaurant && (
          <section className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRestaurant.name} Menu
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the items you want to order.
              </p>
            </div>

            {selectedMenuItems.length === 0 ? (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-gray-500">
                  No available menu items found.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedMenuItems.map((item) => (
                  <MenuItemCard
                    key={item.menu_item_id}
                    item={item}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Order Information */}
        <section className="mt-12 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            Order Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the customer and dining table for this
            order.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Customer */}
            <div>
              <label
                htmlFor="customer"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Customer
              </label>

              <select
                id="customer"
                value={selectedCustomer}
                onChange={(event) =>
                  setSelectedCustomer(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
              >
                <option value="">Select a customer</option>

                {customers.map((customer) => (
                  <option
                    key={customer.customer_id}
                    value={customer.customer_id}
                  >
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dining Table */}
            <div>
              <label
                htmlFor="dining-table"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Dining Table
              </label>

              <select
                id="dining-table"
                value={selectedTable}
                onChange={(event) =>
                  setSelectedTable(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
              >
                <option value="">
                  Select a dining table
                </option>

                {diningTables.map((table) => (
                  <option
                    key={table.table_id}
                    value={table.table_id}
                  >
                    Table {table.table_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        {cart.length > 0 && (
          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Items</p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {cartItemCount}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Estimated Waiting Time
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {waitingTime} minutes
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total</p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  ₦{total.toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Cart */}
        <Cart
          cart={cart}
          total={total}
          cartItemCount={cartItemCount}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onPlaceOrder={placeOrder}
          isPlacingOrder={isPlacingOrder}
        />

        {/* Message */}
        {message && (
          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
            <p className="font-medium text-gray-900">{message}</p>
          </div>
        )}

        {/* Submitted Order Details */}
        {submittedOrder && (
          <>
            <section className="mb-8 mt-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>

                  <p className="font-semibold text-gray-900">
                    {submittedOrder.order_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Customer</p>

                  <p className="font-semibold text-gray-900">
                    {submittedOrder.customer_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Table</p>

                  <p className="font-semibold text-gray-900">
                    {submittedOrder.table_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>

                  <p className="font-semibold text-gray-900">
                    {submittedOrder.order_status}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Estimated Waiting Time
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {submittedOrder.waiting_time} minutes
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    ₦
                    {Number(
                      submittedOrder.total_amount
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Complete payment for your order.
                </p>
              </div>

              {paymentSubmitted && paymentDetails ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
                      ✓
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Payment Successful
                      </h3>

                      <p className="text-sm text-gray-500">
                        Your payment has been recorded.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Payment ID
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {paymentDetails.payment_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Amount Paid
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        ₦
                        {Number(
                          paymentDetails.payment_amount
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Method
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {paymentDetails.payment_method}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Status
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {paymentDetails.payment_status}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500">
                      Amount to Pay
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      ₦
                      {Number(
                        submittedOrder.total_amount
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-6">
                    <label
                      htmlFor="payment-method"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Payment Method
                    </label>

                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
                    >
                      <option value="">
                        Select payment method
                      </option>
                      <option value="Cash">
                        Cash
                      </option>
                      <option value="Card">
                        Card
                      </option>
                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={submitPayment}
                      disabled={isSubmittingPayment}
                      className="mt-4 w-full rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmittingPayment
                        ? 'Processing Payment...'
                        : 'Pay Now'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Rating and Complaint */}
            <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Feedback
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Share your experience with this order.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Rating */}
                <div className="rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Rate Your Order
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    How was your experience?
                  </p>

                  {ratingSubmitted ? (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <p className="font-medium text-gray-900">
                        ✓ Rating submitted successfully.
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Thank you for your feedback!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setRatingValue(star)
                            }
                            className={`text-3xl transition ${
                              star <= ratingValue
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            aria-label={`Rate ${star} out of 5`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {ratingValue > 0
                          ? `${ratingValue} out of 5`
                          : 'Select a rating'}
                      </p>

                      <label
                        htmlFor="rating-comment"
                        className="mt-6 block text-sm font-medium text-gray-700"
                      >
                        Comment (optional)
                      </label>

                      <textarea
                        id="rating-comment"
                        value={ratingComment}
                        onChange={(event) =>
                          setRatingComment(
                            event.target.value
                          )
                        }
                        rows="4"
                        placeholder="Tell us about your experience..."
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
                      />

                      <button
                        type="button"
                        onClick={submitRating}
                        disabled={isSubmittingRating}
                        className="mt-4 rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmittingRating
                          ? 'Submitting...'
                          : 'Submit Rating'}
                      </button>
                    </>
                  )}
                </div>

                {/* Complaint */}
                <div className="rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Having a Problem?
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Tell us what went wrong with your order.
                  </p>

                  {complaintSubmitted ? (
                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <p className="font-medium text-gray-900">
                        ✓ Complaint submitted successfully.
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        A waiter will review your complaint.
                      </p>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="complaint"
                        className="mt-6 block text-sm font-medium text-gray-700"
                      >
                        Complaint
                      </label>

                      <textarea
                        id="complaint"
                        value={complaintDescription}
                        onChange={(event) =>
                          setComplaintDescription(
                            event.target.value
                          )
                        }
                        rows="7"
                        placeholder="Describe the problem with your order..."
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
                      />

                      <button
                        type="button"
                        onClick={submitComplaint}
                        disabled={isSubmittingComplaint}
                        className="mt-4 rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmittingComplaint
                          ? 'Submitting...'
                          : 'Submit Complaint'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Home;