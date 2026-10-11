import { useEffect, useState } from "react";

const API = "http://localhost:5080/api";
const USER = 1;
const CATEGORIES = ["Outdoors", "Tech", "Home"];

const call = async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
};

export default function App() {
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setProducts(await call("/products"));
                setSettings(await call(`/users/${USER}/settings`));
            } catch {
                setError("Can't reach the API. Make sure the backend is running (`dotnet run` in /backend).");
            }
        })();
    }, []);

    const viewProduct = async (p) => {
        await call("/events", { method: "POST", body: JSON.stringify({ userId: USER, productId: p.id }) });
    };

    const updateSettings = async (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await call(`/users/${USER}/settings`, { method: "PUT", body: JSON.stringify(next) });
    };

    const toggleInterest = (c) => {
        const list = settings.interests.split(",").filter(Boolean);
        const next = list.includes(c) ? list.filter((x) => x !== c) : [...list, c];
        updateSettings({ interests: next.join(",") });
    };

    if (error) return <p className="error">{error}</p>;
    if (!settings) return <p className="loading">Loading…</p>;

    const interests = settings.interests.split(",").filter(Boolean);

    return (
        <div className="page">
            <h1>Mini Store</h1>
            <main>
                <section>
                    <h2>Products</h2>
                    <div className="grid">
                        {products.map((p) => (
                            <article key={p.id} className="product">
                                <h3>{p.name}</h3>
                                <p className="muted">{p.category} · ${p.price}</p>
                                <div className="row">
                                    <button onClick={() => viewProduct(p)}>View</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <aside>
                    <div className="panel">
                        <h2>Your AI controls</h2>
                        <label>
                            <input type="checkbox" checked={settings.aiEnabled} onChange={(e) => updateSettings({ aiEnabled: e.target.checked })} />
                            {" "}Use AI personalization
                        </label>
                        <p className="muted">Interests we use (edit anytime):</p>
                        <div className="row">
                            {CATEGORIES.map((c) => (
                                <button key={c} className={interests.includes(c) ? "chip on" : "chip"} onClick={() => toggleInterest(c)}>{c}</button>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}