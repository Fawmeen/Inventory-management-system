import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading products…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="muted">Browse products, monitor stock levels, and keep your catalog up to date.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={loadProducts}>
          Refresh
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Low Stock At</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product.stock <= product.lowStockThreshold ? 'low-stock' : ''}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{product.name}</span>
                    {product.stock <= product.lowStockThreshold && (
                      <span className="badge badge-danger">Low stock</span>
                    )}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>{product.lowStockThreshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
