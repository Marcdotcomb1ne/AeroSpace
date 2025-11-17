import supabase from '../db/supabaseClient.js';

export const listarTasks = async (req, res) => {
    const { user_id } = req.user; 

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
};

export const criarTask = async (req, res) => {
    const { user_id } = req.user;
    const { titulo } = req.body;

    const { data, error } = await supabase
        .from('tasks')
        .insert([{ user_id, titulo, concluida: false }])
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
};

export const alternarStatus = async (req, res) => {
    const { id } = req.params;
    const { concluida } = req.body;

    const { error } = await supabase
        .from('tasks')
        .update({ concluida })
        .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Atualizado com sucesso' });
};