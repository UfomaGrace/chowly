function MenuItemCard({ item, onAddToCart }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-bold text-gray-900">
        {item.item_name}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {item.description}
      </p>

      <p className="mt-4 text-lg font-bold text-gray-900">
        ₦{Number(item.price).toLocaleString()}
      </p>

      <button
        onClick={() => onAddToCart(item)}
        className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-700"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default MenuItemCard;