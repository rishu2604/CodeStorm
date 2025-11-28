import { useEffect, useState } from "react";

export default function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`http://localhost:3000/listings?page=${page}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        setProducts((prev) => [...prev, ...data.items]); // append for pagination
        setHasMore(data.hasMore);
      } catch (e) {
        console.error("Error fetching products:", e);
      }
    }

    fetchProducts();
  }, [page]);

  return (
    <main>
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>${product.price}</p>

          {/* Render first image */}
          {product.images?.length > 0 && (
            <img
              src={product.images[0].url}
              alt={product.title}
              width={200}
              height={200}
            />
          )}
        </div>
      ))}

      {hasMore && (
        <button onClick={() => setPage((p) => p + 1)}>
          Load More
        </button>
      )}
    </main>
  );
}
