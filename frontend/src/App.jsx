import { useEffect, useState } from "react";

const API = "http://localhost:5080/api";

export default function App() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(`${API}/products`).then((r) => r.json()).then(setProducts);
    }, []);

    return (
        <div className="page">
            <h1>Mini Store</h1>
            <div className="grid">
                {products.map((p) => (
                    <article key={p.id} className="product">
                        <h3>{p.name}</h3>
                        <p className="muted">{p.category} · ${p.price}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}