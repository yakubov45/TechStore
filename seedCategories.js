import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './server/models/Category.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const categories = [
    {
        name: 'Keyboards',
        icon: '⌨️',
        translations: {
            uz: { name: 'Klaviaturalar', description: 'Mexanik va oddiy klaviaturalar' },
            ru: { name: 'Клавиатуры', description: 'Механические и обычные клавиатуры' }
        }
    },
    {
        name: 'Armchairs',
        icon: '🪑',
        translations: {
            uz: { name: 'Kreslolar', description: 'Geymerlar va ofis uchun kreslolar' },
            ru: { name: 'Кресла', description: 'Геймерские и офисные кресла' }
        }
    },
    {
        name: 'Headsets',
        icon: '🎧',
        translations: {
            uz: { name: 'Quloqchinlar', description: 'Simsiz va simli quloqchinlar' },
            ru: { name: 'Наушники', description: 'Беспроводные и проводные наушники' }
        }
    },
    {
        name: 'Mice',
        icon: '🖱️',
        translations: {
            uz: { name: 'Sichqonchalar', description: 'O`yin va ish uchun sichqonchalar' },
            ru: { name: 'Мыши', description: 'Игровые и рабочие мыши' }
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        for (const cat of categories) {
            try {
                // remove if exist to avoid unique error, or just catch it
                await Category.create(cat);
                console.log(`Created ${cat.name}`);
            } catch (e) {
                console.log(`Failed or already exists: ${cat.name} - ${e.message}`);
            }
        }
    } catch (e) {
        console.error('DB Connection error:', e);
    } finally {
        await mongoose.disconnect();
    }
}
seed();
