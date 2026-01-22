import React, { useEffect, useState } from 'react';
import apiFetch from '../utils/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

// input placeholders for product filtering
export default function Products() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get('groupId');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  // input placeholder for fetching groups from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch('/api/groups/');
        if (!res.ok) throw new Error('Failed to load groups');
        const data = await res.json();
        if (mounted) setGroups(data);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // input placeholder for fetching products of the selected group from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const url = groupId ? `/api/products/?group=${groupId}` : '/api/products/';
  const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        if (mounted) setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [groupId]);

  if (loading) return <p>Loading products…</p>;

  // input rendered products list
  return (
    <div>
      <h2>Products</h2>
      <div>
        <label>Choose group: </label>
        <select value={groupId || ''} onChange={e => {
          const id = e.target.value;
          if (id) navigate(`?groupId=${id}`);
          else navigate('');
        }}>
          <option value="">All</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.naziv || g.name || g.id}</option>
          ))}
        </select>
      </div>
      {groupId && <p>Products for group {groupId}</p>}
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.naziv || p.name} — {p.cena || p.price}</li>
        ))}
      </ul>
    </div>
  );
}
// output request from client
