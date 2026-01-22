import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiFetch from '../utils/api';

function ProductsCRUD() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", group: "" });
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  const { token, user: currentUser } = useAuth();

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return; // Don't fetch if no token
    
    // Fetch products
    const loadProducts = async () => {
      try {
        const res = await apiFetch('/api/products/');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProducts([]);
      }
    };
    loadProducts(); 

    // Fetch groups
    apiFetch('/api/groups/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGroups(data);
        } else {
          setGroups([]);
        }
      })
      .catch(() => setGroups([]));
  }, [token]);

  const addProduct = async () => {
    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("description", newItem.description);
    formData.append("price", newItem.price);
    formData.append("group", newItem.group);
    if (image) formData.append("slika", image);

    const res = await apiFetch('/api/products/', {
      method: "POST",
      headers: {
        ...authHeader,
        // Don't set Content-Type for FormData - let browser set multipart/form-data automatically
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setProducts(prev => [...prev, data]);
      setNewItem({ name: "", description: "", price: "", group: "" });
      setImage(null);
    }
  };

  const deleteProduct = async (id) => {
    const res = await apiFetch(`/api/products/${id}/`, {
      method: "DELETE",
    });
    
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const savePrice = async (id) => {
    const res = await apiFetch(`/api/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ price: newPrice }),
    });

    if (res.ok) {
      const data = await res.json();
      // Reset edit state first
      setEditId(null);
      setNewPrice("");
      // Then update product in list
      setProducts(prev => prev.map(p => p.id === id ? data : p));
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <ul>
          {products.map(product => (
            <li key={product.id}>
              {product.name} - {product.description} - {product.group_name || "No group"} -{" "}
              {editId === product.id ? (
              <>
                <input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  style={{ width: "80px" }}
                />
                <button onClick={() => savePrice(product.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {product.price} RSD{" "}
                <button onClick={() => {
                  setEditId(product.id);
                  setNewPrice(product.price);
                }}>Edit price</button>
              </>
            )}
            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {currentUser && ((currentUser.groups?.includes("JWT")) || currentUser.is_superuser) ? (
        <>
          <h3>Add Product</h3>
          <input
            placeholder="Name"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          /><br />
          <select
            value={newItem.group}
            onChange={e => setNewItem({ ...newItem, group: e.target.value })}
          >
            <option value="">-- Choose group --</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select><br />
          <input
            placeholder="Description"
            value={newItem.description}
            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
          /><br />
          <input
            placeholder="Price"
            type="number"
            value={newItem.price}
            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
          /><br />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          /><br />
          <button onClick={addProduct}>Add</button>
        </>
      ) : (
        currentUser && <p style={{ color: "gray" }}>You don't have permission to add products.</p>
      )}
    </div>
  );
}

export default ProductsCRUD;
