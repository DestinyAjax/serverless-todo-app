import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todosAccess'
import { STATUS_CODES } from './../../utils/constants'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const payload: CreateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event)
      const todoItem = await createTodo(payload, userId)

      return {
        statusCode: STATUS_CODES.CREATED,
        body: JSON.stringify({
          item: todoItem
        })
      }
    } catch(error) {
      return {
        statusCode: STATUS_CODES.SERVER_ERROR,
        body: JSON.stringify({
          error: error
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
  cors({
    credentials: true
  })
)
