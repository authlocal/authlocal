
import {ShadowElement, attributes, html, mixin} from "@benev/slate"

import {Auth} from "../../auth.js"
import {auth} from "../../context.js"
import stylesCss from "./styles.css.js"
import themeCss from "../../../common/theme.css.js"

@mixin.css(themeCss, stylesCss)
@mixin.reactive()
export class AuthLogin extends ShadowElement {
	auth = auth

	#attrs = attributes(this, {src: String})

	get src() {
		return this.#attrs.src ?? Auth.url
	}

	set src(src: string) {
		this.#attrs.src = src
	}

	render() {
		const {auth} = this
		const {login} = auth
		const popup = () => auth.popup(this.#attrs.src)
		const logout = () => { auth.login = null }

		return html`
			<p>${login ? login.name : "logged out"}</p>

			${login
				? html`<button @click="${logout}">logout</button>`
				: html`<button @click="${popup}">login</button>`}
		`
	}
}

