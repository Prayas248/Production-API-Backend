import logger from '../config/logger.js';
import { signupSchema } from '../validations/auth.validation.js';
import { formatValidationError } from '../utils/format.js';
import { createUser } from '../services/auth.service.js';
import { jwttoken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';

export const signup = async (req, res, next) => {
    try{
        const validationResult = signupSchema.safeParse(req.body);
        if(!validationResult.success){
            return res.status(400).json({ error: 'Validation failed' ,
                 details: formatValidationError(validationResult.error)});
        }
        
        const { email, password, name, role } = validationResult.data;

        //Auth service call
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