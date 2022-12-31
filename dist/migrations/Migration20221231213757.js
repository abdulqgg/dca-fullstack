"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20221231213757 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20221231213757 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null);');
    }
    async down() {
        this.addSql('drop table if exists "post" cascade;');
    }
}
exports.Migration20221231213757 = Migration20221231213757;
//# sourceMappingURL=Migration20221231213757.js.map