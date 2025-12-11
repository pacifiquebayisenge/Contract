const memojiNames = [
	'angry.png',
	'cloudy.png',
	'cringe.png',
	'dizzy.png',
	'eye-roll.png',
	'goofy.png',
	'happy.png',
	'heart-eyes.png',
	'idea.png',
	'irritated.png',
	'kiss.png',
	'love.png',
	'lucky.png',
	'mad.png',
	'mindblown.png',
	'party.png',
	'sad.png',
	'shook.png',
	'sleepy.png',
	'star-eyes.png',
	'tear-drop.png',
	'tears-laughing.png',
	'thinking.png',
	'whisper.png',
	'wink.png',
]

export function getRandomAvatarMood(fullname: string): string {
	const randomIndex = Math.floor(Math.random() * memojiNames.length)
	const mood = memojiNames[randomIndex]
	const avatar = fullname.charAt(0) === 'P' ? `/memojis/paci/${mood}` : `/memojis/jeje/${mood}`

	return avatar
}

export function getAvatarMood(fullname: string, mood: string): string {
	const avatar =
		fullname.charAt(0) === 'P' ? `/memojis/paci/${mood}.png` : `/memojis/jeje/${mood}.png`

	return avatar
}
