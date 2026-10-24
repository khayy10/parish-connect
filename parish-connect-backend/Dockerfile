
FROM php:8.3-apache

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        -o Dpkg::Options::="--force-confdef" \
        -o Dpkg::Options::="--force-confold" \
        git \
        unzip \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        bcmath \
        zip \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN test -s /usr/local/bin/composer \
    && php /usr/local/bin/composer --version

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN php /usr/local/bin/composer --version


RUN echo "=== COMPOSER DIAGNOSTICS ===" \
    && php -v \
    && php /usr/local/bin/composer --version \
    && php /usr/local/bin/composer config vendor-dir --absolute \
    && echo "=== INSTALLING DEPENDENCIES ===" \
    && php /usr/local/bin/composer install \
        --no-dev \
        --no-interaction \
        --no-scripts \
        --prefer-dist \
        --optimize-autoloader \
        -vvv \
    && echo "=== CHECKING VENDOR ===" \
    && ls -la /var/www/html \
    && ls -la /var/www/html/vendor \
    && test -f /var/www/html/vendor/autoload.php

COPY . .


RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

RUN php /usr/local/bin/composer dump-autoload \
    --no-dev \
    --optimize \
    --no-interaction \
    --no-scripts \
    && test -f /var/www/html/vendor/autoload.php

RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

RUN chmod -R 775 \
    storage \
    bootstrap/cache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri \
    -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

RUN printf '<Directory /var/www/html/public>\nAllowOverride All\nRequire all granted\n</Directory>\n' \
    > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

RUN sed -i \
    's/Listen 80/Listen 10000/' \
    /etc/apache2/ports.conf

RUN sed -i \
    's/:80>/:10000>/' \
    /etc/apache2/sites-available/000-default.conf

RUN echo "ServerName localhost" \
    >> /etc/apache2/apache2.conf

# Fail the Docker build early if Laravel's Apache rewrite entry point is missing.
RUN test -f /var/www/html/public/.htaccess && apache2ctl -t

EXPOSE 10000

CMD ["sh", "-c", "if [ \"$MIGRATE_ON_START\" = \"true\" ]; then php artisan migrate --force || exit 1; fi; if [ \"$BOOTSTRAP_PRIEST_ON_START\" = \"true\" ]; then php artisan db:seed --class=StaffSeeder --force || exit 1; fi; exec apache2-foreground"]
