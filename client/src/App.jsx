import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useCurrencyStore } from './store/currencyStore';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Category from './pages/Category';
import Brand from './pages/Brand';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Admin from './pages/Admin';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import OrderSuccess from './pages/OrderSuccess';
import Cart from './pages/Cart';
import OTPVerification from './pages/OTPVerification';

function App() {
    const fetchExchangeRate = useCurrencyStore(state => state.fetchExchangeRate);

    useEffect(() => {
        fetchExchangeRate();
    }, []);

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/brand/:slug" element={<Brand />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected User Routes */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/payment" element={
                    <ProtectedRoute>
                        <Payment />
                    </ProtectedRoute>
                } />

                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                        <Admin />
                    </ProtectedRoute>
                } />
                <Route path="/admin/products/new" element={
                    <ProtectedRoute adminOnly={true}>
                        <AddProduct />
                    </ProtectedRoute>
                } />
                <Route path="/admin/products/edit/:id" element={
                    <ProtectedRoute adminOnly={true}>
                        <EditProduct />
                    </ProtectedRoute>
                } />

                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
            </Routes>
        </Layout>
    );
}

export default App;
