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

COPY --from=composer:2 \
    /usr/bin/composer \
    /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --prefer-dist

COPY . .

RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

RUN composer dump-autoload \
    --no-dev \
    --optimize \
    --no-interaction

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

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -i \
    's/Listen 80/Listen 10000/' \
    /etc/apache2/ports.conf

RUN echo "ServerName localhost" \
    >> /etc/apache2/apache2.conf

RUN sed -i \
    's/:80>/:10000>/' \
    /etc/apache2/sites-available/000-default.conf

EXPOSE 10000

CMD ["apache2-foreground"]
