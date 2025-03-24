
import {LoginTokens} from "../auth/tokens/types.js"

export type AuthFile = {
	version: number
	tokens: LoginTokens | null
}

