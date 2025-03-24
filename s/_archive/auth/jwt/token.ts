
import {Base64url, hexId, Text} from "@benev/slate"
import {CryptoConstants} from "../crypto-constants.js"
import {TokenHeader, TokenPayload, TokenParams, TokenVerifyOptions, TokenVerifyError, WebToken} from "./types.js"

export class Token {
	static header: TokenHeader = Object.freeze({typ: "JWT", alg: "ES256"})
	static toJsTime = (t: number) => t * 1000
	static fromJsTime = (t: number) => t / 1000

	static params = (r: TokenParams) => ({
		jti: hexId(),
		iat: Date.now(),
		exp: Token.fromJsTime(r.expiresAt),
		nbf: r.notBefore,
		iss: r.issuer,
		aud: r.audience,
	})

	static async sign<P extends TokenPayload>(privateKey: CryptoKey, payload: P): Promise<string> {
		const headerBytes = Text.bytes(JSON.stringify(Token.header))
		const headerText = Base64url.string(headerBytes)

		const payloadBytes = Text.bytes(JSON.stringify(payload))
		const payloadText = Base64url.string(payloadBytes)

		const signingText = `${headerText}.${payloadText}`
		const signingBytes = new TextEncoder().encode(signingText)
		const signature = Base64url.string(
			new Uint8Array(
				await crypto.subtle.sign(
					CryptoConstants.algos.signing,
					privateKey,
					signingBytes,
				)
			)
		)
		return `${signingText}.${signature}`
	}

	static decode<P extends TokenPayload>(token: string): WebToken<P> {
		const [headerText, payloadText, signatureText] = token.split(".")
		if (!headerText || !payloadText || !signatureText)
			throw new Error("invalid jwt structure")

		const headerBytes = Base64url.bytes(headerText)
		const headerJson = Text.string(headerBytes)
		const header: TokenHeader = JSON.parse(headerJson)

		const payloadBytes = Base64url.bytes(payloadText)
		const payloadJson = Text.string(payloadBytes)
		const payload: P = JSON.parse(payloadJson)

		const signature = Base64url.bytes(signatureText).buffer
		return {header, payload, signature}
	}

	static async verify<P extends TokenPayload>(
			publicKey: CryptoKey,
			token: string,
			options: TokenVerifyOptions = {},
		): Promise<P> {

		const [headerText, payloadText] = token.split(".")
		const {payload, signature} = Token.decode<P>(token)
		const signingInput = `${headerText}.${payloadText}`
		const signingInputBytes = new TextEncoder().encode(signingInput)

		const isValid = await crypto.subtle.verify(
			CryptoConstants.algos.signing,
			publicKey,
			signature,
			signingInputBytes
		)

		if (!isValid)
			throw new TokenVerifyError("token signature invalid")

		if (payload.exp) {
			const expiresAt = Token.toJsTime(payload.exp)
			if (Date.now() > expiresAt)
				throw new TokenVerifyError("token expired")
		}

		if (payload.nbf) {
			const notBefore = Token.toJsTime(payload.nbf)
			if (Date.now() < notBefore)
				throw new TokenVerifyError("token not ready")
		}

		if (options.allowedIssuers) {
			if (!payload.iss)
				throw new TokenVerifyError(`required iss (issuer) is missing`)
			if (!options.allowedIssuers.includes(payload.iss))
				throw new TokenVerifyError(`invalid iss (issuer) "${payload.iss}"`)
		}

		if (options.allowedAudiences) {
			if (!payload.aud)
				throw new TokenVerifyError(`required aud (audience) is missing`)
			if (!options.allowedAudiences.includes(payload.aud))
				throw new TokenVerifyError(`invalid aud (audience) "${payload.aud}"`)
		}

		if (payload.aud && !options.allowedAudiences)
			throw new TokenVerifyError(`allowedAudiences verification option was not provided, but is required because the token included "aud"`)

		return payload
	}
}

