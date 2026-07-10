# Deploying members.mementomori.social

This is a static site: plain HTML, self-hosted fonts, no build step. It is served by
nginx and proxied through Cloudflare. No credentials live in this repository.

## Deploy

Sync the site files to the web server's document root, for example:

    rsync -az --delete \
      --exclude='.git' --exclude='.github' --exclude='README.md' --exclude='DEPLOY.md' \
      ./ <user>@<server>:<webroot>/

nginx serves the files directly, so no build or service restart is needed for content
changes. Update the files, sync, done.

## nginx

A minimal server block is enough:

    server {
        listen 80;
        server_name members.mementomori.social;
        root <webroot>;
        index index.html;
        location / { try_files $uri $uri/ =404; }
    }

## Notes

- TLS is terminated at Cloudflare; keep the Cloudflare proxy enabled for the domain.
- The site is fully static, so any static host or CDN can serve it as-is.
