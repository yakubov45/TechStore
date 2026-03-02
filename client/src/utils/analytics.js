import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const trackingId = import.meta.env.VITE_GA_TRACKING_ID;
let isInitialized = false;

export const initAnalytics = () => {
    if (trackingId && !isInitialized) {
        ReactGA.initialize(trackingId);
        isInitialized = true;
    }
};

export const sendPageView = (path) => {
    if (isInitialized) {
        ReactGA.send({ hitType: 'pageview', page: path });
    }
};

export const sendEvent = ({ category, action, label }) => {
    if (isInitialized) {
        ReactGA.event({
            category,
            action,
            label
        });
    }
};

// Hook to track page views on route change
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        if (!isInitialized) {
            initAnalytics();
        }
        sendPageView(location.pathname + location.search);
    }, [location]);
};
