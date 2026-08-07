import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      setError('');

      try {
        const products = await api.getNotifications();
        const recentNotifications = products.filter((product) => {
          const createdAt = new Date(product.createdAt);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return createdAt >= sevenDaysAgo;
        });

        setNotifications(recentNotifications);
      } catch (err) {
        setError(err.message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  if (loading) {
    return <p>Loading notifications…</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p className="muted">New product announcements for customers appear here.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          No new product notifications yet. Check back later for the latest additions.
        </div>
      ) : (
        <div className="notification-card">
          <p>Here are the newest products added in the last 7 days.</p>
          <ul>
            {notifications.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong> — {product.category}
                <div className="badge badge-danger" style={{ marginLeft: '0.75rem' }}>
                  New
                </div>
                <div className="muted" style={{ marginTop: '0.35rem' }}>
                  ${Number(product.price).toFixed(2)} · Stock: {product.stock} · Added{' '}
                  {new Date(product.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
