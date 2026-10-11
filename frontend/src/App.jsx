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
    const [recs, setRecs] = useState([]);
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState(null);
    const [error, setError] = useState(null);

    const loadRecs = async () => setRecs(await call(`/users/${USER}/recommendations`));

    useEffect(() => {
        (async () => {
            try {
                setProducts(await call("/products"));
                setSettings(await call(`/users/${USER}/settings`));
                await loadRecs();
            } catch {
                setError("Can't reach the API. Make sure the backend is running (`dotnet run` in /backend).");
            }
        })();
    }, []);

    const viewProduct = async (p) => {
        await call("/events", { method: "POST", body: JSON.stringify({ userId: USER, productId: p.id }) });
        loadRecs();
    };

    const updateSettings = async (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await call(`/users/${USER}/settings`, { method: "PUT", body: JSON.stringify(next) });
        loadRecs();
        setAnswers(null);
    };

    const toggleInterest = (c) => {
        const list = settings.interests.split(",").filter(Boolean);
        const next = list.includes(c) ? list.filter((x) => x !== c) : [...list, c];
        updateSettings({ interests: next.join(",") });
    };

    const ask = async () => {
        if (!question.trim()) return;
        setAnswers(await call(`/users/${USER}/assistant?q=${encodeURIComponent(question)}`));
    };

    if (error) return <p className="error">{error}</p>;
    if (!settings) return <p className="loading">Loading…</p>;

    const interests = settings.interests.split(",").filter(Boolean);

    return (
        <div className="page">
            <h1>Mini Store</h1>
            <main>
                <section>
                    <div className="panel">
                        <h2>Shopping assistant</h2>
                        <p className="muted">Tell us what you're looking for, like "camping trip" or "gadgets".</p>
                        <div className="row">
                            <input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && ask()}
                                placeholder="What are you shopping for?"
                            />
                            <button onClick={ask}>Ask</button>
                        </div>
                        {!settings.aiEnabled && <p className="muted">AI personalization is off, so the assistant is unavailable.</p>}
                        {settings.aiEnabled && answers && answers.length === 0 && <p className="muted">Nothing matched. Try different words.</p>}
                        {answers && answers.map((r) => (
                            <div key={r.product.id} className="rec">
                                <strong>{r.product.name}</strong> <span className="muted">${r.product.price}</span>
                                <p className="muted">{r.reason}</p>
                            </div>
                        ))}
                    </div>

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

                    <div className="panel">
                        <h2>Recommended for you</h2>
                        {!settings.aiEnabled && <p className="muted">AI personalization is off.</p>}
                        {settings.aiEnabled && recs.length === 0 && <p className="muted">Pick interests or click View on a few products.</p>}
                        {recs.map((r) => (
                            <div key={r.product.id} className="rec">
                                <strong>{r.product.name}</strong>
                                <p className="muted">{r.reason}</p>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
}