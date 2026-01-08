import { useEffect, useMemo, useState } from 'react';
import { listProductTypes } from '../api/productTypes.api';
import { createProduct, deleteProduct, listProducts } from '../api/products.api';
import { createPlatform, listPlatforms } from '../api/platforms.api';
import { createBrand, listBrands } from '../api/brands.api';
import { listUsers } from '../api/users.api';
import {
  createProductPlatform,
  deleteProductPlatform,
  updateProductPlatform,
} from '../api/productPlatforms.api';
import type {
  Brand,
  Platform,
  Product,
  ProductPlatform,
  ProductType,
} from '../types/product';
import type { User } from '../types/user';

function formatPriceTRY(value: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  } catch {
    return `${value} ₺`;
  }
}

const AdminPage = () => {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [newBrandName, setNewBrandName] = useState('');

  // new product listings (required: at least 1)
  const [newListings, setNewListings] = useState<
    Array<{ platformId: number | ''; price: string; url: string }>
  >([{ platformId: '', price: '', url: '' }]);

  // existing listing edit state (key: productPlatformId)
  const [listingEdits, setListingEdits] = useState<
    Record<number, { platformId: number | ''; price: string; url: string }>
  >({});

  // per-product "add listing" state
  const [addListing, setAddListing] = useState<
    Record<number, { platformId: number | ''; price: string; url: string }>
  >({});

  const [busyKey, setBusyKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [t, pl, b, u, p] = await Promise.all([
        listProductTypes(),
        listPlatforms(),
        listBrands(),
        listUsers(),
        listProducts(),
      ]);
      setTypes(t);
      setPlatforms(pl);
      setBrands(b);
      setUsers(u);
      setItems(p);

      // initialize edit state for existing listings
      const edits: Record<number, { platformId: number | ''; price: string; url: string }> = {};
      for (const prod of p) {
        for (const pp of prod.productPlatforms || []) {
          edits[pp.id] = {
            platformId: pp.platform?.id ?? '',
            price: String(pp.price ?? ''),
            url: pp.url ?? '',
          };
        }
      }
      setListingEdits(edits);
    } catch (e: any) {
      setError(e?.response?.data?.message?.toString?.() || 'Admin verileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canSubmitNewProduct = useMemo(() => {
    if (!name.trim()) return false;
    if (brandId === '') return false;
    if (!newListings.length) return false;
    return newListings.every((l) => {
      const price = Number(l.price);
      return (
        l.platformId !== '' &&
        Number.isFinite(price) &&
        price > 0 &&
        l.url.trim().length > 0
      );
    });
  }, [name, brandId, newListings]);

  const submitNewProduct = async () => {
    if (!canSubmitNewProduct) return;
    setBusyKey('createProduct');
    try {
      const product = await createProduct({
        name: name.trim(),
        productType: typeId === '' ? undefined : typeId,
        brandId: brandId === '' ? undefined : brandId,
      });

      // create listings (platform + price + url)
      for (const l of newListings) {
        await createProductPlatform({
          productId: product.id,
          platformId: l.platformId as number,
          price: Number(l.price),
          url: l.url.trim(),
        });
      }

      setName('');
      setTypeId('');
      setBrandId('');
      setNewListings([{ platformId: '', price: '', url: '' }]);
      await load();
    } finally {
      setBusyKey('');
    }
  };

  const submitCreatePlatform = async () => {
    const trimmed = newPlatformName.trim();
    if (!trimmed) return;
    setBusyKey('createPlatform');
    try {
      const created = await createPlatform({ name: trimmed });
      setPlatforms((prev) => {
        const exists = prev.some((p) => p.id === created.id);
        const next = exists ? prev : [...prev, created];
        return [...next].sort((a, b) => a.name.localeCompare(b.name));
      });
      setNewPlatformName('');
    } finally {
      setBusyKey('');
    }
  };

  const submitCreateBrand = async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    setBusyKey('createBrand');
    try {
      const created = await createBrand({ name: trimmed });
      setBrands((prev) => {
        const exists = prev.some((b) => b.id === created.id);
        const next = exists ? prev : [...prev, created];
        return [...next].sort((a, b) => a.name.localeCompare(b.name));
      });
      setBrandId(created.id);
      setNewBrandName('');
    } finally {
      setBusyKey('');
    }
  };

  const updateExistingListing = async (pp: ProductPlatform) => {
    const edit = listingEdits[pp.id];
    if (!edit) return;
    if (edit.platformId === '') return;
    setBusyKey(`updatePP:${pp.id}`);
    try {
      await updateProductPlatform(pp.id, {
        platformId: edit.platformId as number,
        price: Number(edit.price),
        url: edit.url.trim(),
      });
      await load();
    } finally {
      setBusyKey('');
    }
  };

  const removeExistingListing = async (ppId: number) => {
    setBusyKey(`deletePP:${ppId}`);
    try {
      await deleteProductPlatform(ppId);
      await load();
    } finally {
      setBusyKey('');
    }
  };

  const createListingForProduct = async (productId: number) => {
    const draft = addListing[productId] || { platformId: '', price: '', url: '' };
    const price = Number(draft.price);
    if (
      draft.platformId === '' ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !draft.url.trim()
    ) {
      return;
    }

    setBusyKey(`createPP:${productId}`);
    try {
      await createProductPlatform({
        productId,
        platformId: draft.platformId as number,
        price,
        url: draft.url.trim(),
      });
      setAddListing((prev) => ({ ...prev, [productId]: { platformId: '', price: '', url: '' } }));
      await load();
    } finally {
      setBusyKey('');
    }
  };

  return (
    <>
      <div className="pageTitle">Yönetim</div>
      <p className="pageSubTitle muted">
        Ürün ekle/sil ve her ürün için platform/fiyat/url listelemelerini yönet.
      </p>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={activeTab === 'products' ? 'button' : 'button buttonSecondary'}
            onClick={() => setActiveTab('products')}
            type="button"
          >
            Ürün Yönetimi
          </button>
          <button
            className={activeTab === 'users' ? 'button' : 'button buttonSecondary'}
            onClick={() => setActiveTab('users')}
            type="button"
          >
            Kullanıcılar
          </button>
        </div>
        <button className="button buttonSecondary" onClick={load} disabled={isLoading} type="button">
          Yenile
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="cardHeader">
            <div>
              <div style={{ fontWeight: 750, fontSize: 18 }}>Kayıtlı Kullanıcılar</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Toplam: {isLoading ? 'Yükleniyor…' : `${users.length} kullanıcı`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{u.id}</td>
                    <td>{u.name}</td>
                    <td style={{ wordBreak: 'break-word' }}>{u.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          <input
            className="input"
            placeholder="Ürün adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="select"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Ürün türü (opsiyonel)</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Marka seç (zorunlu)</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontWeight: 750, marginBottom: 8 }}>Listeleme (platform · fiyat · url)</div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
              Ürün eklemek için en az 1 listeleme girmelisin.
            </div>

            <div className="stack">
              {newListings.map((l, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <select
                    className="select"
                    value={l.platformId}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : '';
                      setNewListings((prev) =>
                        prev.map((x, i) => (i === idx ? { ...x, platformId: v } : x)),
                      );
                    }}
                  >
                    <option value="">Platform seç</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    className="input"
                    placeholder="Fiyat (₺)"
                    inputMode="decimal"
                    value={l.price}
                    onChange={(e) => setNewListings((prev) => prev.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x)))}
                  />

                  <input
                    className="input"
                    placeholder="URL"
                    value={l.url}
                    onChange={(e) => setNewListings((prev) => prev.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      className="button buttonSecondary"
                      type="button"
                      onClick={() => setNewListings((prev) => [...prev, { platformId: '', price: '', url: '' }])}
                    >
                      + Satır
                    </button>
                    <button
                      className="button buttonDanger"
                      type="button"
                      disabled={newListings.length <= 1}
                      onClick={() => setNewListings((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Satır Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontWeight: 750, marginBottom: 8 }}>Platform ekle (opsiyonel)</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                className="input"
                placeholder="Platform adı (örn: Trendyol)"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
              />
              <button
                className="button buttonSecondary"
                type="button"
                disabled={!newPlatformName.trim() || busyKey === 'createPlatform'}
                onClick={submitCreatePlatform}
              >
                {busyKey === 'createPlatform' ? 'Ekleniyor…' : 'Platform Ekle'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontWeight: 750, marginBottom: 8 }}>Marka ekle (opsiyonel)</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                className="input"
                placeholder="Marka adı (örn: Maruderm)"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
              />
              <button
                className="button buttonSecondary"
                type="button"
                disabled={!newBrandName.trim() || busyKey === 'createBrand'}
                onClick={submitCreateBrand}
              >
                {busyKey === 'createBrand' ? 'Ekleniyor…' : 'Marka Ekle'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              className="button"
              onClick={submitNewProduct}
              disabled={isLoading || busyKey === 'createProduct' || !canSubmitNewProduct}
            >
              {busyKey === 'createProduct' ? 'Ekleniyor…' : 'Ürün Ekle'}
            </button>
          </div>
        </div>

        {error && <div className="muted" style={{ marginTop: 10 }}>{error}</div>}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="muted">{isLoading ? 'Yükleniyor…' : `${items.length} ürün`}</div>
      </div>

      <div className="grid">
        {items.map((p) => {
          const rows = [...(p.productPlatforms || [])].sort((a, b) => a.price - b.price);
          const draft = addListing[p.id] || { platformId: '', price: '', url: '' };
          const draftPrice = Number(draft.price);
          const canAddListing =
            draft.platformId !== '' &&
            Number.isFinite(draftPrice) &&
            draftPrice > 0 &&
            draft.url.trim().length > 0;

          return (
            <div key={p.id} className="card">
              <div className="cardHeader">
                <div>
                  <div style={{ fontWeight: 750, fontSize: 18 }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {p.productType?.name && <span className="pill">{p.productType.name}</span>}
                    <span className="pill">{rows.length} liste</span>
                  </div>
                </div>
                <button
                  className="button buttonDanger"
                  onClick={async () => {
                    setBusyKey(`deleteProduct:${p.id}`);
                    try {
                      await deleteProduct(p.id);
                      await load();
                    } finally {
                      setBusyKey('');
                    }
                  }}
                  disabled={busyKey === `deleteProduct:${p.id}`}
                >
                  {busyKey === `deleteProduct:${p.id}` ? 'Siliniyor…' : 'Sil'}
                </button>
              </div>

              {rows.length === 0 ? (
                <div className="muted" style={{ marginTop: 12 }}>
                  Bu ürün için henüz listeleme yok.
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Platform</th>
                        <th>Fiyat</th>
                        <th>URL</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((pp) => {
                        const edit = listingEdits[pp.id] || {
                          platformId: pp.platform?.id ?? '',
                          price: String(pp.price ?? ''),
                          url: pp.url ?? '',
                        };
                        const canSave =
                          Number(edit.price) > 0 &&
                          Number.isFinite(Number(edit.price)) &&
                          !!edit.url.trim() &&
                          edit.platformId !== '';

                        return (
                          <tr key={pp.id}>
                            <td>
                              <select
                                className="select"
                                value={edit.platformId}
                                onChange={(e) =>
                                  setListingEdits((prev) => ({
                                    ...prev,
                                    [pp.id]: {
                                      ...edit,
                                      platformId: e.target.value ? Number(e.target.value) : '',
                                    },
                                  }))
                                }
                              >
                                <option value="">Platform seç</option>
                                {platforms.map((pl) => (
                                  <option key={pl.id} value={pl.id}>
                                    {pl.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <input
                                className="input"
                                inputMode="decimal"
                                value={edit.price}
                                onChange={(e) =>
                                  setListingEdits((prev) => ({
                                    ...prev,
                                    [pp.id]: { ...edit, price: e.target.value },
                                  }))
                                }
                                placeholder={formatPriceTRY(pp.price)}
                              />
                            </td>
                            <td style={{ wordBreak: 'break-word' }}>
                              <div className="stack" style={{ gap: 8 }}>
                                <input
                                  className="input"
                                  value={edit.url}
                                  onChange={(e) =>
                                    setListingEdits((prev) => ({
                                      ...prev,
                                      [pp.id]: { ...edit, url: e.target.value },
                                    }))
                                  }
                                  placeholder={pp.url}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <a
                                    className="button buttonSecondary"
                                    href={edit.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      padding: '6px 10px',
                                      fontSize: 12,
                                      opacity: /^https?:\/\//.test(edit.url) ? 1 : 0.5,
                                      pointerEvents: /^https?:\/\//.test(edit.url) ? 'auto' : 'none',
                                    }}
                                  >
                                    Siteye Git
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button
                                  className="button buttonSecondary"
                                  disabled={!canSave || busyKey === `updatePP:${pp.id}`}
                                  onClick={() => updateExistingListing(pp)}
                                >
                                  {busyKey === `updatePP:${pp.id}` ? 'Kaydediliyor…' : 'Kaydet'}
                                </button>
                                <button
                                  className="button buttonDanger"
                                  disabled={busyKey === `deletePP:${pp.id}`}
                                  onClick={() => removeExistingListing(pp.id)}
                                >
                                  {busyKey === `deletePP:${pp.id}` ? 'Siliniyor…' : 'Sil'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="card" style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ fontWeight: 750, marginBottom: 8 }}>Bu ürüne yeni listeleme ekle</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  <select
                    className="select"
                    value={draft.platformId}
                    onChange={(e) =>
                      setAddListing((prev) => ({
                        ...prev,
                        [p.id]: { ...draft, platformId: e.target.value ? Number(e.target.value) : '' },
                      }))
                    }
                  >
                    <option value="">Platform seç</option>
                    {platforms.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    placeholder="Fiyat (₺)"
                    inputMode="decimal"
                    value={draft.price}
                    onChange={(e) =>
                      setAddListing((prev) => ({
                        ...prev,
                        [p.id]: { ...draft, price: e.target.value },
                      }))
                    }
                  />
                  <input
                    className="input"
                    placeholder="URL"
                    value={draft.url}
                    onChange={(e) =>
                      setAddListing((prev) => ({
                        ...prev,
                        [p.id]: { ...draft, url: e.target.value },
                      }))
                    }
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      className="button buttonSecondary"
                      disabled={!canAddListing || busyKey === `createPP:${p.id}`}
                      onClick={() => createListingForProduct(p.id)}
                    >
                      {busyKey === `createPP:${p.id}` ? 'Ekleniyor…' : 'Listeleme Ekle'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </>
  );
};

export default AdminPage;
