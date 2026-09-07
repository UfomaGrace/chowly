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
        (cartItem) =>
          cartItem.menu_item_id === item.menu_item_id
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
          menu.restaurant_id ===
          selectedRestaurant.restaurant_id
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
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
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
            (item) =>
              Number(item.preparation_time) || 0
          )
        )
      : 0;

  const placeOrder = async () => {
    if (cart.length === 0) {
      setMessage(
        'Please add at least one item to your cart.'
      );
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

      const orderDate = now
        .toISOString()
        .split('T')[0];

      const orderTime = now
        .toTimeString()
        .split(' ')[0];

      const orderData = {
        order_id: orderId,
        table_id: selectedTable,
        customer_id: selectedCustomer,

        // The order starts unassigned.
        // A waiter will be assigned from the
        // Waiter Dashboard.
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
          subtotal:
            Number(item.price) * item.quantity,
        };

        await createOrderItem(orderItemData);
      }

      // Only show the submitted order after both
      // the order and all order items were created.
      setSubmittedOrder(orderData);

      setCart([]);
      setSelectedCustomer('');
      setSelectedTable('');

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
                <option value="">
                  Select a customer
                </option>

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
                <p className="text-sm text-gray-500">
                  Items
                </p>

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
                <p className="text-sm text-gray-500">
                  Total
                </p>

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
            <p className="font-medium text-gray-900">
              {message}
            </p>
          </div>
        )}

        {/* Submitted Order Details */}
        {submittedOrder && (
          <section className="mb-8 mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Order Details
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">
                  Order ID
                </p>

                <p className="font-semibold text-gray-900">
                  {submittedOrder.order_id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Customer
                </p>

                <p className="font-semibold text-gray-900">
                  {submittedOrder.customer_id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Table
                </p>

                <p className="font-semibold text-gray-900">
                  {submittedOrder.table_id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

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
        )}
      </div>
    </main>
  );
}

export default Home;