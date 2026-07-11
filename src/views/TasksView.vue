<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TaskForm from '@/components/TaskForm.vue'
import * as taskApi from '@/api/tasks'
import { ApiError } from '@/types/api'
import { useAuthStore } from '@/stores/auth'
import type { Pagination, Task, TaskPayload, TaskStatus, User, ValidationErrors } from '@/types/api'

const router = useRouter()
const auth = useAuthStore()

const tasks = ref<Task[]>([])
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formOpen = ref(false)
const selectedTask = ref<Task | null>(null)
const formErrors = ref<ValidationErrors>({})

const filters = reactive({
  status: '' as TaskStatus | '',
  assigned_to: '' as number | '',
  search: '',
  page: 1,
  per_page: 10,
})

const pagination = reactive<Pagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
})

const statusOptions = [
  { title: 'All statuses', value: '' },
  { title: 'Todo', value: 'todo' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Done', value: 'done' },
]

const currentUser = computed(() => auth.state.user)
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const pageCount = computed(() => Math.max(pagination.last_page, 1))
const assigneeFilterOptions = computed(() => [
  { title: 'All assignees', value: '' },
  ...users.value.map(user => ({
    title: `${user.name} (${user.role})`,
    value: user.id,
  })),
])

function statusColor(status: TaskStatus) {
  console.log(status)

  return {
    todo: 'grey',
    in_progress: 'blue',
    done: 'green',
  }[status]
}

function statusLabel(status: TaskStatus) {
  return {
    todo: 'Todo',
    in_progress: 'In progress',
    done: 'Done',
  }[status]
}

async function loadTasks() {
  loading.value = true
  error.value = ''

  try {
    const response = await taskApi.fetchTasks(filters)
    tasks.value = response.data
    Object.assign(pagination, response.pagination)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Unable to load tasks'
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  const response = await taskApi.fetchUsers()
  users.value = response.data
}

function openCreate() {
  selectedTask.value = null
  formErrors.value = {}
  formOpen.value = true
}

function openEdit(task: Task) {
  selectedTask.value = task
  formErrors.value = {}
  formOpen.value = true
}

async function saveTask(payload: TaskPayload) {
  saving.value = true
  formErrors.value = {}

  try {
    if (selectedTask.value) {
      await taskApi.updateTask(selectedTask.value.id, payload)
    } else {
      await taskApi.createTask(payload)
    }

    formOpen.value = false
    await loadTasks()
  } catch (err) {
    if (err instanceof ApiError && err.errors) {
      formErrors.value = err.errors
    } else {
      error.value = err instanceof ApiError ? err.message : 'Unable to save task'
    }
  } finally {
    saving.value = false
  }
}

async function removeTask(task: Task) {
  if (!window.confirm(`Delete "${task.title}"?`)) return

  try {
    await taskApi.deleteTask(task.id)
    await loadTasks()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Unable to delete task'
  }
}

async function logout() {
  await auth.logout()
  await router.push('/login')
}

function applyFilters() {
  filters.page = 1
  void loadTasks()
}

onMounted(async () => {
  await auth.loadUser()
  await Promise.all([loadUsers(), loadTasks()])
})
</script>

<template>
  <v-main>
    <v-app-bar color="white" elevation="1">
      <v-app-bar-title>Team Task Manager</v-app-bar-title>
      <v-btn
        class="mr-3"
        color="primary"
        prepend-icon="mdi-plus"
        variant="flat"
        @click="openCreate"
      >
        New task
      </v-btn>
      <v-spacer />
      <div v-if="currentUser" class="user-summary">
        <strong>{{ currentUser.name }}</strong>
        <span>{{ currentUser.role }}</span>
      </div>
      <v-btn icon="mdi-logout" variant="text" @click="logout" />
    </v-app-bar>

    <v-container class="py-6" fluid>
      <v-row class="align-center mb-3" dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.search"
            clearable
            density="comfortable"
            hide-details
            label="Search title"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @click:clear="applyFilters"
            @keyup.enter="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.status"
            density="comfortable"
            hide-details
            :items="statusOptions"
            label="Status"
            variant="outlined"
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col v-if="isAdmin" cols="12" sm="6" md="3">
          <v-select
            v-model="filters.assigned_to"
            density="comfortable"
            hide-details
            :items="assigneeFilterOptions"
            label="Assignee"
            variant="outlined"
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-btn block color="primary" variant="tonal" @click="applyFilters">
            Apply
          </v-btn>
        </v-col>
        <v-col class="text-md-right" cols="12" :md="isAdmin ? 12 : 3">
          <v-btn color="primary" prepend-icon="mdi-plus" variant="flat" @click="openCreate">
            New task
          </v-btn>
        </v-col>
      </v-row>

      <v-alert
        v-if="error"
        class="mb-4"
        type="error"
        variant="tonal"
      >
        {{ error }}
      </v-alert>

      <v-card>
        <v-table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Due date</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5">
                <v-progress-linear indeterminate color="primary" />
              </td>
            </tr>
            <tr v-else-if="!tasks.length">
              <td class="text-center py-8" colspan="5">
                No tasks found
              </td>
            </tr>
            <template v-else>
              <tr v-for="task in tasks" :key="task.id">
                <td>
                  <div class="font-weight-medium">{{ task.title }}</div>
                  <div v-if="task.description" class="text-medium-emphasis text-body-2">
                    {{ task.description }}
                  </div>
                </td>
                <td>{{ task.assignee?.name ?? '-' }}</td>
                <td>
                  <v-chip :color="statusColor(task.status)" size="small" variant="tonal">
                    {{ statusLabel(task.status) }}
                  </v-chip>
                </td>
                <td>{{ task.due_date ?? '-' }}</td>
                <td class="text-right">
                  <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEdit(task)" />
                  <v-btn color="error" icon="mdi-delete" size="small" variant="text" @click="removeTask(task)" />
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>

        <v-divider />

        <div class="pagination-bar">
          <span>{{ pagination.total }} tasks</span>
          <v-pagination
            v-model="filters.page"
            :length="pageCount"
            density="comfortable"
            total-visible="5"
            @update:model-value="loadTasks"
          />
        </div>
      </v-card>

      <TaskForm
        v-if="currentUser"
        v-model="formOpen"
        :current-user="currentUser"
        :errors="formErrors"
        :saving="saving"
        :task="selectedTask"
        :users="users"
        @submit="saveTask"
      />
    </v-container>
  </v-main>
</template>

<style scoped>
.user-summary {
  display: grid;
  font-size: 0.875rem;
  line-height: 1.2;
  margin-right: 12px;
  text-align: right;
}

.user-summary span {
  color: rgba(0, 0, 0, 0.6);
  text-transform: capitalize;
}

.pagination-bar {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 12px 16px;
}

@media (max-width: 700px) {
  .pagination-bar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
