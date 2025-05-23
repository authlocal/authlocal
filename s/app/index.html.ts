
import "@benev/slate/x/node.js"
import {template, html, easypage, headScripts, git_commit_hash, read_file, unsanitized} from "@benev/turtle"

export default template(async basic => {
	const path = basic.path(import.meta.url)
	const hash = await git_commit_hash()

	return easypage({
		path,
		dark: true,
		title: "Authlocal App Demo",
		head: html`
			<link rel="icon" href="/assets/favicon.png"/>
			<style>${unsanitized(await read_file("x/app/demo.css"))}</style>
			<style>${unsanitized(await read_file("x/themes/basic.css"))}</style>
			<meta data-commit-hash="${hash}"/>

			${headScripts({
				devModulePath: await path.version.local("demo.bundle.js"),
				prodModulePath: await path.version.local("demo.bundle.min.js"),
				importmapContent: await read_file("x/importmap.json"),
			})}
		`,
		body: html`
			<h1>Example app using Authlocal</h1>
			<p>This page is a test for a typical federated auth integration with <a href="/">Authlocal</a></p>
			<auth-button src="/"></auth-button>
			<auth-user></auth-user>
		`,
	})
})

