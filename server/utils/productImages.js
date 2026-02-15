/**
 * Product Image Helper
 * Generates placeholder images for products
 */

const productImageUrls = {
    // Graphics Cards
    gpu_rtx_4090: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    gpu_rtx_4080: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    gpu_rtx_4070: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    gpu_amd: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',

    // Processors
    cpu_intel: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80',
    cpu_amd: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80',

    // RAM
    ram_ddr5: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80',
    ram_ddr4: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80',

    // Storage
    ssd_nvme: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    ssd_sata: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    hdd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',

    // Motherboards
    motherboard_intel: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80',
    motherboard_amd: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80',

    // Cooling
    cooling_aio: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
    cooling_air: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',

    // Monitors
    monitor_gaming: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    monitor_4k: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',

    // Peripherals
    keyboard_mechanical: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    mouse_gaming: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80',
    headset_gaming: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',

    // Power Supplies
    psu: 'https://images.unsplash.com/photo-1591238371730-8d3e6543c5ef?w=800&q=80',

    // Laptops
    laptop_gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    laptop_pro: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',

    // Gaming PCs
    gaming_pc: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',

    // Accessories
    case_pc: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800&q=80'
};

// Function to get images based on product category and type
export function getProductImages(category, brand, sku) {
    const images = [];

    // Determine which image set to use
    if (category === 'Graphics Cards') {
        if (sku.includes('4090')) images.push(productImageUrls.gpu_rtx_4090);
        else if (sku.includes('4080')) images.push(productImageUrls.gpu_rtx_4080);
        else if (sku.includes('4070') || sku.includes('4060')) images.push(productImageUrls.gpu_rtx_4070);
        else if (brand === 'AMD') images.push(productImageUrls.gpu_amd);
        else images.push(productImageUrls.gpu_rtx_4070);
    }
    else if (category === 'Processors') {
        if (brand === 'Intel') images.push(productImageUrls.cpu_intel);
        else images.push(productImageUrls.cpu_amd);
    }
    else if (category === 'RAM') {
        if (sku.includes('DDR5')) images.push(productImageUrls.ram_ddr5);
        else images.push(productImageUrls.ram_ddr4);
    }
    else if (category === 'Storage') {
        if (sku.includes('NVMe') || sku.includes('SSD')) images.push(productImageUrls.ssd_nvme);
        else if (sku.includes('SATA')) images.push(productImageUrls.ssd_sata);
        else images.push(productImageUrls.hdd);
    }
    else if (category === 'Motherboards') {
        if (sku.includes('LGA') || brand === 'Intel') images.push(productImageUrls.motherboard_intel);
        else images.push(productImageUrls.motherboard_amd);
    }
    else if (category === 'Cooling') {
        if (sku.includes('AIO') || sku.includes('H150') || sku.includes('H100')) images.push(productImageUrls.cooling_aio);
        else images.push(productImageUrls.cooling_air);
    }
    else if (category === 'Monitors') {
        if (sku.includes('4K')) images.push(productImageUrls.monitor_4k);
        else images.push(productImageUrls.monitor_gaming);
    }
    else if (category === 'Keyboards') {
        images.push(productImageUrls.keyboard_mechanical);
    }
    else if (category === 'Mice') {
        images.push(productImageUrls.mouse_gaming);
    }
    else if (category === 'Headsets') {
        images.push(productImageUrls.headset_gaming);
    }
    else if (category === 'Power Supplies') {
        images.push(productImageUrls.psu);
    }
    else if (category === 'Laptops') {
        images.push(productImageUrls.laptop_gaming);
    }
    else if (category === 'Gaming PCs') {
        images.push(productImageUrls.gaming_pc);
    }
    else if (category === 'Accessories') {
        images.push(productImageUrls.case_pc);
    }
    else {
        // Default tech image
        images.push('https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80');
    }

    return images;
}

export default productImageUrls;
