#!/bin/bash

apt-get update -qq && apt-get install -y cron

echo "0 * * * * pg_dump -h db -U $DB_USER -d $DB_NAME -f /backups/backup_\$(date +\%Y\%m\%d_\%H\%M\%S).sql >> /var/log/backup.log 2>&1" > /etc/cron.d/backup

chmod 0644 /etc/cron.d/backup

cron -f