<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Task, TaskPayload, TaskStatus, User } from '@/types/api'

const props = defineProps<{
  modelValue: boolean
  task: Task | null
  users: User[]
  currentUser: User
  saving?: boolean
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: TaskPayload]
}>()

const statusOptions: Array<{ title: string; value: TaskStatus }> = [
  { title: 'Todo', value: 'todo' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Done', value: 'done' },
]

const form = reactive<TaskPayload>({
  title: '',
  description: '',
  status: 'todo',
  assigned_to: props.currentUser.id,
  due_date: null,
})

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const title = computed(() => props.task ? 'Edit task' : 'Create task')
const assigneeItems = computed(() => props.users.map(user => ({
  title: `${user.name} (${user.role})`,
  value: user.id,
})))

watch(
  () => [props.modelValue, props.task, props.currentUser.id] as const,
  () => {
    if (!props.modelValue) return

    form.title = props.task?.title ?? ''
    form.description = props.task?.description ?? ''
    form.status = props.task?.status ?? 'todo'
    form.assigned_to = props.task?.assigned_to ?? props.currentUser.id
    form.due_date = props.task?.due_date ?? null
  },
  { immediate: true },
)

function firstError(field: string) {
  return props.errors?.[field]?.[0]
}

function submit() {
  emit('submit', {
    title: form.title.trim(),
    description: form.description?.trim() || null,
    status: form.status,
    assigned_to: Number(form.assigned_to),
    due_date: form.due_date || null,
  })
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="640">
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                :error-messages="firstError('title')"
                label="Title"
                required
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                :error-messages="firstError('description')"
                auto-grow
                label="Description"
                rows="3"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.status"
                :error-messages="firstError('status')"
                :items="statusOptions"
                label="Status"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.assigned_to"
                :disabled="currentUser.role !== 'admin'"
                :error-messages="firstError('assigned_to')"
                :items="assigneeItems"
                label="Assignee"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.due_date"
                :error-messages="firstError('due_date')"
                label="Due date"
                type="date"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">
          Cancel
        </v-btn>
        <v-btn
          :loading="saving"
          color="primary"
          variant="flat"
          @click="submit"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
