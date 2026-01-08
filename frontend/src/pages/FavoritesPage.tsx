import { useEffect, useState } from 'react';
import { listFavorites, removeFavorite } from '../api/favorites.api';
import type { Favorite } from '../types/product';

function formatPriceTRY(value: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  } catch {
    return `${value} ₺`;
  }
}

function getHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const FavoritesPage = () => {
  const [items, setItems] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const favs = await listFavorites();
      setItems(favs);
    } catch (e: any) {
      setError(e?.response?.data?.message?.toString?.() || 'Favoriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="pageTitle">Favoriler</div>
      <p className="pageSubTitle muted">Kaydettiğin ürünleri burada hızlıca karşılaştırabilirsin.</p>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="muted">{isLoading ? 'Yükleniyor…' : `${items.length} favori`}</div>
        <button className="button buttonSecondary" onClick={load} disabled={isLoading}>
          Yenile
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="muted">{error}</div>
        </div>
      )}

      <div className="grid">
        {items.map((fav) => {
          const p = fav.product;
          const rows = [...(p.productPlatforms || [])].sort((a, b) => a.price - b.price);
          return (
            <div key={fav.id} className="card">
              <div className="cardHeader">
                <div>
                  <div style={{ fontWeight: 750, fontSize: 18 }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {p.productType?.name && <span className="pill">{p.productType.name}</span>}
                    {rows.length > 0 && <span className="pill">{rows.length} liste</span>}
                  </div>
                </div>
                <button
                  className="button buttonDanger"
                  onClick={async () => {
                    await removeFavorite(p.id);
                    await load();
                  }}
                >
                  Kaldır
                </button>
              </div>

              {rows.length === 0 ? (
                <div className="muted" style={{ marginTop: 12 }}>
                  Bu ürün için henüz liste bulunamadı.
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Platform</th>
                        <th>Fiyat</th>
                        <th>URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((pp) => (
                        <tr key={pp.id}>
                          <td>{pp.platform?.name || '-'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatPriceTRY(pp.price)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <a
                                className="button buttonSecondary"
                                href={pp.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Siteye Git
                              </a>
                              {getHost(pp.url) && <span className="muted">{getHost(pp.url)}</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FavoritesPage;
