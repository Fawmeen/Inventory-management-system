import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Orders() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productList, orderList] = await Promise.all([api.getProducts(), api.getOrders()]);
      setProducts(productList);
      setOrders(orderList);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBuy(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.createOrder([{ productId: Number(productId), quantity: Number(quantity) }]);
      setMessage('Order placed successfully.');
      setProductId('');
      setQuantity('1');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="grid-two">
      <form className="card" onSubmit={handleBuy}>
        <h2>Buy Product</h2>

        <label>
          Product
          <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · ${Number(product.price).toFixed(2)} · stock {product.stock}
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantity
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>

        <button type="submit" disabled={!productId}>
          Place Order
        </button>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>

      <div className="card">
        <h2>My Orders</h2>
        <ul className="list">
          {orders.map((order) => (
            <li key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <span className="muted">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span>${Number(order.total).toFixed(2)}</span>
                <p className="muted">
                  {order.items.map((item) => `${item.product.name} x${item.quantity}`).join(', ')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
