import { useState } from "react";

export default function AddProductPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    pricingType: "FIXED", // FIXED or AUCTION
    price: "",
    images: [""],
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (index, value) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm({ ...form, images: updated });
  };

  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const submitProduct = async () => {
    try {
      const response = await fetch("http://localhost:3000/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log("Product created:", data);
      alert("Product added successfully!");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Add Product</h1>

      <div style={{ marginBottom: 12 }}>
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Product title"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Category ID</label>
        <input
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          placeholder="category UUID"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Pricing Type</label>
        <select name="pricingType" value={form.pricingType} onChange={handleChange}>
          <option value="FIXED">Fixed Price</option>
          <option value="AUCTION">Auction</option>
        </select>
      </div>

      {form.pricingType === "FIXED" && (
        <div style={{ marginBottom: 12 }}>
          <label>Price</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="100"
            type="number"
          />
        </div>
      )}

      <div>
        <label>Images (URL)</label>
        {form.images.map((img, index) => (
          <input
            key={index}
            value={img}
            onChange={(e) => handleImageChange(index, e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{ display: "block", marginBottom: 8 }}
          />
        ))}
        <button onClick={addImageField}>Add More Images</button>
      </div>

      <button
        style={{ marginTop: 20 }}
        onClick={submitProduct}
      >
        Submit Product
      </button>
    </main>
  );
}
