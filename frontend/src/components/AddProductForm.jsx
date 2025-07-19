import React,{ useState } from "react";

const AddProductForm = () => {
   const[formData, setFormData] = useState({
    productName: "",
    grade: "A",
    location: "",
    quantity: "",
    price: "",
    harvestDate: "",
    description: "",
    
});

const products = [
  "Tomatoes 🍅",
  "Carrots 🥕",
  "Onions 🧅",
  "Potatoes 🥔",
  "Cabbage 🥬",
  "Lettuce 🥗",
  "Cucumber 🥒",
  "Chili Peppers 🌶️",
  "Eggplant 🍆",
  "Beans 🌱",
  "Pumpkin 🎃",
  "Cauliflower 🥦","Spinach 🌿","Garlic 🧄","Ginger 🫚","Bananas 🍌","Papaya 🍈","Watermelon 🍉",
  "Pineapple 🍍","Mango 🥭","Oranges 🍊","Guava 🍐","Jackfruit 🍈",
];

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};


const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // 👉 TODO: Send to backend API (e.g., using fetch or axios)
    };

   return (
    <form onSubmit={handleSubmit} className="max-w-xl p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Add New Product</h2>

      <div>
        <label>Product Name:</label>
        <select name="productName" value={formData.productName} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">-- Select --</option>
          {products.map((prod) => (
            <option key={prod} value={prod}>{prod}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Grade:</label>
        <div className="flex gap-3">
          {["A", "B", "C"].map((g) => (
            <label key={g}>
              <input type="radio" name="grade" value={g} checked={formData.grade === g} onChange={handleChange} />
              {g}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>Location:</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g., Polonnaruwa" />
      </div>

      <div>
        <label>Quantity (kg):</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Price per kg (Rs.):</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label>Harvest Date:</label>
        <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>

      

     
      <div>
        <label>Description (optional):</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" rows="3" />
      </div>

      <div className="flex justify-between mt-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">📤 Submit Listing</button>
        <button type="reset" onClick={() => setFormData({ ...formData, photos: [], certifications: [] })} className="bg-gray-400 text-white px-4 py-2 rounded">❌ Cancel</button>
      </div>
    </form>
  );
};

export default AddProductForm;