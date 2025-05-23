
import {debounce, html, shadowView} from "@benev/slate"
import stylesCss from "./styles.css.js"

export const Copyable = shadowView(use => (payload: string, tooltipMax = 64) => {
	use.name("copyable")
	use.styles(stylesCss)

	const copyStatus = use.signal<"good" | "bad" | undefined>(undefined)

	const clearStatus = use.once(() => debounce(1000, () => {
		copyStatus.value = undefined
	}))

	function copy() {
		navigator.clipboard.writeText(payload)
			.then(() => { copyStatus.value = "good" })
			.catch(() => { copyStatus.value = "bad" })
			.finally(() => clearStatus())
	}

	const tooltip = tooltipMax < payload.length
		? payload.slice(0, tooltipMax) + "..."
		: payload

	return html`
		<span x-copy="${copyStatus}" title="${tooltip}">
			<slot @click="${copy}"></slot>
			<span x-notify=good>Copied</span>
			<span x-notify=bad>Copy Failed</span>
		</span>
	`
})

