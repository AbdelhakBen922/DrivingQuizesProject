# Multi-stage Dockerfile for Laravel Backend

# Stage 1: Composer dependencies
FROM composer:2.7 AS composer-env
ARG SKIP_COMPOSER_INSTALL=false
ENV COMPOSER_ALLOW_SUPERUSER=1 \
        COMPOSER_PROCESS_TIMEOUT=1800 \
        COMPOSER_MEMORY_LIMIT=-1
COPY composer.json composer.lock /app/
WORKDIR /app
# Allow skipping composer install (use local vendor instead) to avoid network during builds
RUN if [ "$SKIP_COMPOSER_INSTALL" = "true" ]; then \
            mkdir -p /app/vendor; \
        else \
            composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts; \
        fi

# Stage 2: Production environment
FROM php:8.2-fpm-alpine AS production

# Install system dependencies and PHP extensions
# Install system dependencies and PHP extensions
RUN apk add --no-cache \
        nginx \
        supervisor \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        postgresql-dev \
        mysql-client \
        bash \
        coreutils \
        autoconf \
        g++ \
        make \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        pdo_pgsql \
        mbstring \
        zip \
        exif \
        pcntl \
        bcmath \
        gd \
        intl \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf g++ make



# Install tools needed to run Composer in the final image
RUN apk add --no-cache --virtual .composer-deps \
    curl \
    bash \
    openssl \
    ca-certificates \
    unzip \
    && php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');" \
    && php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --quiet \
    && composer --version \
    && rm -f /tmp/composer-setup.php

# Install Redis PHP extension via PECL (requires build tools)
RUN set -eux; \
    if php -m | grep -qi '^redis$'; then \
        echo 'redis extension already loaded, skipping PECL install'; \
    else \
        apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers; \
        pecl channel-update pecl.php.net; \
        printf "\n" | pecl install -o -f redis; \
        docker-php-ext-enable redis; \
        apk del .build-deps; \
    fi


# Set working directory
WORKDIR /var/www/html

# Copy application files first
COPY . /var/www/html

# Bring in vendor from composer stage into a temp location
COPY --from=composer-env /app/vendor /tmp_vendor

# Prefer local vendor (if provided in context); otherwise use composer-built vendor
RUN if [ -d "/var/www/html/vendor" ] && [ "$(ls -A /var/www/html/vendor || true)" ]; then \
            echo "Using local vendor from build context"; \
        else \
            rm -rf /var/www/html/vendor && mkdir -p /var/www/html/vendor && cp -a /tmp_vendor/. /var/www/html/vendor/; \
        fi

# Copy configuration files
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini


# Note: autoload was generated in the composer stage; no composer binary is required in the final image

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create necessary directories
RUN mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/cache \
    && chown -R www-data:www-data /var/www/html/storage

# Ensure supervisor log directory exists so supervisord can write logs
RUN mkdir -p /var/log/supervisor \
    && touch /var/log/supervisor/supervisord.log \
    && chown -R root:root /var/log/supervisor \
    && chmod 755 /var/log/supervisor

# Expose port 80
EXPOSE 80

# Start supervisor (manages nginx and php-fpm)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
