
import {ShadowElement, html, mixin} from "@benev/slate"

import {Auth} from "../../auth.js"
import stylesCss from "./styles.css.js"
import {renderThumbprint} from "../../../common/views/id/render-thumbprint.js"

@mixin.css(stylesCss)
@mixin.reactive()
export class AuthUser extends ShadowElement {
	auth = Auth.get()

	render() {
		const {auth} = this
		const {login} = auth

		return login ? html`
			<div part=box ?data-logged-in="${!!login}">
				<span class=name>${login.name}</span>
				<small>${renderThumbprint(login.thumbprint)}</small>
			</div>
		` : html``
	}
}

