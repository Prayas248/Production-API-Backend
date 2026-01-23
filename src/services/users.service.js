import logger from '../config/logger.js';
import { pool } from '../config/database.js';

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  try {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return rows[0];
  } catch (e) {
    logger.error(`Error getting user by id ${id}`, e);
    throw e;
  }
};

/**
 * Update user
 */
export const updateUser = async (id, updates) => {
  try {
    // Check user exists
    const existingUser = await getUserById(id);

    // If email is being changed, ensure uniqueness
    if (updates.email && updates.email !== existingUser.email) {
      const checkEmailQuery = `
        SELECT 1 FROM users WHERE email = $1 LIMIT 1
      `;
      const { rowCount } = await pool.query(checkEmailQuery, [updates.email]);

      if (rowCount > 0) {
        throw new Error('Email already exists');
      }
    }

    const query = `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const values = [
      updates.name,
      updates.email,
      updates.role,
      id
    ];

    const { rows } = await pool.query(query, values);

    logger.info(`User ${rows[0].email} updated successfully`);
    return rows[0];
  } catch (e) {
    logger.error(`Error updating user ${id}`, e);
    throw e;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
  try {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, name, email, role
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`User ${rows[0].email} deleted successfully`);
    return rows[0];
  } catch (e) {
    logger.error(`Error deleting user ${id}`, e);
    throw e;
  }
};
