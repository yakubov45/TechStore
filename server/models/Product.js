import mongoose from 'mongoose';
import { translateText } from '../utils/autoTranslate.js';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0,
        default: null
    },
    monthlyDiscountPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    discountReason: {
        type: String,
        default: null
    },
    isDiscountActive: {
        type: Boolean,
        default: true
    },
    inFlashDeal: {
        type: Boolean,
        default: false
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: [true, 'Product brand is required']
    },
    images: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    tags: [String],
    seoTitle: String,
    seoDescription: String,
    translations: {
        uz: {
            name: String,
            description: String
        },
        ru: {
            name: String,
            description: String
        }
    }
}, {
    timestamps: true
});

// Temporary daily discount expiry (if set, discounted price should be reverted after expiry)
productSchema.add({
    dailyDiscountExpire: {
        type: Date,
        default: null
    }
});

// Auto-generate slug from name
productSchema.pre('validate', function (next) {
    if (this.isModified('name') && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    next();
});

// Auto-translate name and description on save
productSchema.pre('save', async function (next) {
    if (this.isModified('name') || this.isModified('description')) {
        try {
            if (this.name) {
                const nameTrans = await translateText(this.name, ['uz', 'ru']);
                if (nameTrans.uz) this.set('translations.uz.name', nameTrans.uz);
                if (nameTrans.ru) this.set('translations.ru.name', nameTrans.ru);
            }
            if (this.description) {
                const descTrans = await translateText(this.description, ['uz', 'ru']);
                if (descTrans.uz) this.set('translations.uz.description', descTrans.uz);
                if (descTrans.ru) this.set('translations.ru.description', descTrans.ru);
            }
        } catch (error) {
            console.error('Auto-translation failed for Product during save', error);
        }
    }
    next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.comparePrice && this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
