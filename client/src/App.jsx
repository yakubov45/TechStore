import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { useCurrencyStore } from './store/currencyStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import CookieConsent from './components/common/CookieConsent';
import { usePageTracking } from './utils/analytics';

// Lazy load all pages for better mobile performance - reduces initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Category = lazy(() => import('./pages/Category'));
const Brand = lazy(() => import('./pages/Brand'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Payment = lazy(() => import('./pages/Payment'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Admin = lazy(() => import('./pages/Admin'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const DeliveryPanel = lazy(() => import('./pages/admin/DeliveryPanel'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Cart = lazy(() => import('./pages/Cart'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const VerifyOrder = lazy(() => import('./pages/VerifyOrder'));

// Lightweight loading component for Suspense
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
}

function App() {
    const fetchExchangeRate = useCurrencyStore(state => state.fetchExchangeRate);

    useEffect(() => {
        fetchExchangeRate();
    }, []);

    const navigate = useNavigate();

    // Initialize GA tracking for page views
    usePageTracking();

    useEffect(() => {
        const handler = () => {
            navigate('/signin');
        };

        window.addEventListener('techstore:logout', handler);
        return () => window.removeEventListener('techstore:logout', handler);
    }, [navigate]);

    return (
        <>
            <CookieConsent />
            <Layout>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:slug" element={<ProductDetails />} />
                        <Route path="/category/:slug" element={<Category />} />
                        <Route path="/brand/:slug" element={<Brand />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/forgot-password/:token" element={<ForgotPassword />} />
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

                        {/* Backwards-compatible route: some places/linkers use /checkout */}
                        <Route path="/checkout" element={<Navigate to="/payment" replace />} />

                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                        {/* Protected Admin & Staff Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin', 'assistant']}>
                                <Admin />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/products/new" element={
                            <ProtectedRoute allowedRoles={['admin', 'assistant']}>
                                <AddProduct />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/products/edit/:id" element={
                            <ProtectedRoute allowedRoles={['admin', 'assistant']}>
                                <EditProduct />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/orders/:id" element={
                            <ProtectedRoute allowedRoles={['admin', 'assistant']}>
                                <AdminOrderDetail />
                            </ProtectedRoute>
                        } />

                        {/* Delivery Route */}
                        <Route path="/delivery" element={
                            <ProtectedRoute allowedRoles={['admin', 'delivery']}>
                                <DeliveryPanel />
                            </ProtectedRoute>
                        } />

                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/verify-order/:id" element={<VerifyOrder />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/verify-otp" element={<OTPVerification />} />
                    </Routes>
                </Suspense>
            </Layout>
        </>
    );
}

export default App;
