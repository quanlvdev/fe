<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/types/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('admin@example.com')
const password = ref('password')
const error = ref('')

async function submit() {
  error.value = ''

  try {
    await auth.login(email.value, password.value)
    await router.push('/tasks')
  } catch (err) {
    error.value = err instanceof ApiError
      ? err.message
      : 'Unable to sign in'
  }
}
</script>

<template>
  <v-main class="login-page">
    <v-container class="fill-height" fluid>
      <v-row
          class="fill-height"
          align="center"
          justify="center"
      >
        <v-col
            cols="11"
            sm="8"
            md="5"
            lg="4"
        >
          <v-card
              class="pa-8 rounded-xl"
              elevation="8"
          >
            <div class="text-center mb-6">
              <v-avatar
                  size="70"
                  color="primary"
              >
                <v-icon size="38">
                  mdi-account
                </v-icon>
              </v-avatar>

              <h2 class="mt-4">Team Task Manager</h2>

              <div class="text-medium-emphasis">
                Sign in to continue
              </div>
            </div>

            <v-alert
                v-if="error"
                class="mb-4"
                type="error"
                variant="tonal"
            >
              {{ error }}
            </v-alert>

            <v-form @submit.prevent="submit">
              <v-text-field
                  v-model="email"
                  label="Email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="comfortable"
                  class="mb-2"
              />

              <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  type="password"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
              />

              <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="auth.state.loading"
              >
                Login
              </v-btn>
            </v-form>

            <v-divider class="my-6" />

            <div class="text-center text-medium-emphasis text-body-2">
              Demo account
              <br>
              <strong>admin@example.com / password</strong>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f7fb;
}

.v-card {
  border-radius: 20px;
}
</style>
