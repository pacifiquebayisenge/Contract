<template>
	<div class="contract-modal">
		<div class="avatar-container py-8">
			<div
				class="avatar"
				:style="{ backgroundColor: currentLightThemeColor }"
				:class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
			>
				<div class="avatar-stack">
					<!-- Back (angry) -->
					<div class="avatar-image back">
						<n-image
							width="60"
							:src="
								profile.firstname.charAt(0) === 'P'
									? '/memojis/jeje/eye-roll.png'
									: '/memojis/paci/eye-roll.png'
							"
						/>
					</div>

					<!-- Front (ashamed) -->
					<div class="avatar-image front">
						<n-image
							width="60"
							:src="
								profile.firstname.charAt(0) === 'P'
									? '/memojis/paci/lucky.png'
									: '/memojis/jeje/lucky.png'
							"
						/>
					</div>
				</div>
			</div>
		</div>
		<span style="text-align: center" class="font-color">
			Did
			<span class="special">{{ pseudo }}</span>
			use
			<span class="special">contract </span>
			again???
		</span>

		<button class="button-3D button-3D-colorfull-warning" @click="updatePartnerStreak()">
			Unbelievable !
		</button>
	</div>
</template>

<script setup>
import { useStreakStore } from '~/stores/streak'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

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
const userStore = useUserStore()
const streakStore = useStreakStore()

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const insideBadgeRing = computed(() => themeStore.isInsideBadgeRing)

const updatePartnerStreak = async () => {
	const partner = userStore.partnerProfile

	if (!partner) {
		console.warn('Partner profile not loaded yet')
		return
	}

	// if ((partner.streak ?? 0) < 3) {
	// } else {
	// 	console.log("BLOCKED: streak >= 3");
	// }
	emit('close')
	streakStore.updatePartnerStreak()
}
</script>

<style lang="scss" scoped>
.contract-modal {
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

			.avatar-stack {
				position: relative;
				width: 100%;
				height: 100%;
			}

			.avatar-image {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				transition:
					transform 0.3s ease,
					opacity 0.3s ease;
			}

			/* Back: angry one */
			.avatar-image.back {
				z-index: 1;
				transform: translate(-23%, -55%) rotate(10deg);
				opacity: 0.85;
			}

			/* Front: ashamed one */
			.avatar-image.front {
				z-index: 2;
				transform: translate(-71%, -25%) rotate(5deg) scale(0.9);
				opacity: 1;
			}

			/* Optional hover: slight interaction */
			&:hover .avatar-image.back {
				transform: translate(-35%, -75%) rotate(14deg) scale(1.05);
			}
			&:hover .avatar-image.front {
				transform: translate(-60%, -20%) rotate(8deg) scale(0.88);
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
}
</style>
