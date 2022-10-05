import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser } from '../../helpers/todosAccess'
import { getUserId } from '../utils';
import { STATUS_CODES } from './../../utils/constants'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const userId = getUserId(event)

      if (!userId) {
        return {
          statusCode: STATUS_CODES.UNAUTHORIZED,
          body: JSON.stringify({
            error: 'User is not authenticated'
          })
        }
      }

      const items = await getTodosForUser(userId)
      if (items.Count < 1) {
        return {
          statusCode: STATUS_CODES.OK,
          body: JSON.stringify({
            items: []
          })
        }
      }

      return {
        statusCode: STATUS_CODES.OK,
        body: JSON.stringify({
          items: items.Items
        })
      }
    } catch(error) {
      return {
        statusCode: STATUS_CODES.SERVER_ERROR,
        body: JSON.stringify({
          error
        })
      }
    }
})

handler.use(
  cors({
    credentials: true
  })
)
