import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS);


export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTabName = process.env.TODOS_TAB,
    private readonly idIndex = process.env.TODOS_ID_INDEX
  ) { }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todoTabName,
        Key: { userId, todoId }
      })
      .promise()

    return result.Item as TodoItem
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
	IndexName: this.idIndex,
        TableName: this.todoTabName,
        KeyConditionExpression: '#userId = :i',
        ExpressionAttributeNames: {'#userId': 'userId'},
        ExpressionAttributeValues: {':i': userId}
      })
      .promise()
    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todoTabName,
        Item: todo
      })
      .promise()
    return todo
  }

  async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTabName,
      Key: { userId, todoId },
      UpdateExpression: "set #name = :n, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues: {
        ":n": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
      },
      ExpressionAttributeNames: { '#name': 'name' }
    }).promise()
  }

  async updateAttachment(userId: string, todoId: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTabName,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl=:a",
      ExpressionAttributeValues: {":a": todoId}
    }).promise()
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todoTabName,
      Key: { userId, todoId }
    }).promise()
  }
}

