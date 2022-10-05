import * as uuid from 'uuid'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('TodosAccess')
const clientDoc = new DocumentClient()
const todosTable = process.env.TODOS_TABLE
const userIdIndex = process.env.TODOS_CREATED_AT_INDEX
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const createTodo = async (payload, userId: string): Promise<TodoItem>  => {
    const todoId = uuid.v4();
    const createdAt = new Date().toISOString()
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    const newItem = {
        todoId,
        createdAt,
        userId,
        attachmentUrl,
        done: false,
        ...payload
    }
    logger.info('Creating new todo', newItem)
    await clientDoc.put({
        TableName: todosTable,
        Item: newItem
    }).promise()

    return newItem
}

export const getTodosForUser = async (userId: string): Promise<any> => {
    logger.info('Fetching todos for user ...')
    const result = await clientDoc.query({
        TableName: todosTable,
        IndexName: userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()
    return result
}

export const deleteTodo = async (todoId: string, userId: string): Promise<any> => {
    logger.info(`Deleting a todo with Id::${todoId}`)
    return await clientDoc.delete({
        TableName: todosTable,
        Key: {
            todoId: todoId,
            userId: userId
        }
    }).promise()
}

export const updateTodo = async (payload: TodoUpdate, todoId: string, userId: string): Promise<any> => {
    logger.info('Updating a todo')
    const result = await clientDoc.update({
        TableName: todosTable,
        Key: {
            todoId,
            userId
        },
        ExpressionAttributeNames: {
            '#todo_text': 'name',
          },
        UpdateExpression: 'set #todo_text = :n, done = :d, dueDate = :da',
        ExpressionAttributeValues: {
            ':n': payload.name,
            ':d': payload.done,
            ':da': payload.dueDate
        },
        ReturnValues: 'ALL_NEW',
    }).promise()
    return result
}

export const todoExists = async (todoId: string): Promise<Boolean> => {
    logger.info(`Checking for a todo with Id::${todoId}`)
    const result = await clientDoc.get({
        TableName: todosTable,
        Key: {
            todoId
        }
    }).promise()

    return !!result
}