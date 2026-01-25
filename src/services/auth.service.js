import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

// password hashing function
export const hashedPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error('Failed to hash password', e);
    throw new Error('Failed to hash password');
  }
};

// password comparison function
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) {
      throw new Error('Password and hash are required');
    }

    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (e) {
    logger.error('Failed to compare password', e);
    throw new Error('Failed to compare password');
  }
};

// user creation function
export const createUser = async (name, email, password, role = 'user') => {
  try {
    const checkUserQuery = `
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1
        `;

    const { rowCount } = await pool.query(checkUserQuery, [email]);

    if (rowCount > 0) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashedPassword(password);

    const insertUserQuery = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at, updated_at
        `;
    const values = [name, email, passwordHash, role];
    const result = await pool.query(insertUserQuery, values);

    logger.info('User created successfully', { email });
    return result.rows[0];
  } catch (e) {
    logger.error('Error creating user', e);
    throw new Error('Error creating user');
  }
};

// authenticate user function
export const authenticateUser = async (email, password) => {
  try {
    const checkUserQuery = `
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1
        `;
    const { rows } = await pool.query(checkUserQuery, [email]);

    // if no entry found
    if (rows.length === 0) {
      throw new Error('User does not exist');
    }

    // user is found
    logger.info('User found by email', { email });

    // check password matching
    const passwordHash = rows[0].password;
    const isPasswordValid = await comparePassword(password, passwordHash);

    // invalid password
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // valid user
    logger.info('Password matched for user', { email });
    return rows[0];
  } catch (e) {
    logger.error('Error finding user by email', e);
    throw new Error('Error finding user by email');
  }
};
