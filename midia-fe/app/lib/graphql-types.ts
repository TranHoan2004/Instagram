export interface RegisterUserInput {
  input: {
    email: string
    password: string
    userName: string
    firstName: string
    lastName?: string
    dob: string
  }
}

export interface RegisterUserResp {
  register: {
    id: string
    message: string
  }
}
