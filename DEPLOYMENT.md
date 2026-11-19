# Deployment runbook

This repository is configured to publish the Vite build with the official GitHub Pages Actions workflow. The site is not live until the repository exists, Pages is enabled for Actions, and the first deployment has been checked at the public URL.

Authentication, repository creation, and `git push` are manual actions. The automation can deploy only after the repository has been created and the workflow is present on the default branch.

## 1. Preflight the build

Use a supported Node.js release and the committed lockfile:

```sh
node --version
npm ci
VITE_BASE_PATH=/Neiyako/ npm run build
```

Expected result: `dist/` is generated, but it remains ignored by Git. The project is configured for the repository Pages path `/Neiyako/`; it does not rely on committing build output.

Confirm that the generated HTML uses the repository asset base:

```sh
grep -Eo '(src|href)="[^"]+"' dist/index.html
git status --short
```

Asset URLs should begin with `/Neiyako/` when the production base is enabled. `dist/` must not appear as a change to commit.

## 2. Create and push `Neiyako/Neiyako`

Authenticate GitHub CLI or Git using your own credentials. Do not put a personal access token in a file or workflow.

```sh
gh auth status
```

If the repository does not yet exist, create it and push the current branch:

```sh
gh repo create Neiyako/Neiyako --public --source=. --remote=origin --push
```

If the repository already exists, attach the existing checkout and push instead:

```sh
git remote add origin https://github.com/Neiyako/Neiyako.git
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin https://github.com/Neiyako/Neiyako.git` rather than adding a duplicate remote. Repository creation and the first push require manual GitHub authentication.

## 3. Enable GitHub Pages through Actions

After the workflow is on the default branch:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. If the UI offers a starter workflow, do not replace `.github/workflows/deploy.yml`; this repository already uses the official Pages actions.

No `gh-pages` branch and no committed `dist/` directory are required.

## 4. Allow the required workflow permissions

The workflow declares least-privilege permissions explicitly:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

In **Settings → Actions → General → Workflow permissions**, confirm that repository or organization policy allows the workflow to read repository contents and request Pages plus OpenID Connect permissions. If an organization policy restricts those scopes, an administrator must allow them. The workflow does not need a separate personal access token.

If the `github-pages` environment has protection rules, approve the pending deployment when prompted. The default environment created by the Pages Actions flow is sufficient.

## 5. Deploy

A push to `main` triggers `.github/workflows/deploy.yml`. You can also start it manually from **Actions → Deploy to GitHub Pages → Run workflow**.

The job does the following:

1. Checks out the repository and sets up Node.js.
2. Runs `npm ci`.
3. Builds with `VITE_BASE_PATH=/Neiyako/`.
4. Configures Pages, uploads `dist/` as the Pages artifact, and deploys it.

Watch the run:

```sh
gh run list --workflow deploy.yml --limit 1
gh run watch
```

The deployment job's `page_url` is the authoritative URL reported by GitHub. Do not treat a green build job alone as a verified public deployment.

## 6. Verify the published site

Once the deployment job succeeds, open the URL reported in the workflow. The expected repository Pages address is:

```text
https://neiyako.github.io/Neiyako/
```

Verify all of the following before calling it live:

- The root document returns HTTP 200.
- The page renders the masthead, navigation, and all four project entries.
- Browser DevTools shows no failed JavaScript, CSS, font, or Three.js requests.
- The production HTML and asset requests use the `/Neiyako/` base path.
- A hard refresh works; there is no dependency on a local history fallback.
- The browser console and page-error logs are clear. A declared static fallback for unavailable WebGPU is acceptable; an unhandled runtime failure is not.

Useful checks:

```sh
curl -I -L https://neiyako.github.io/Neiyako/
curl -sL https://neiyako.github.io/Neiyako/ | grep -E '(src|href)="[^"]+"'
npm run validate:links
```

## 7. Update the README only after verification

The root README intentionally keeps the intended Pages address in inline code and does not present it as a live link. After the URL and asset paths have been verified:

1. Replace `` `https://neiyako.github.io/Neiyako/` `` with `[Open the interactive edition](https://neiyako.github.io/Neiyako/)`.
2. Change the interactive-edition status from pending to the verified live URL.
3. Run `npm run validate:links` and make sure it exits successfully.
4. Commit the README update and push it to `main`.

If any verification step fails, keep the address unlinked and record the actual failure in the deployment issue or commit notes.

## 8. Common failures

| Symptom | Check |
| --- | --- |
| Pages job is rejected | Settings → Pages source is set to GitHub Actions, and the repository policy allows Pages/OpenID Connect permissions. |
| Build fails on `npm ci` | Node version is supported by the project, and `package-lock.json` is committed and synchronized with `package.json`. |
| Page loads but assets 404 | The build used `VITE_BASE_PATH=/Neiyako/`, and the deployed URL is repository-scoped rather than a custom domain. |
| 3D canvas is blank | Check for an unhandled WebGPU/WebGL error and whether the static fallback state is visible. Do not claim the animation passed until the deployed console is checked. |
| README link check fails | Run `npm run validate:links`; the script reports the exact failing external URL and exits nonzero. |
