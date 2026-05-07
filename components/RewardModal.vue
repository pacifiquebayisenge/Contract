<template>
	<div class="reward-modal">
		<div class="avatar-container py-8">
			<div
				class="avatar"
				:style="{ backgroundColor: currentLightThemeColor }"
				:class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
			>
				<div class="avatar-stack">
					<div class="avatar-image">
						<n-image
							width="55"
							:src="
								profile.firstname.charAt(0) === 'P'
									? '/memojis/paci/wink.png'
									: '/memojis/jeje/wink.png'
							"
						/>
					</div>
				</div>
			</div>
		</div>
		<span style="text-align: center" class="font-color">
			Did
			<span class="special">{{ pseudo }}</span>
			earned a
			<span class="special">reward</span>
			???
		</span>

		<div class="field w-[100%] max-w-[85rem]">
			<textarea
				v-model="description"
				:placeholder="`Description of why ${profile.firstname} earned a reward ...`"
				class="h-[15rem] bg-[#0000000a] rounded-[1rem] w-[100%] max-w-[85rem] font-color"
			/>

			<div class="line" />
		</div>

		<div class="field">
			<input
				v-model="reward"
				type="number"
				placeholder="Amount of reward"
				class="bg-[#0000000a] rounded-[1rem] font-color"
			/>

			<div class="line" />
		</div>

		<button class="button-3D button-3D-colorfull-success" @click="partnerReward()">
			Amazing !
		</button>
	</div>
</template>

<script setup>
import { watch } from 'vue'
import { useCreditStore } from '~/stores/credit'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
	pseudo: {
		type: String,
		default: 'pseudo',
	},
	profile: {
		type: Object,
		default: () => ({}),
	},
})

const emit = defineEmits(['close'])

const themeStore = useThemeStore()
const creditStore = useCreditStore()

const description = ref('')
const reward = ref()
const valid = ref(false)

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const insideBadgeRing = computed(() => themeStore.isInsideBadgeRing)

watch(description, (newVal) => {
	valid.value = newVal.trim().length
})

// round to the nearest 100
const nearestHundred = (num) => {
	num = Math.max(100, Math.min(num, 1000)) // clamp tussen 100 en 1 000
	return Math.round(num / 100) * 100
}

const partnerReward = async () => {
	if (!description.value || !reward.value) return
	const partner = props.profile

	if (!partner) {
		console.warn('Partner profile not loaded yet')
		return
	}

	console.log(description.value, nearestHundred(reward.value))

	emit('close')
	creditStore.increasePartnerCredit(nearestHundred(reward.value), description.value)
}
</script>

<style lang="scss" scoped>
.reward-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3rem;

	.n-card-header .n-card-header__main {
		text-align: center !important;
	}

	.avatar-container {
		display: flex;
		justify-content: center;
		gap: 3rem;

		.avatar {
			width: 8rem;
			height: 8rem;
			background-color: v-bind(currentLightThemeColor);
			border-radius: 2rem;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			overflow: visible;

			&.outside-ring {
				outline: 2px solid rgba(0, 0, 0, 0.1);
				outline-offset: 3px;
			}

			&.inside-ring {
				outline: 2px solid rgba(0, 0, 0, 0.1);
				outline-offset: -5px;
			}
		}
	}

	span {
		font-size: 1.6rem;
		font-weight: 500;

		.special {
			color: v-bind(currentThemeColor);
			font-weight: 700;
		}
	}

	.button-3D {
		position: relative;
		padding: 0.75rem 1.5rem;

		font-weight: bolder;
		font-size: 1.4rem !important;

		width: 100%;
		background: #ffffff;
		border: 0.2rem solid #b9baba;
		border-radius: 0.8rem;
		transform: translateY(-0.4rem);
		transition: all 0.1s ease;
		box-shadow:
			0 0.4rem 0 #b9baba,
			0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

		&:hover {
			transform: translateY(-0.5rem);
			box-shadow:
				0 0.5rem 0 #b9baba,
				0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
		}

		&:active {
			transform: translateY(0);
			box-shadow:
				0 0 0 #b9baba,
				0 0 0 rgba(0, 0, 0, 0.1);
		}

		&,
		&:active,
		&:focus {
			.n-button__border,
			.n-button__state-border {
				border: none !important;
			}
		}

		&-colorfull {
			// Success state with lighter green
			&-success {
				background: #cceada;
				border-color: #aad3bb;
				color: #2c7a4d; // Darker text for contrast
				box-shadow:
					0 0.4rem 0 #aad3bb,
					0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

				&:hover {
					color: #fff;
					background-color: #36ad6a;
					box-shadow:
						0 0.5rem 0 #aad3bb,
						0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
				}

				&:active {
					color: #fff;
					background-color: #36ad6a;
					box-shadow:
						0 0 0 #aad3bb,
						0 0 0 rgba(0, 0, 0, 0.1);
				}

				&:focus {
					background: #cceada;
					color: #2c7a4d;
				}
			}

			&-warning {
				background: #ffe5cc; // light orange background
				border-color: #ffb366; // medium orange border
				color: #cc5200; // dark orange text for contrast
				box-shadow:
					0 0.4rem 0 #ffb366,
					0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

				&:hover {
					color: #fff;
					background-color: #ff8000; // strong orange
					box-shadow:
						0 0.5rem 0 #ffb366,
						0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
				}

				&:active {
					color: #fff;
					background-color: #e67300; // slightly darker pressed orange
					box-shadow:
						0 0 0 #ffb366,
						0 0 0 rgba(0, 0, 0, 0.1);
				}

				&:focus {
					background: #ffe5cc;
					color: #cc5200;
				}
			}

			// Error state
			&-error {
				background: #ffd6d6;
				border-color: #ffb3b3;
				color: #d03050;
				box-shadow:
					0 0.4rem 0 #ffb3b3,
					0 0.4rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 4px and 6px

				&:hover {
					color: #fff;
					background-color: #de576d;
					box-shadow:
						0 0.5rem 0 #ffb3b3,
						0 0.5rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 5px and 6px
				}

				&:active {
					color: #fff;
					background-color: #de576d;
					box-shadow:
						0 0 0 #ffb3b3,
						0 0 0 rgba(0, 0, 0, 0.1);
				}

				&:focus {
					background: #ffd6d6;
					color: #d03050;
				}
			}

			.n-ellipsis {
				line-height: 2rem;

				span {
					font-weight: bold;
				}
			}
		}
	}

	input,
	textarea {
		padding: 0.5rem 1.5rem;
		border-radius: 1rem;
		border: none;
		outline: none;
		font-size: 1.5rem;
		font-weight: 600;
		color: #555555;
		transition: padding 0.3s 0.2s ease;
		resize: none;
		// sibling magic ;o
		&:focus + .line {
			&:after {
				transform: scaleX(1);
			}
		}
	}

	.field {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		.line {
			width: 100%;
			height: 3px;
			position: absolute;
			bottom: -8px;
			background: white;

			&:after {
				content: ' ';
				position: absolute;
				float: right;
				width: 100%;
				height: 3px;

				transform: scalex(0);
				transition: transform 0.3s ease;

				background: v-bind(currentLightThemeColor);
			}
		}
	}
}
</style>
