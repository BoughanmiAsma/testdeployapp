import React, { useState, useEffect, useCallback } from 'react';

// Si VITE_API_URL est défini (ex: http://localhost:5000), on l'utilise,
// sinon chemin relatif '' (parfait pour Ingress K8s & Nginx reverse-proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [status, setStatus] = useState({
    connected: false,
    latency: null,
    dbVersion: 'PostgreSQL',
    uptime: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  // Ping API & Vérifier la connectivité PostgreSQL
  const checkHealthAndLoadData = useCallback(async () => {
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_URL}/api/health`);
      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json();
        setStatus({
          connected: true,
          latency,
          dbVersion: data.dbVersion || 'PostgreSQL 16',
          uptime: data.uptime,
          error: null,
        });
      } else {
        const errorText = await res.text();
        setStatus({
          connected: false,
          latency,
          dbVersion: 'Inaccessible',
          uptime: null,
          error: `HTTP ${res.status}: ${errorText.substring(0, 80)}`,
        });
      }
    } catch (err) {
      setStatus({
        connected: false,
        latency: null,
        dbVersion: 'Déconnecté',
        uptime: null,
        error: err.message || 'Serveur backend injoignable',
      });
    }

    // Charger les todos depuis la base
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Impossible de charger les todos:', err);
    } finally {
      setLoading(false);
      setLastCheck(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    checkHealthAndLoadData();
  }, [checkHealthAndLoadData]);

  // Ajouter un nouvel élément
  const handleAddItem = async (titleToAdd) => {
    const title = (titleToAdd || newItem).trim();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        setNewItem('');
        await checkHealthAndLoadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Erreur d'ajout : ${errData.error || res.statusText}`);
      }
    } catch (err) {
      alert(`Erreur réseau lors de l'ajout : ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Basculer l'état complété
  const handleToggleComplete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          )
        );
      }
    } catch (err) {
      console.error('Erreur toggle:', err);
    }
  };

  // Supprimer un élément
  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert(`Erreur de suppression : ${err.message}`);
    }
  };

  const quickPresets = [
    'Test Ingress testdeployapp.com',
    'Test Persistance PostgreSQL PVC',
    'Test API Node.js Express',
  ];

  return (
    <div style={styles.page}>
      {/* Container principal */}
      <div style={styles.container}>
        
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.brandBadge}>
              <span>☸️ KUBERNETES & DOCKER DEPLOYMENT TEST</span>
            </div>
            <h1 style={styles.title}>Cloud Native App Validator</h1>
            <p style={styles.subtitle}>
              Testez en direct le routage Ingress, l'API Node.js et la persistance PostgreSQL.
            </p>
          </div>

          <div style={styles.statusBox}>
            <div
              style={{
                ...styles.statusIndicator,
                backgroundColor: status.connected ? '#ecfdf5' : '#fef2f2',
                borderColor: status.connected ? '#6ee7b7' : '#fca5a5',
              }}
            >
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: status.connected ? '#10b981' : '#ef4444',
                  boxShadow: status.connected
                    ? '0 0 8px rgba(16, 185, 129, 0.6)'
                    : '0 0 8px rgba(239, 68, 68, 0.6)',
                }}
              />
              <span
                style={{
                  color: status.connected ? '#065f46' : '#991b1b',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {status.connected ? 'Cluster & API Connectés' : 'API Déconnectée'}
              </span>
            </div>
            {lastCheck && (
              <span style={styles.lastCheckText}>Dernier check : {lastCheck}</span>
            )}
          </div>
        </header>

        {/* Message d'erreur s'il y a un souci */}
        {status.error && (
          <div style={styles.errorAlert}>
            <div style={{ fontWeight: 600 }}>⚠️ Problème de communication API :</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{status.error}</div>
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.85 }}>
              Astuce : Vérifiez que le conteneur backend tourne et que le routage Ingress (/api) pointe vers backend-service:5000.
            </div>
          </div>
        )}

        {/* Grille de diagnostics d'architecture */}
        <section style={styles.grid}>
          {/* Card Front-end */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>💻</span>
              <span style={styles.cardBadge}>Client</span>
            </div>
            <h2 style={styles.cardTitle}>Front-end React</h2>
            <div style={styles.cardValue}>Nginx & Vite</div>
            <div style={styles.cardDetail}>
              Port : <strong>80 / 3000</strong>
            </div>
            <div style={styles.cardDetail}>
              Ingress Host : <code>testdeployapp.com</code>
            </div>
          </div>

          {/* Card Back-end API */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>⚙️</span>
              <span
                style={{
                  ...styles.cardBadge,
                  backgroundColor: status.connected ? '#dbeafe' : '#fee2e2',
                  color: status.connected ? '#1e40af' : '#991b1b',
                }}
              >
                {status.connected ? 'En ligne' : 'Inactif'}
              </span>
            </div>
            <h2 style={styles.cardTitle}>API Backend Node.js</h2>
            <div style={styles.cardValue}>Express v5.2</div>
            <div style={styles.cardDetail}>
              Latence HTTP : <strong>{status.latency !== null ? `${status.latency} ms` : 'N/A'}</strong>
            </div>
            <div style={styles.cardDetail}>
              Uptime : <strong>{status.uptime !== null ? `${status.uptime}s` : 'N/A'}</strong>
            </div>
          </div>

          {/* Card Base de données */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🗄️</span>
              <span
                style={{
                  ...styles.cardBadge,
                  backgroundColor: status.connected ? '#dcfce7' : '#f3f4f6',
                  color: status.connected ? '#166534' : '#4b5563',
                }}
              >
                {status.connected ? 'Connectée' : 'Déconnectée'}
              </span>
            </div>
            <h2 style={styles.cardTitle}>PostgreSQL 16</h2>
            <div style={styles.cardValue}>{status.dbVersion}</div>
            <div style={styles.cardDetail}>
              Storage : <strong>PVC data-files (500Mi)</strong>
            </div>
            <div style={styles.cardDetail}>
              Port service : <strong>5432</strong>
            </div>
          </div>
        </section>

        {/* Section Actions de test */}
        <section style={styles.actionPanel}>
          <div style={styles.actionHeader}>
            <h3 style={styles.actionTitle}>Actions de Validation du Déploiement</h3>
            <button
              id="btn-refresh-health"
              onClick={checkHealthAndLoadData}
              style={styles.btnSecondary}
              disabled={loading}
            >
              🔄 Actualiser le Statut
            </button>
          </div>

          {/* Boutons d'action rapide */}
          <div style={styles.quickPresets}>
            <span style={styles.presetLabel}>Tests préconfigurés :</span>
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddItem(preset)}
                disabled={submitting}
                style={styles.presetBtn}
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Formulaire ajout manuel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddItem();
            }}
            style={styles.form}
          >
            <input
              id="input-task-title"
              type="text"
              placeholder="Saisissez un message de test pour la base de données..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              style={styles.input}
              disabled={submitting}
            />
            <button
              id="btn-submit-task"
              type="submit"
              style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              disabled={submitting || !newItem.trim()}
            >
              {submitting ? 'Enregistrement...' : 'Insérer en Base'}
            </button>
          </form>

          {/* Liste des entrées enregistrées en BD */}
          <div style={styles.listContainer}>
            <div style={styles.listHeader}>
              <h4 style={styles.listTitle}>
                Données persistées dans PostgreSQL
              </h4>
              <span style={styles.badgeCount}>
                {items.length} {items.length > 1 ? 'enregistrements' : 'enregistrement'}
              </span>
            </div>

            {loading ? (
              <div style={styles.loadingBox}>Chargement des données du cluster...</div>
            ) : items.length === 0 ? (
              <div style={styles.emptyBox}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📂</div>
                <div>Aucun enregistrement dans PostgreSQL pour le moment.</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Cliquez sur un des tests préconfigurés ci-dessus pour vérifier l'écriture SQL en direct.
                </div>
              </div>
            ) : (
              <ul style={styles.list}>
                {items.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      ...styles.listItem,
                      backgroundColor: item.completed ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <div style={styles.itemLeft}>
                      <input
                        type="checkbox"
                        checked={Boolean(item.completed)}
                        onChange={() => handleToggleComplete(item.id)}
                        style={styles.checkbox}
                        title="Marquer comme validé"
                      />
                      <span
                        style={{
                          ...styles.itemText,
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? '#94a3b8' : '#1e293b',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div style={styles.itemRight}>
                      <span style={styles.idTag}>ID #{item.id}</span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={styles.deleteBtn}
                        title="Supprimer cet enregistrement"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Guide d'aide au déploiement Kubernetes */}
        <section style={styles.k8sGuide}>
          <h4 style={styles.guideTitle}>📋 Guide de Déploiement Kubernetes</h4>
          <div style={styles.guideGrid}>
            <div style={styles.guideItem}>
              <strong>1. Appliquer les secrets et PVC :</strong>
              <code>kubectl apply -f k8s/secret-db.yaml -f k8s/postgres-pvc.yaml</code>
            </div>
            <div style={styles.guideItem}>
              <strong>2. Déployer PostgreSQL & Backend :</strong>
              <code>kubectl apply -f k8s/deploiement-bd.yaml -f k8s/deploiement-backend.yaml</code>
            </div>
            <div style={styles.guideItem}>
              <strong>3. Déployer Frontend & Ingress :</strong>
              <code>kubectl apply -f k8s/deploiement-front.yaml -f k8s/Ingress.yaml</code>
            </div>
            <div style={styles.guideItem}>
              <strong>4. Hôte local (hosts) :</strong>
              <code>127.0.0.1 testdeployapp.com</code>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Design CSS-in-JS élégant et moderne
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    backgroundImage: 'radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(15, 23, 42, 0.8) 0px, transparent 50%)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    padding: '32px 16px',
    boxSizing: 'border-box',
    color: '#0f172a',
  },
  container: {
    maxWidth: '980px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '24px',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  brand: {
    flex: 1,
    minWidth: '280px',
  },
  brandBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 10px',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
  },
  statusBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '24px',
    border: '1px solid',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  lastCheckText: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '14px 18px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardIcon: {
    fontSize: '22px',
  },
  cardBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    textTransform: 'uppercase',
  },
  cardTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
  },
  cardValue: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '12px',
  },
  cardDetail: {
    fontSize: '12px',
    color: '#475569',
    marginTop: '4px',
  },
  actionPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '28px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  actionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
  },
  quickPresets: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  presetLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 600,
  },
  presetBtn: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  form: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '240px',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    outline: 'none',
    backgroundColor: '#f8fafc',
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  btnSecondary: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#1e293b',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  listContainer: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  listTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badgeCount: {
    fontSize: '12px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    gap: '12px',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  itemText: {
    fontSize: '14px',
    fontWeight: 500,
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  idTag: {
    fontSize: '11px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: 600,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '30px',
    color: '#64748b',
    fontSize: '14px',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '32px 16px',
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    color: '#475569',
  },
  k8sGuide: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px',
  },
  guideTitle: {
    margin: '0 0 14px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
  },
  guideGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  },
  guideItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    color: '#334155',
  },
};