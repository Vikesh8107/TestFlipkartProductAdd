// pages/index.tsx

import { useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [url, setUrl] = useState('');
    const [product, setProduct] = useState<{ name: string; price: string; originalPrice: string; discount: string; image: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchProduct = async () => {
        setLoading(true);
        setError('');
        setProduct(null);

        try {
            const response = await axios.get('/api/scrape', {
                params: { url },
            });
            setProduct(response.data);
        } catch (error) {
            setError('Failed to fetch product data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Product Scraper</h1>
            <div className="mb-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter product URL"
                    className="p-2 border border-gray-300 rounded mr-2"
                />
                <button
                    onClick={handleFetchProduct}
                    className="p-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Fetch Product'}
                </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {product && (
                <div className="border p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                    <img src={product.image} alt={product.name} className="mb-2" />
                    <p className="text-lg">Original Price: ₹{product.originalPrice}</p>
                    <p className="text-lg">Price: ₹{product.price}</p>
                    <p className="text-lg">Discount: {product.discount}</p>
                </div>
            )}
        </div>
    );
};

export default Home;
