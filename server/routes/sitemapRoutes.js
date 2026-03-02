import express from 'express';
import { generateSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

router.get('/', generateSitemap);

export default router;
