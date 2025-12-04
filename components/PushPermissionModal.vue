<template>
	<n-modal v-model:show="visible" preset="dialog" title="Enable Notifications">
		<div class="mb-4">Allow notifications so you can receive updates instantly.</div>

		<template #action>
			<n-button @click="deny" type="default">No thanks</n-button>
			<n-button @click="accept" type="primary" :loading="loading"> Enable </n-button>
		</template>
	</n-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePushNotifications } from '~/composables/usePushNotifications'

const visible = ref(false)
const { permission, requestPermission, loadStoredPermission, loading } = usePushNotifications()

onMounted(() => {
	loadStoredPermission()

	if (permission.value === 'default') {
		visible.value = true
	}
})

const accept = async () => {
	await requestPermission()
	visible.value = false
}

const deny = () => {
	localStorage.setItem('push-permission', 'denied')
	visible.value = false
}
</script>
