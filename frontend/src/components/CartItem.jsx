function CartItem({
  item,
  onIncrease,
  onDecrease,
}) {
  const itemTotal = Number(item.price) * item.quantity;

  return (
    <div className="flex flex-col gap-4 border-b py-4 sm:flex-row sm:items-center sm:justify-between">

      {/* Item information */}
      <div>
        <h3 className="font-semibold text-gray-900">
          {item.item_name}
        </h3>

        <p className="text-sm text-gray-500">
          ₦{Number(item.price).toLocaleString()} each
        </p>
      </div>

      {/* Quantity and total */}
      <div className="flex items-center gap-6">

        {/* Quantity controls */}
        <div className="flex items-center rounded-lg border border-gray-300">

          <button
            onClick={() => onDecrease(item.menu_item_id)}
            className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
          >
            −
          </button>

          <span className="px-4 py-2 font-semibold">
            {item.quantity}
          </span>

          <button
            onClick={() => onIncrease(item.menu_item_id)}
            className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100"
          >
            +
          </button>

        </div>

        {/* Item total */}
        <span className="min-w-24 text-right font-semibold text-gray-900">
          ₦{itemTotal.toLocaleString()}
        </span>

      </div>

    </div>
  );
}

export default CartItem;
