"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230103184010 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230103184010 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
        this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
        this.addSql('alter table "post" alter column "title" type text using ("title"::text);');
    }
    async down() {
        this.addSql('drop table if exists "user" cascade;');
        this.addSql('alter table "post" alter column "title" type varchar(255) using ("title"::varchar(255));');
    }
}
exports.Migration20230103184010 = Migration20230103184010;
//# sourceMappingURL=Migration20230103184010.js.map