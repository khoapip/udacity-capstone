import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

const logger = createLogger('todos')

export async function createTodo(userId: string,createTodoRequest: CreateTodoRequest,): Promise<TodoItem> {
  logger.info('create todo for user', userId)
  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    ...createTodoRequest
  } as TodoItem)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Trigger Get Todo For User with ID: ', userId)
  const items = await todoAccess.getAllTodos(userId)

  for (let item of items) {
    if (!!item['attachmentUrl'])
      item['attachmentUrl'] = attachmentUtils.getDownloadUrl(item['attachmentUrl'])
  }

  return items
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  logger.info('DELETE TODO WITH TODOID:', todoId)
  await attachmentUtils.deleteAttachment(todoId)
  await todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
  logger.info('UPDATE TODO WITH TODOID:', todoId)
  const isValid = await todoAccess.getTodo(userId, todoId)

  if (!isValid) {
    throw new Error('404')
  }

  return await todoAccess.updateTodo(userId, todoId, updatedTodo)
}


export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  logger.info('create attachment url of todoId', todoId)
  const isValid = await todoAccess.getTodo(userId, todoId)

  if (!isValid) {
    throw new Error('404')
  }

  const url = attachmentUtils.getUploadUrl(todoId)
  await todoAccess.updateAttachment(userId, todoId)
  return url
}
