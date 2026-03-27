import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website', preloadImage }) => {
    const defaultTitle = 'TechStore - Your Ultimate Electronic Destination';
    const defaultDescription = 'Shop the latest electronics, smartphones, laptops, and accessories at TechStore. Best prices and fast delivery guaranteed.';
    const defaultKeywords = 'electronics, tech, smartphones, laptops, gadgets, techstore';

    // Fallback to default if nothing is provided
    const seoTitle = title ? `${title} | TechStore` : defaultTitle;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;
    const seoImage = image || '/logo.png'; // Assuming you have a logo.png in public folder

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={seoKeywords} />

            {/* Preload critical image for LCP */}
            {preloadImage && <link rel="preload" as="image" href={preloadImage} />}

            {/* Open Graph metadata */}
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:type" content={type} />
            {url && <meta property="og:url" content={url} />}
            <meta property="og:image" content={seoImage} />
            <meta property="og:site_name" content="TechStore" />

            {/* Twitter Card metadata */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <meta name="twitter:image" content={seoImage} />
        </Helmet>
    );
};

export default SEO;
