import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../helpers/todosAccess'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { STATUS_CODES } from './../../utils/constants'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      const payload: UpdateTodoRequest = JSON.parse(event.body)
      const updatedTodo = await updateTodo(payload, todoId, userId)

      return {
        statusCode: STATUS_CODES.OK,
        body: JSON.stringify({
          item: updatedTodo.Attributes
        })
      }
    }
    catch(error) {
      return {
        statusCode: STATUS_CODES.SERVER_ERROR,
        body: JSON.stringify({
          error: error
        })
      }
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
