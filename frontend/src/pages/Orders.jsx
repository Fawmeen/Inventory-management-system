import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Orders() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
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
      const result = await api.createOrder([{ productId: Number(productId), quantity: Number(quantity) }]);
      setMessage('Order placed successfully.');
      setNotifications(result.lowStockNotifications || []);
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
        <div className="page-header">
          <div>
            <h2>Order Product</h2>
            <p className="muted">Place orders and see any immediate low-stock alerts.</p>
          </div>
        </div>

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
        {notifications.length > 0 && (
          <div className="notification-card">
            <p><strong>Low stock alert:</strong></p>
            <ul>
              {notifications.map((notification) => (
                <li key={`${notification.productId}-${notification.type}`}>
                  <span className="badge badge-danger">Low stock</span>{' '}
                  {notification.productName} now has <strong>{notification.stock}</strong> units left.
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </form>

      <div className="card">
        <div className="page-header">
          <div>
            <h2>My Orders</h2>
            <p className="muted">Review your recent orders and order details.</p>
          </div>
          <span className="muted">{orders.length} orders</span>
        </div>
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
