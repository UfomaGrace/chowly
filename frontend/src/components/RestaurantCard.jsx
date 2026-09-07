function RestaurantCard({ restaurant, onSelect }) {
  return (
    <div
      onClick={() => onSelect(restaurant)}
      className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-gray-900">
        {restaurant.name}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {restaurant.address}
      </p>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onSelect(restaurant);
        }}
        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        View Menu
      </button>
    </div>
  );
}

export default RestaurantCard;