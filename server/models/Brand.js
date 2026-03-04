import mongoose from 'mongoose';

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

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
