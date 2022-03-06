export const requiredString = (name: string) => ({
  required_error: `${name} is required`,
  invalid_type_error: `${name} must be a string`
})

export const requiredNumber = (name: string) => ({
  required_error: `${name} is required`,
  invalid_type_error: `${name} must be a number`
})

export const minMsg = (name: string) => ({ message: `${name} too short` })
export const maxMsg = (name: string) => ({ message: `${name} too long` })
