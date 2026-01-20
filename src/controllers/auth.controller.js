import logger from '../config/logger.js';
import { signupSchema, signinSchema } from '../validations/auth.validation.js';
import { formatValidationError } from '../utils/format.js';
import { createUser, authenticateUser } from '../services/auth.service.js';
import { jwttoken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';
import { createUsersTable } from '../models/user.model.js';


// Create Table

export const createTable = async (req, res) => {
  try {
    await createUsersTable();
    return res.status(200).json({ message: "Users table created successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create table", details: err.message });
  }
};


// Signup controller
export const signup = async (req, res, next) => {
    try{
        const validationResult = signupSchema.safeParse(req.body);
        if(!validationResult.success){
            return res.status(400).json({ error: 'Validation failed' ,
                 details: formatValidationError(validationResult.error)});
        }
        
        const { email, password, name, role } = validationResult.data;

        // Auth service call
        const newUser = await createUser(name, email, password, role);
        const token = jwttoken.sign({ id: newUser.id, email: newUser.email, role: newUser.role });
        cookies.set(res,'token',token);


        logger.info('User signed up successfully', { email });
        return  res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
        });

    }
    catch(e){
        logger.error('Error during user signup', e);
        
        if(e.message === 'User with this email already exists'){
            return res.status(409).json({ error: 'Email already exists' });
        }
        next(e);
    }   
    
}



// Signin controller
export const signin = async (req, res, next) => {
    try{
        const validationResult = signinSchema.safeParse(req.body);
        if(!validationResult.success){
            return res.status(400).json({ error: 'Validation failed' ,
                 details: formatValidationError(validationResult.error)});
        }

        const { email, password } = validationResult.data;
        const user = await authenticateUser(email, password);

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res,'token',token);


        logger.info('User signed in successfully', { email });
        return  res.status(200).json({
            message: 'User signed in successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    }
    catch(e){
        logger.error('Error during user signin', e);
        next(e);
    }
}



// Signout controller
export const signout = async (req, res, next) => {
    try{
        cookies.clear(res,'token');

        logger.info('User signed out successfully');
        return res.status(200).json({ message: 'User signed out successfully' });
    }
    catch(e){
        logger.error('Error during user signout', e);
        next(e);
    }
}