import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { registerSchema, loginSchema } from '../utils/validation';
import { generateToken } from '../utils/jwt';
import { CreateUserRequest, LoginRequest, AuthResponse } from '../types/user';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const { email, password, firstName, lastName }: CreateUserRequest = value;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [email.toLowerCase(), hashedPassword, firstName, lastName, 'customer']
    );

    const user = newUser.rows[0];

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Prepare response (exclude password)
    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    };

    res.status(201).json({
      message: 'User registered successfully',
      ...authResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error during registration'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const { email, password }: LoginRequest = value;

    // Find user by email
    const userResult = await pool.query(
      `SELECT id, email, password, first_name, last_name, role, is_active, created_at, updated_at
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        message: 'Invalid email or password'
      });
      return;
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      res.status(401).json({
        message: 'Account is deactivated'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Prepare response (exclude password)
    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    };

    res.status(200).json({
      message: 'Login successful',
      ...authResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error during login'
    });
  }
};