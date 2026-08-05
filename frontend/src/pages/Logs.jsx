import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [stockUpdate, setStockUpdate] = useState(null);
  const [stockError, setStockError] = useState('');
  const [error, setError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    api.getLogs().then(setLogs).catch((err) => setError(err.message));
  }, []);

  async function fetchStockUpdate() {
    setStockError('');
    setLoadingUpdate(true);

    try {
      const data = await api.getStockUpdates();
      setStockUpdate(data);
    } catch (err) {
      setStockError(err.message);
    } finally {
      setLoadingUpdate(false);
    }
  }

  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row-actions">
          <h2>Stock Notifications</h2>
          <button type="button" onClick={fetchStockUpdate} disabled={loadingUpdate}>
            {loadingUpdate ? 'Checking queue…' : 'Pull stock updates'}
          </button>
        </div>

        {stockError && <p className="error">{stockError}</p>}

        {stockUpdate && stockUpdate.message ? (
          <div className="notification-card">
            <p>
              <strong>Event:</strong> {stockUpdate.message.type}
            </p>
            <p>
              <strong>Product:</strong> {stockUpdate.message.name}
            </p>
            <p>
              <strong>Stock:</strong> {stockUpdate.message.stock}
            </p>
            <p>
              <strong>Threshold:</strong> {stockUpdate.message.threshold}</p>
            <p>
              <strong>Time:</strong> {new Date(stockUpdate.message.timestamp).toLocaleString()}
            </p>
            <p>
              <strong>Users notified:</strong> {stockUpdate.userNotifications.length}
            </p>
            <ul>
              {stockUpdate.userNotifications.map((user) => (
                <li key={user.userEmail}>
                  {user.userName} ({user.userEmail})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="muted">Pull the queue to see manager events from the notification table.</p>
        )}
      </div>

      <h2>Inventory Logs</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Staff</th>
              <th>Type</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.product?.name}</td>
                <td>{log.staff?.name}</td>
                <td>{log.type}</td>
                <td>{log.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
