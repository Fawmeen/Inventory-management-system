import { useEffect, useState } from 'react';
import { api } from '../api/client';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  stock: '0',
  lowStockThreshold: '5',
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold),
    });
    setMessage('');
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setMessage('Product updated.');
      } else {
        await api.createProduct(payload);
        setMessage('Product created.');
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    setError('');
    try {
      await api.deleteProduct(id);
      setMessage('Product deleted.');
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="grid-two">
      <form className="card" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>

        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Category
          <input name="category" value={form.category} onChange={handleChange} required />
        </label>
        <label>
          Price
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
        </label>
        <label>
          Stock
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
        </label>
        <label>
          Low stock threshold
          <input
            name="lowStockThreshold"
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={handleChange}
            required
          />
        </label>

        <div className="row-actions">
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>

      <div className="card">
        <h2>All Products</h2>
        <ul className="list">
          {products.map((product) => (
            <li key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span className="muted">
                  {product.category} · ${Number(product.price).toFixed(2)} · stock {product.stock}
                </span>
              </div>
              <div className="row-actions">
                <button type="button" className="btn-secondary" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
