import supabase from '../db/supabaseClient.js';

//cadastro
export const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Preencha email, senha e nome de usuário.' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!data.session && data.user) {
            return res.status(200).json({ 
                message: 'Cadastro realizado! Verifique seu e-mail para confirmar a conta.',
                user: data.user
            });
        }

        return res.status(201).json({ 
            message: 'Usuário cadastrado com sucesso!', 
            session: data.session,
            user: data.user 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

//login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Informe email e senha.' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: 'Email ou senha incorretos.' });
        }

        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            session: data.session,
            user: data.user
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

//sair
export const logout = async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

//get user
export const getUser = async (req, res) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    
    return res.status(200).json({ user });
};