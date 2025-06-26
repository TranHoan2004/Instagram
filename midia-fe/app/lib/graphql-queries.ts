import { gql } from '@apollo/client/index.js'

export const ME = gql`
  query me {
    me {
      id
      userName
      email
      role
    }
  }
`
