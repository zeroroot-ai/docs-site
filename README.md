# docs-site

The customer documentation site, built with Next.js and served from a container off-cluster (ADR-0077).

## Container image

The image runs nginx as uid 101 on port 8080. It runs with a read-only root filesystem.

The image ships the built site at `/opt/docs-site/html` and never writes there. At start, `docker/40-substitute-origins.sh` copies the site into `/usr/share/nginx/html`. Then it writes the `APP_ORIGIN` and `WWW_ORIGIN` values of the environment into the copy. With no value, the script uses the production origins.

With a read-only root filesystem, mount a writable empty directory (a Kubernetes `emptyDir`) at each of these paths:

| Path | Writer |
|---|---|
| `/usr/share/nginx/html` | `40-substitute-origins.sh` writes the site copy. |
| `/etc/nginx/conf.d` | `20-envsubst-on-templates.sh` writes `default.conf`. |
| `/tmp` | nginx writes its PID file and its temporary files. |

## License and history

Elastic License 2.0. See [LICENSE](LICENSE). Zero Root AI is the licensor.

This repository started from a fresh baseline on 2026-09-06. Issue and pull request numbers cited in comments and documents dated before that refer to the tracker before the history reset, archived offline. They do not resolve on GitHub.
