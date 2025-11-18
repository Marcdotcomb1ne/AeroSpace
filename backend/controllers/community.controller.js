import supabase from '../db/supabaseClient.js';

export const sendMessage = async (req, res) => {
    const { user_id, email } = req.user;
    const { mensagem } = req.body;

    if (!mensagem || mensagem.trim() === '') {
        return res.status(400).json({ error: 'Mensagem não pode estar vazia.' });
    }

    try {
        // Buscar username do usuário
        const { data: userData } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
        const username = userData?.user?.user_metadata?.username || email.split('@')[0];

        const { data, error } = await supabase
            .from('community_messages')
            .insert([{
                user_id,
                username,
                mensagem
            }])
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('community_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data.reverse());
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
};

export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;

    try {
        const { error } = await supabase
            .from('community_messages')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ message: 'Mensagem deletada com sucesso' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao deletar mensagem.' });
    }
};