
export type KeypairJson = {
	privateKey: string
} & PubkeyJson

export type PubkeyJson = {
	thumbprint: string
	publicKey: string
}

export type IdentityJson = {
	keypair: KeypairJson
	name: string
	created: number
}

export type IdentitiesJson = {
	format: string
	version: number
	identities: IdentityJson[]
}

export type Signed = {
	data: string
	signature: string
}

