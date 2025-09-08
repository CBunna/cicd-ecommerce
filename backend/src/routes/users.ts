import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { Request, Response } from 'express';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// Get user profile (any authenticated user)
const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      message: 'Profile accessed successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin only endpoint
const getAdminData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      message: 'Admin data accessed successfully',
      data: {
        totalUsers: 10,
        totalOrders: 25,
        revenue: 15000,
        adminUser: req.user
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile (authenticated users only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', authenticate, getUserProfile);

/**
 * @swagger
 * /api/users/admin:
 *   get:
 *     summary: Get admin data (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admin', authenticate, authorize('admin'), getAdminData);

export default router;