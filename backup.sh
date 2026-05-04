#!/bin/bash
sleep 20
pg_dump -h db -U $DB_USER -d $DB_NAME -f /backups/backup_$(date +%Y%m%d_%H%M%S).sql
echo "Backup complete"