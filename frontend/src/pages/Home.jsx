import { useEffect, useState } from 'react';

import Header from '../components/Header';
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

  const [selectedRestaurant, setSelectedRestaurant] =
    useState(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState('');

  const [selectedTable, setSelectedTable] =
    useState('');

  const [cart, setCart] = useState([]);

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const [message, setMessage] = useState('');

  // Load all Chowly data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          restaurantData,
          menuData,
          menuItemData,
          customerData,
          tableData,
        ] = await Promise.all([
          getRestaurants(),
          getMenus(),
          getMenuItems(),
          getCustomers(),
          getDiningTables(),
        ]);

        setRestaurants(restaurantData);
        setMenus(menuData);
        setMenuItems(menuItemData);
        setCustomers(customerData);
        setDiningTables(tableData);
      } catch (error) {
        console.error('Error loading Chowly data:', error);
      }
    };

    loadData();
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    setMessage('');

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
  };

  // Increase quantity
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

  // Decrease quantity
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

  // Find selected restaurant's menu
  const selectedMenu = selectedRestaurant
    ? menus.find(
        (menu) =>
          menu.restaurant_id ===
          selectedRestaurant.restaurant_id
      )
    : null;

  // Find selected menu's available items
  const selectedMenuItems = selectedMenu
    ? menuItems.filter(
        (item) =>
          item.menu_id === selectedMenu.menu_id &&
          item.availability_status === 'Available'
      )
    : [];

  // Calculate cart total
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  // Calculate number of items
  const cartItemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) {
      setMessage('Your cart is empty.');
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

    setIsPlacingOrder(true);
    setMessage('');

    try {
      // Generate unique order ID
      const orderId = `O${Date.now()}`;

      // Get current date and time
      const now = new Date();

      const orderDate = now
        .toISOString()
        .split('T')[0];

      const orderTime = now
        .toTimeString()
        .split(' ')[0];

      // Create order
      const orderData = {
        order_id: orderId,
        table_id: selectedTable,
        customer_id: selectedCustomer,
        waiter_id: 'W001',
        chef_id: 'CH001',
        bartender_id: 'B001',
        order_date: orderDate,
        order_time: orderTime,
        waiting_time: 0,
        order_status: 'Pending',
        total_amount: total,
      };

      await createOrder(orderData);

      // Create order items
      for (const item of cart) {
        const orderItemData = {
          order_item_id: `OI${Date.now()}${Math.floor(
            Math.random() * 1000
          )}`,
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: Number(item.price),
          subtotal:
            Number(item.price) * item.quantity,
        };

        await createOrderItem(orderItemData);
      }

      // Clear cart and selections
      setCart([]);
      setSelectedCustomer('');
      setSelectedTable('');

      setMessage(
        `Order ${orderId} placed successfully!`
      );
    } catch (error) {
      console.error('Error placing order:', error);

      setMessage(
        'Failed to place order. Please try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Success/Error message */}
        {message && (
          <div className="mb-8 rounded-lg bg-gray-900 px-5 py-4 text-white">
            {message}
          </div>
        )}

        {/* Restaurants */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Restaurants
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.restaurant_id}
                restaurant={restaurant}
                onSelect={setSelectedRestaurant}
              />
            ))}
          </div>
        </section>

        {/* Menu */}
        {selectedRestaurant && (
          <section className="mt-12">

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Menu
              </h2>

              <p className="mt-1 text-gray-500">
                {selectedRestaurant.name}
              </p>
            </div>

            {selectedMenu ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {selectedMenuItems.length > 0 ? (
                  selectedMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.menu_item_id}
                      item={item}
                      onAddToCart={addToCart}
                    />
                  ))
                ) : (
                  <p className="text-gray-500">
                    No available items in this menu.
                  </p>
                )}

              </div>
            ) : (
              <p className="text-gray-500">
                No menu found for this restaurant.
              </p>
            )}

          </section>
        )}

        {/* Order Form */}
        <section className="mt-12 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-bold text-gray-900">
            Order Information
          </h2>

          <p className="mt-1 text-gray-500">
            Select the customer and dining table for this order.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">

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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900"
              >
                <option value="">
                  Select a customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.customer_id}
                    value={customer.customer_id}
                  >
                    {customer.name} ({customer.customer_id})
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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900"
              >
                <option value="">
                  Select a dining table
                </option>

                {diningTables.map((table) => (
                  <option
                    key={table.table_id}
                    value={table.table_id}
                  >
                    Table {table.table_number} ({table.table_id})
                  </option>
                ))}
              </select>
            </div>

          </div>

        </section>

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

      </main>

    </div>
  );
}

export default Home;