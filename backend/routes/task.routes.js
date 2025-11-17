import express from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; // Importante: Verifique o passo 2

const Taskrouter = express.Router();

// Protegemos as rotas para que só usuários logados acessem
Taskrouter.get('/', authMiddleware, taskController.listarTasks);
Taskrouter.post('/', authMiddleware, taskController.criarTask);
Taskrouter.put('/:id', authMiddleware, taskController.alternarStatus);

export default Taskrouter;