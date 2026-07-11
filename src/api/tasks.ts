import { apiRequest } from './client'
import type { Task, TaskListResponse, TaskPayload, TaskStatus, User } from '@/types/api'

export interface TaskFilters {
  status?: TaskStatus | ''
  assigned_to?: number | ''
  search?: string
  page?: number
  per_page?: number
}

export function fetchTasks(filters: TaskFilters) {
  return apiRequest<TaskListResponse>('/api/tasks', {
    query: filters,
  })
}

export function fetchUsers() {
  return apiRequest<{ data: User[] }>('/api/users')
}

export function createTask(payload: TaskPayload) {
  return apiRequest<{ data: Task }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(id: number, payload: TaskPayload) {
  return apiRequest<{ data: Task }>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(id: number) {
  return apiRequest<null>(`/api/tasks/${id}`, {
    method: 'DELETE',
  })
}
