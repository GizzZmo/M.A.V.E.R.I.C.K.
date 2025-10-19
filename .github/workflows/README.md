# GitHub Actions Workflows

This directory contains the CI/CD workflows for M.A.V.E.R.I.C.K.

## Workflows

### 1. Build and Deploy (`build-and-deploy.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs:**
- **Build**: Compiles the application on Node.js 18.x and 20.x
  - Installs dependencies
  - Builds the application
  - Creates build artifacts (dist folder)
  - Archives builds as `.tar.gz` and `.zip`
  - Uploads artifacts for 30 days

- **Test**: Runs linting and tests (if available)
  - Runs after successful build
  - Executes `npm run lint` (if present)
  - Executes `npm test` (if present)

- **Deploy Preview**: Creates preview for pull requests
  - Downloads build artifacts
  - Comments on PR with build status

**Artifacts:**
- `dist-artifacts`: Raw build files
- `archived-builds`: Compressed `.tar.gz` and `.zip` archives

### 2. Release (`release.yml`)

**Triggers:**
- Push of tags matching `v*.*.*` (e.g., `v1.0.0`)
- Manual workflow dispatch with tag input

**Jobs:**
- **Create Release**: Builds and publishes GitHub releases
  - Checks out code with full history
  - Builds the application
  - Creates versioned archives
  - Generates SHA256 checksums
  - Creates changelog from git commits
  - Publishes GitHub release with assets
  - Uploads artifacts for 90 days

**Release Assets:**
- `maverick-{version}.tar.gz`: Compressed tarball
- `maverick-{version}.zip`: Zip archive
- `checksums.txt`: SHA256 checksums for verification

**Creating a Release:**
```bash
# Tag your commit
git tag v1.0.0
git push origin v1.0.0

# Or use GitHub's release interface
# Or trigger manually via Actions tab
```

### 3. Scheduled Build (`scheduled-build.yml`)

**Triggers:**
- Weekly on Mondays at 9:00 AM UTC
- Manual workflow dispatch

**Jobs:**
- **Health Check**: Ensures project remains buildable
  - Checks for outdated dependencies
  - Runs a complete build
  - Generates build health report
  - Creates GitHub issue on failure

**Artifacts:**
- `health-check-report-{run_number}`: Build health report

## Artifact Retention

| Workflow | Artifact Type | Retention Period |
|----------|--------------|------------------|
| Build and Deploy | Build artifacts | 30 days |
| Release | Release assets | 90 days |
| Scheduled Build | Health reports | 30 days |

## Permissions

The workflows require the following permissions:
- `contents: write` - For creating releases (Release workflow)
- `issues: write` - For commenting on PRs and creating issues (implied by default)

## Usage Examples

### Downloading Build Artifacts

1. Go to the Actions tab in GitHub
2. Select the workflow run
3. Scroll to "Artifacts" section
4. Download the desired artifact

### Creating a New Release

**Via Git Tags:**
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

**Via GitHub Interface:**
1. Go to "Releases" tab
2. Click "Draft a new release"
3. Create and select a new tag (e.g., `v1.0.0`)
4. Publish the release
5. Workflow will automatically run

### Monitoring Build Health

The scheduled build runs automatically, but you can:
1. Trigger it manually from Actions tab
2. Check weekly build reports in Artifacts
3. Monitor issues created on failures

## Troubleshooting

### Build Fails on CI but Works Locally

- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify no local environment variables are required

### Release Workflow Doesn't Trigger

- Ensure tag matches pattern `v*.*.*`
- Check tag was pushed to remote: `git push origin --tags`
- Verify workflow file syntax

### Artifacts Not Appearing

- Check if workflow completed successfully
- Verify artifact retention period hasn't expired
- Ensure upload step succeeded in workflow logs

## Customization

To modify these workflows:
1. Edit the YAML files in this directory
2. Test changes on a feature branch
3. Verify in Actions tab before merging

For more information, see [GitHub Actions Documentation](https://docs.github.com/en/actions).
