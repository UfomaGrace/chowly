import CartItem from './CartItem';

function Cart({
  cart,
  total,
  cartItemCount,
  onIncrease,
  onDecrease,
  onPlaceOrder,
  isPlacingOrder,
}) {
  return (
    <section className="mt-12 rounded-xl bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          🛒 Cart
        </h2>

        {cart.length > 0 && (
          <span className="rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white">
            {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="mt-4 text-gray-500">
          Your cart is empty.
        </p>
      ) : (
        <div className="mt-6">

          {cart.map((item) => (
            <CartItem
              key={item.menu_item_id}
              item={item}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
            />
          ))}

          {/* Total */}
          <div className="mt-6 flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>

            <span>
              ₦{total.toLocaleString()}
            </span>
          </div>

          {/* Place Order */}
          <button
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="mt-6 w-full rounded-lg bg-gray-900 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>

        </div>
      )}

    </section>
  );
}

export default Cart;