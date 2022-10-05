import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../helpers/todosAccess'
import { getUserId } from '../utils'
import { STATUS_CODES } from './../../utils/constants'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      await deleteTodo(todoId, userId)
      
      return {
        statusCode: STATUS_CODES.OK,
        body: JSON.stringify({})
      }
    } catch(error) {
      return {
        statusCode: STATUS_CODES.SERVER_ERROR,
        body: JSON.stringify({
          error
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
