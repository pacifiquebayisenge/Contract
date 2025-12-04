<template>
	<n-tabs
		class="mx-8 px-12 flex justify-center themed-tabs"
		type="line"
		animated
		:value="activeTab"
		@update:value="handleTabChange"
	>
		<n-tab-pane
			v-for="(tab, index) in tabs"
			:key="index"
			class="text-gray-700"
			:name="tab.name"
			:tab="tab.name"
		/>
	</n-tabs>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabTransition } from '~/composables/useTabTransition'
import { useThemeStore } from '~/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const { tabs, updateDirection, setInitialTab } = useTabTransition()

const activeTab = ref(tabs[0].name)

const handleTabChange = async (tabName) => {
	const selectedTab = tabs.find((tab) => tab.name === tabName)
	if (selectedTab && selectedTab.path !== route.path) {
		// Update direction BEFORE navigation
		updateDirection(tabName)
		activeTab.value = tabName

		await navigateTo(selectedTab.path)
	}
}

// Watch route changes to update active tab
watch(
	() => route.path,
	(newPath) => {
		const currentTab = tabs.find((tab) => tab.path === newPath)
		if (currentTab && currentTab.name !== activeTab.value) {
			activeTab.value = currentTab.name
		}
	},
	{ immediate: true }
)

onMounted(() => {
	const currentTab = tabs.find((tab) => tab.path === route.path)
	if (currentTab) {
		activeTab.value = currentTab.name
		setInitialTab(currentTab.name)
	}
})

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)
</script>

<style lang="scss">
.n-tabs-tab__label {
	font-weight: 700;
}

.themed-tabs .n-tabs-nav-scroll-content .n-tabs-bar {
	border-color: v-bind(currentThemeColor) !important;
}

.themed-tabs .n-tabs-tab__label {
	color: rgb(49, 49, 49);
}

.themed-tabs .n-tabs-tab--active .n-tabs-tab__label {
	color: v-bind(currentThemeColor) !important;
}

.themed-tabs .n-tabs-tab:hover .n-tabs-tab__label {
	color: v-bind(currentThemeColor) !important;
	opacity: 0.8;
}

.themed-tabs {
	width: fit-content;
	--theme-color: v-bind(currentThemeColor);

	.n-tabs-pane-wrapper .n-tab-pane {
		padding-top: 0.6rem;
	}
}

.themed-tabs .n-tabs-bar::after {
	background-color: var(--theme-color) !important;
}

.themed-tabs .n-tabs-nav-scroll-content .n-tabs .n-tabs-bar {
	background-color: var(--theme-color) !important;
}
.themed-tabs .n-tabs-nav-scroll-content .n-tabs-wrapper {
	padding-left: 2rem;
	padding-right: 2rem;
}

.n-tabs .n-tabs-bar {
	background-color: var(--theme-color) !important;
}
</style>
