# Railway image: serves only the static site (index.html, css, js, assets) with Caddy on Railway's $PORT.
FROM caddy:2.8-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html /srv/
COPY css /srv/css
COPY js /srv/js
COPY assets /srv/assets
