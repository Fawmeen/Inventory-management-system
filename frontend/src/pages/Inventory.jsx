import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProducts().then(setProducts).catch((err) => setError(err.message));
  }, []);

  async function handleAction(type) {
    setMessage('');
    setError('');

    try {
      if (type === 'in') {
        await api.stockIn(Number(productId), Number(quantity));
        setMessage('Stock added successfully.');
      } else {
        await api.stockOut(Number(productId), Number(quantity));
        setMessage('Stock removed successfully.');
      }
      const updated = await api.getProducts();
      setProducts(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="card narrow">
      <h2>Stock In / Out</h2>

      <label>
        Product
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (stock: {product.stock})
            </option>
          ))}
        </select>
      </label>

      <label>
        Quantity
        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </label>

      <div className="row-actions">
        <button type="button" onClick={() => handleAction('in')} disabled={!productId}>
          Stock In
        </button>
        <button type="button" className="btn-secondary" onClick={() => handleAction('out')} disabled={!productId}>
          Stock Out
        </button>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
