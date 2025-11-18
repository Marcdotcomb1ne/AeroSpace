import supabase from '../db/supabaseClient.js';

export const updateProfile = async (req, res) => {
    const { user_id } = req.user;
    const { wallpaper_url, avatar_url, mood, mood_text } = req.body;

    try {
        const updates = {};
        if (wallpaper_url !== undefined) updates.wallpaper_url = wallpaper_url;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;
        if (mood !== undefined) updates.mood = mood;
        if (mood_text !== undefined) updates.mood_text = mood_text;

        const { data, error } = await supabase
            .from('profiles')
            .upsert({ 
                user_id, 
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
};

export const getProfile = async (req, res) => {
    const { user_id } = req.user;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user_id) // usa 'id' em vez de 'user_id'
            .single();

        if (error && error.code !== 'PGRST116') {
            return res.status(400).json({ error: error.message });
        }

        if (!data) {
            return res.status(200).json({
                id: user_id,
                wallpaper_url: '/assets/imgs/wallpaper.jpg',
                avatar_url: '/assets/imgs/profile.png',
                mood: 'chill',
                mood_text: 'Vibe tranquila'
            });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
};

export const addCuratedItem = async (req, res) => {
    const { user_id } = req.user;
    const { tipo, titulo, url, descricao, imagem_url } = req.body;

    try {
        const { data, error } = await supabase
            .from('curated_items')
            .insert([{
                user_id,
                tipo, // 'link', 'foto', 'filme'
                titulo,
                url,
                descricao,
                imagem_url
            }])
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json(data[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao adicionar item.' });
    }
};

export const getCuratedItems = async (req, res) => {
    const { user_id } = req.user;
    const { tipo } = req.query;

    try {
        let query = supabase
            .from('curated_items')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (tipo) {
            query = query.eq('tipo', tipo);
        }

        const { data, error } = await query;

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar itens.' });
    }
};

export const deleteCuratedItem = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;

    try {
        const { error } = await supabase
            .from('curated_items')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ message: 'Item deletado com sucesso' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao deletar item.' });
    }
};