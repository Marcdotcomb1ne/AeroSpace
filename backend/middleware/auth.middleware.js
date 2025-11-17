import supabase from '../db/supabaseClient.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token ausente ou inválido.' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
    }

    req.user = { user_id: user.id, email: user.email };
    
    next();
};