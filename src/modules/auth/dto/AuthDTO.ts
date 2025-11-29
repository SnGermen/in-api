export type RegisterDTO = {
  email: string
  username: string
  password: string
}

export type LoginDTO = {
  identifier: string
  password: string
}

export type UpdateMeDTO = {
  fullName?: string | null
  bio?: string | null
  isPrivate?: boolean
}

export type ChangePasswordDTO = {
  currentPassword: string
  newPassword: string
}