import mongoose from 'mongoose';
import { translateText } from '../utils/autoTranslate.js';

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: null
    },
    website: {
        type: String,
        trim: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    productCount: {
        type: Number,
        default: 0
    },
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

// Auto-generate slug from name
brandSchema.pre('validate', function (next) {
    if (this.isModified('name') && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

// Auto-translate name and description on save
brandSchema.pre('save', async function (next) {
    if (this.isModified('name') || this.isModified('description')) {
        try {
            if (this.name) {
                const nameTrans = await translateText(this.name, ['uz', 'ru']);
                if (nameTrans.uz) this.set('translations.uz.name', nameTrans.uz);
                if (nameTrans.ru) this.set('translations.ru.name', nameTrans.ru);
            }
            if (this.description && this.description.trim() !== '') {
                const descTrans = await translateText(this.description, ['uz', 'ru']);
                if (descTrans.uz) this.set('translations.uz.description', descTrans.uz);
                if (descTrans.ru) this.set('translations.ru.description', descTrans.ru);
            }
        } catch (error) {
            console.error('Auto-translation failed for Brand during save', error);
        }
    }
    next();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
