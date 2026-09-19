using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerAdvisor.Api.Migrations
{
    /// <inheritdoc />
    public partial class ExtendAdminsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The admins table already exists in the deployed database, created by
            // an earlier migration that is not present in this repository, and it
            // already holds a live administrator. So this extends the table in
            // place rather than creating it — and stays correct on a fresh
            // database, where the create runs and every alter is then a no-op.
            migrationBuilder.Sql(@"
                create table if not exists admins (
                    user_id    uuid                     not null primary key,
                    email      varchar                  not null,
                    is_active  boolean                  not null default true,
                    created_at timestamp with time zone not null default now()
                );

                alter table admins add column if not exists display_name       text;
                alter table admins add column if not exists granted_at         timestamp with time zone not null default now();
                alter table admins add column if not exists granted_by_user_id uuid;
                alter table admins add column if not exists granted_by_email   text;
                alter table admins add column if not exists granted_via        text not null default 'granted';
                alter table admins add column if not exists revoked_at         timestamp with time zone;
                alter table admins add column if not exists revoked_by_user_id uuid;
                alter table admins add column if not exists note               text;
                alter table admins add column if not exists last_seen_at       timestamp with time zone;

                -- Existing rows pre-date the audit columns; say so rather than
                -- leaving a blank that reads as 'granted by nobody, just now'.
                update admins
                   set granted_via = 'pre-existing',
                       note = coalesce(note, 'Created before the admin audit columns existed.')
                 where granted_via = 'granted' and note is null;

                create index if not exists ix_admins_is_active on admins (is_active);
                create index if not exists ix_admins_email     on admins (email);

                alter table admins enable row level security;
            ");

            // Anyone already flagged admin in user_roles becomes a real admin row,
            // so moving the authority from that table to this one cannot lock an
            // existing administrator out.
            migrationBuilder.Sql(@"
                insert into admins (user_id, email, is_active, created_at, granted_at, granted_via, note)
                select r.user_id, coalesce(u.email, ''), true, now(), now(), 'migrated',
                       'Carried over from user_roles.'
                  from user_roles r
                  left join auth.users u on u.id = r.user_id
                 where r.role = 'admin'
                on conflict (user_id) do nothing;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Only the columns this migration added are dropped. The table and its
            // original four columns pre-date this migration and are left alone.
            migrationBuilder.Sql(@"
                alter table admins drop column if exists display_name;
                alter table admins drop column if exists granted_at;
                alter table admins drop column if exists granted_by_user_id;
                alter table admins drop column if exists granted_by_email;
                alter table admins drop column if exists granted_via;
                alter table admins drop column if exists revoked_at;
                alter table admins drop column if exists revoked_by_user_id;
                alter table admins drop column if exists note;
                alter table admins drop column if exists last_seen_at;
            ");
        }
    }
}
