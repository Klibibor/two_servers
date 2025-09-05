import React, { useEffect, useState } from 'react';
import apiFetch from '../utils/api';
import { useNavigate } from 'react-router-dom';

// input placeholders for group, loading, navigate
export default function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // input hooks for fetching to placeholder
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
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  // output group with data from backend + loading finished

  // input navigation when group is clicked
  const openGroup = (groupId) => {
    // navigate to products page and pass group id as search param
    navigate(`/products?groupId=${groupId}`);
  };
// output client navigated

// loading visual
  if (loading) return <p>Loading groups…</p>;


  // input rendered group list
  return (
    <div>
      <h2>Home</h2>
      <p>Click a group to view its products:</p>
      <ul>
        {groups.map(g => (
          <li key={g.id}>
            <button onClick={() => openGroup(g.id)}>{g.naziv || g.name || `Group ${g.id}`}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
// output user requests for opening group
