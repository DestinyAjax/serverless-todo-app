import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verify, decode } from 'jsonwebtoken'
import * as jwkToPem from 'jwk-to-pem'
import { createLogger } from '../../utils/logger'
import axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'
import { Jwt } from '../../auth/Jwt'
import 'source-map-support/register'

const logger = createLogger('auth')
const jwksUrl = 'https://dev-wp224yle.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const kid = jwt.header.kid;

  try {
    logger.info('Verify JWT using: ', jwksUrl)
    const response = await axios.get(jwksUrl)
    const key = response.data.keys.find(key => key.kid === kid)
    const pem = jwkToPem(key)
    const decoded = verify(token, pem)
    return decoded as JwtPayload
  } catch(error) {
    logger.info(`Unable to verify JWT using: ${error}`)
    throw new Error('Unable to verify token')
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header')

  const token = authHeader.split(' ')[1]
  return token
}
