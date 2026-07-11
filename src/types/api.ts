export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface TaskAssignee {
  id: number
  name: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  assigned_to: number
  assignee: TaskAssignee | null
  due_date: string | null
}

export interface TaskPayload {
  title: string
  description?: string | null
  status: TaskStatus
  assigned_to: number
  due_date?: string | null
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface TaskListResponse {
  data: Task[]
  pagination: Pagination
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ValidationErrors {
  [field: string]: string[]
}

export class ApiError extends Error {
  status: number
  errors?: ValidationErrors

  constructor(message: string, status: number, errors?: ValidationErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}
