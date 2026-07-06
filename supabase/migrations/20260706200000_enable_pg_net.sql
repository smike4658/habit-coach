-- pg_net: HTTP volání z Postgresu — potřebuje ho cron (Dashboard → Integrations → Cron)
-- pro spouštění Edge Functions (sync-plans, sync-log).
create extension if not exists pg_net;
