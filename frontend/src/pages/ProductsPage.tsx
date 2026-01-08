import { useEffect, useMemo, useState } from 'react';
import { searchProducts } from '../api/products.api';
import { addFavorite, listFavorites, removeFavorite } from '../api/favorites.api';
import type { Product } from '../types/product';
import { useAuth } from '../state/auth';

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

const ProductsPage = () => {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const load = async () => {
    const trimmed = q.trim();
    if (!trimmed) {
      setHasSearched(false);
      setItems([]);
      setError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await searchProducts({ q: trimmed });
      setItems(data);
      setHasSearched(true);
    } catch (e: any) {
      setError(e?.response?.data?.message?.toString?.() || 'Ürünler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ilk açılışta listeleme yapmıyoruz
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.role !== 'user') return;
    (async () => {
      try {
        const favs = await listFavorites();
        setFavoriteIds(new Set(favs.map((f) => f.product.id)));
      } catch {
      }
    })();
  }, [user?.role]);

  useEffect(() => {
  
  }, []);

  const countText = useMemo(() => {
    if (isLoading) return 'Yükleniyor…';
    if (!hasSearched) return 'Arama yap';
    return `${items.length} ürün`;
  }, [hasSearched, isLoading, items.length]);

  const toggleFavorite = async (productId: number) => {
    if (user?.role !== 'user') return;

    const next = new Set(favoriteIds);
    const isFav = next.has(productId);
    try {
      if (isFav) {
        await removeFavorite(productId);
        next.delete(productId);
      } else {
        await addFavorite(productId);
        next.add(productId);
      }
      setFavoriteIds(next);
    } catch {
  
    }
  };

  return (
    <>
      <div className="pageTitle">Arama</div>
      <p className="pageSubTitle muted">
        Ürün adı veya ürün türüne göre ara; mevcut siteleri, URL’leri ve fiyatları karşılaştır.
      </p>

      <div className="card">
        <div className="row">
          <input
            className="input"
            placeholder="Ara (örn: Nemlendirici, Güneş kremi, ...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                load();
              }
            }}
          />

          <button className="button" onClick={load} disabled={isLoading}>
            {isLoading ? 'Yükleniyor…' : 'Ara'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <div className="muted">{countText}</div>
          {error && <div className="muted">{error}</div>}
        </div>
      </div>

      {!hasSearched && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 750, marginBottom: 6 }}>Ne arıyorsun?</div>
          <div className="muted">
            Ürün adı veya ürün türü yaz (örn: <span className="pill">Nemlendirici</span>,{' '}
            <span className="pill">Saç Maskesi</span>, <span className="pill">Güneş Kremi</span>) ve ara.
          </div>
        </div>
      )}

      <div className="grid">
        {items.map((p) => {
          const rows = [...(p.productPlatforms || [])].sort((a, b) => a.price - b.price);
          const isFav = favoriteIds.has(p.id);

          return (
            <div key={p.id} className="card">
              <div className="cardHeader">
                <div>
                  <div style={{ fontWeight: 750, fontSize: 18 }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {p.productType?.name && <span className="pill">{p.productType.name}</span>}
                    {p.brand?.name && <span className="pill">{p.brand.name}</span>}
                    {rows.length > 0 && <span className="pill">{rows.length} liste</span>}
                  </div>
                </div>

                {user?.role === 'user' && (
                  <button
                    className={isFav ? 'button buttonSecondary' : 'button buttonSecondary'}
                    onClick={() => toggleFavorite(p.id)}
                    title={isFav ? 'Favorilerden çıkar' : 'Favoriye ekle'}
                  >
                    {isFav ? '★ Favoride' : '☆ Favorile'}
                  </button>
                )}
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

export default ProductsPage;
