import { Router } from 'express';
import { getAllProducts, getProductById } from '../controllers/products';

const router = Router();

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product
router.get('/:id', getProductById);

export default router;