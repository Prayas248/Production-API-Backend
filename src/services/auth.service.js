import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

export const hashedPassword = async (password) => {
    try{
        return await bcrypt.hash(password,10);
    }
    catch(e){
        logger.error('Failed to hash password',e);
        throw new Error('Failed to hash password');
    }
}


export const createUser = async (name, email, password, role = 'user') => {
    try{
        const checkUserQuery = `
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1
        `;

        const { rowCount } = await pool.query(checkUserQuery, [email]);

        if (rowCount > 0) {
            throw new Error("User already exists");
        }

        const passwordHash =  await hashedPassword(password);

        const insertUserQuery = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
        `;
        const values = [name, email, passwordHash, role];
        const result =  await pool.query(insertUserQuery, values);

        logger.info('User created successfully', { email });
        return result.rows[0];


    }
    catch(e){
        logger.error('Error creating user', e);
        throw new Error('Error creating user');
    }
}