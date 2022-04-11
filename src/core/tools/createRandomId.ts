export function createRandomId(): string{
	const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
	const out: string[] = []

	for(let i = 0; i < alphabet.length; i++){
		out.push(alphabet[Math.floor(Math.random() * alphabet.length)])
	};

	return out.join("");
}